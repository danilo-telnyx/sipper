/**
 * SIP Test Engine
 * Orchestrates test scenarios and collects results
 */

import { SIPMessageBuilder } from './sip-message-builder.js';
import { SIPParser } from './sip-parser.js';
import { SIPClient } from './sip-client.js';

export class SIPTestEngine {
  constructor(config = {}) {
    this.config = config;
    this.client = new SIPClient({
      localIP: config.localIP,
      localPort: config.localPort,
      transport: config.transport || 'UDP',
      timeout: config.timeout || 10000
    });
    this.builder = new SIPMessageBuilder({
      localIP: config.localIP,
      localPort: config.localPort,
      userAgent: config.userAgent || 'SIPPER/1.0'
    });
    this.results = [];
  }

  /**
   * Initialize the test engine
   */
  async init() {
    await this.client.listen();
    console.log(`✓ SIP Client listening on ${this.config.localIP}:${this.config.localPort}`);
  }

  /**
   * Shutdown the test engine
   */
  async shutdown() {
    await this.client.close();
    console.log('✓ SIP Client closed');
  }

  /**
   * Run a test scenario
   */
  async runTest(testName, testFunction) {
    console.log(`\n▶ Running test: ${testName}`);
    const startTime = Date.now();
    
    const result = {
      testName,
      startTime: new Date(startTime).toISOString(),
      endTime: null,
      duration: null,
      passed: false,
      messages: [],
      errors: [],
      violations: [],
      metrics: {}
    };

    try {
      await testFunction(result);
      result.passed = result.errors.length === 0;
      result.endTime = new Date().toISOString();
      result.duration = Date.now() - startTime;
      
      if (result.passed) {
        console.log(`✓ Test passed: ${testName} (${result.duration}ms)`);
      } else {
        console.log(`✗ Test failed: ${testName}`);
        result.errors.forEach(err => console.log(`  - ${err}`));
      }
    } catch (error) {
      result.passed = false;
      result.errors.push(error.message);
      result.endTime = new Date().toISOString();
      result.duration = Date.now() - startTime;
      console.log(`✗ Test failed with exception: ${testName}`);
      console.log(`  Error: ${error.message}`);
    }

    this.results.push(result);
    return result;
  }

  /**
   * Test: OPTIONS ping
   */
  async testOPTIONSPing(endpoint) {
    return this.runTest('OPTIONS Ping', async (result) => {
      const { message, metadata } = this.builder.buildOPTIONS({
        fromUser: this.config.username || 'sipper',
        fromDomain: this.config.domain || 'test.local',
        toUser: endpoint.username || 'test',
        toDomain: endpoint.domain
      });

      result.messages.push({ direction: 'out', method: 'OPTIONS', message });

      const response = await this.client.sendAndWait(
        message,
        endpoint.host,
        endpoint.port
      );

      result.messages.push({ 
        direction: 'in', 
        statusCode: response.parsed.statusCode,
        message: response.parsed 
      });

      result.metrics.responseTime = response.responseTime;

      // Validate response
      if (!response.parsed.valid) {
        result.errors.push('Invalid SIP response received');
      }

      if (response.parsed.statusCode < 200 || response.parsed.statusCode >= 700) {
        result.errors.push(`Unexpected status code: ${response.parsed.statusCode}`);
      }

      // Check RFC3261 compliance
      const compliance = SIPParser.validateRFC3261(response.parsed);
      if (!compliance.compliant) {
        result.violations.push(...compliance.violations);
      }
    });
  }

  /**
   * Test: REGISTER
   */
  async testREGISTER(endpoint) {
    return this.runTest('REGISTER', async (result) => {
      const { message, metadata } = this.builder.buildREGISTER({
        username: endpoint.username,
        domain: endpoint.domain,
        expires: 3600
      });

      result.messages.push({ direction: 'out', method: 'REGISTER', message });

      const response = await this.client.sendAndWait(
        message,
        endpoint.host,
        endpoint.port
      );

      result.messages.push({ 
        direction: 'in', 
        statusCode: response.parsed.statusCode,
        message: response.parsed 
      });

      result.metrics.responseTime = response.responseTime;

      // Check if auth required
      if (response.parsed.statusCode === 401 || response.parsed.statusCode === 407) {
        result.metrics.authRequired = true;
        
        // Parse auth header
        const authHeader = response.parsed.headers['WWW-Authenticate'] || 
                          response.parsed.headers['Proxy-Authenticate'];
        
        if (authHeader) {
          const authParams = SIPParser.parseAuthHeader(authHeader);
          result.metrics.authScheme = authParams.scheme;
          result.metrics.realm = authParams.realm;

          // If credentials provided, send authenticated REGISTER
          if (endpoint.password) {
            const authHeaderValue = this.builder.buildAuthorizationHeader({
              username: endpoint.username,
              password: endpoint.password,
              realm: authParams.realm,
              nonce: authParams.nonce,
              uri: `sip:${endpoint.domain}`,
              method: 'REGISTER',
              qop: authParams.qop || null,  // Explicitly pass null if not provided
              opaque: authParams.opaque || null,
              algorithm: authParams.algorithm || 'MD5'
            });

            const { message: authMessage } = this.builder.buildREGISTER({
              username: endpoint.username,
              domain: endpoint.domain,
              expires: 3600,
              extraHeaders: {
                'Authorization': authHeaderValue
              }
            });

            result.messages.push({ 
              direction: 'out', 
              method: 'REGISTER (with auth)', 
              message: authMessage 
            });

            const authResponse = await this.client.sendAndWait(
              authMessage,
              endpoint.host,
              endpoint.port
            );

            result.messages.push({ 
              direction: 'in', 
              statusCode: authResponse.parsed.statusCode,
              message: authResponse.parsed 
            });

            result.metrics.authResponseTime = authResponse.responseTime;

            if (authResponse.parsed.statusCode !== 200) {
              result.errors.push(`Authentication failed: ${authResponse.parsed.statusCode}`);
            }
          }
        }
      } else if (response.parsed.statusCode !== 200) {
        result.errors.push(`Registration failed: ${response.parsed.statusCode}`);
      }

      // Check RFC3261 compliance
      const compliance = SIPParser.validateRFC3261(response.parsed);
      if (!compliance.compliant) {
        result.violations.push(...compliance.violations);
      }
    });
  }

  /**
   * Test: Basic call flow (INVITE → 180 → 200 → ACK → BYE)
   */
  async testBasicCallFlow(endpoint) {
    return this.runTest('Basic Call Flow', async (result) => {
      let callId, cseq, fromTag, toTag, branch;

      // Step 1: Send INVITE
      const inviteMsg = this.builder.buildINVITE({
        fromUser: endpoint.username,
        fromDomain: endpoint.domain,
        toUser: endpoint.targetUser || 'echo',
        toDomain: endpoint.domain,
        sdp: true
      });

      callId = inviteMsg.metadata.callId;
      cseq = inviteMsg.metadata.cseq;
      fromTag = inviteMsg.metadata.fromTag;
      branch = inviteMsg.metadata.branch;

      result.messages.push({ direction: 'out', method: 'INVITE', message: inviteMsg.message });

      const inviteResponse = await this.client.sendAndWait(
        inviteMsg.message,
        endpoint.host,
        endpoint.port,
        { timeout: 15000 } // Longer timeout for call setup
      );

      result.messages.push({ 
        direction: 'in', 
        statusCode: inviteResponse.parsed.statusCode,
        message: inviteResponse.parsed 
      });

      result.metrics.inviteResponseTime = inviteResponse.responseTime;

      // Handle provisional responses (180 Ringing, 183 Progress)
      if (inviteResponse.parsed.statusCode >= 100 && inviteResponse.parsed.statusCode < 200) {
        result.metrics.provisionalResponse = inviteResponse.parsed.statusCode;
        // In real scenario, we'd wait for 200 OK
        // For testing, we'll simulate timeout or cancellation
        result.errors.push('Call not answered (provisional response only)');
        return;
      }

      // Check for authentication
      if (inviteResponse.parsed.statusCode === 401 || inviteResponse.parsed.statusCode === 407) {
        result.errors.push('Authentication required for INVITE (not implemented in basic flow)');
        return;
      }

      // Expect 200 OK
      if (inviteResponse.parsed.statusCode !== 200) {
        result.errors.push(`INVITE failed: ${inviteResponse.parsed.statusCode}`);
        return;
      }

      // Extract To tag from response
      toTag = inviteResponse.parsed.to.params.tag;

      // Step 2: Send ACK
      const ackMsg = this.builder.buildACK({
        fromUser: endpoint.username,
        fromDomain: endpoint.domain,
        toUser: endpoint.targetUser || 'echo',
        toDomain: endpoint.domain,
        callId,
        cseq,
        fromTag,
        toTag
      });

      result.messages.push({ direction: 'out', method: 'ACK', message: ackMsg.message });

      await this.client.send(ackMsg.message, endpoint.host, endpoint.port);

      // Wait a moment (simulating call duration)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Send BYE
      const byeMsg = this.builder.buildBYE({
        fromUser: endpoint.username,
        fromDomain: endpoint.domain,
        toUser: endpoint.targetUser || 'echo',
        toDomain: endpoint.domain,
        callId,
        fromTag,
        toTag
      });

      result.messages.push({ direction: 'out', method: 'BYE', message: byeMsg.message });

      const byeResponse = await this.client.sendAndWait(
        byeMsg.message,
        endpoint.host,
        endpoint.port
      );

      result.messages.push({ 
        direction: 'in', 
        statusCode: byeResponse.parsed.statusCode,
        message: byeResponse.parsed 
      });

      result.metrics.byeResponseTime = byeResponse.responseTime;

      if (byeResponse.parsed.statusCode !== 200) {
        result.errors.push(`BYE failed: ${byeResponse.parsed.statusCode}`);
      }

      // Validate all responses for RFC3261 compliance
      for (const msg of result.messages.filter(m => m.direction === 'in')) {
        const compliance = SIPParser.validateRFC3261(msg.message);
        if (!compliance.compliant) {
          result.violations.push(...compliance.violations);
        }
      }
    });
  }

  /**
   * Test: Authentication challenge
   */
  async testAuthChallenge(endpoint) {
    return this.runTest('Authentication Challenge', async (result) => {
      // Send unauthenticated REGISTER
      const { message } = this.builder.buildREGISTER({
        username: endpoint.username,
        domain: endpoint.domain
      });

      result.messages.push({ direction: 'out', method: 'REGISTER', message });

      const response = await this.client.sendAndWait(
        message,
        endpoint.host,
        endpoint.port
      );

      result.messages.push({ 
        direction: 'in', 
        statusCode: response.parsed.statusCode,
        message: response.parsed 
      });

      // Expect 401 or 407
      if (response.parsed.statusCode !== 401 && response.parsed.statusCode !== 407) {
        result.errors.push(`Expected auth challenge (401/407), got ${response.parsed.statusCode}`);
        return;
      }

      result.metrics.challengeType = response.parsed.statusCode === 401 ? 'WWW-Authenticate' : 'Proxy-Authenticate';

      // Parse challenge
      const authHeader = response.parsed.headers['WWW-Authenticate'] || 
                        response.parsed.headers['Proxy-Authenticate'];
      
      if (!authHeader) {
        result.errors.push('Auth challenge missing WWW-Authenticate/Proxy-Authenticate header');
        return;
      }

      const authParams = SIPParser.parseAuthHeader(authHeader);
      result.metrics.authScheme = authParams.scheme;
      result.metrics.realm = authParams.realm;
      result.metrics.algorithm = authParams.algorithm;
      result.metrics.qop = authParams.qop;

      // Validate auth parameters
      if (authParams.scheme !== 'Digest') {
        result.errors.push(`Unexpected auth scheme: ${authParams.scheme}`);
      }

      if (!authParams.nonce) {
        result.errors.push('Missing nonce in auth challenge');
      }
    });
  }

  /**
   * Test: Error response handling
   */
  async testErrorHandling(endpoint) {
    return this.runTest('Error Response Handling', async (result) => {
      // Send INVITE to non-existent user
      const { message } = this.builder.buildINVITE({
        fromUser: endpoint.username,
        fromDomain: endpoint.domain,
        toUser: 'nonexistent-user-' + Date.now(),
        toDomain: endpoint.domain,
        sdp: true
      });

      result.messages.push({ direction: 'out', method: 'INVITE', message });

      const response = await this.client.sendAndWait(
        message,
        endpoint.host,
        endpoint.port,
        { timeout: 10000 }
      );

      result.messages.push({ 
        direction: 'in', 
        statusCode: response.parsed.statusCode,
        message: response.parsed 
      });

      result.metrics.statusCode = response.parsed.statusCode;
      result.metrics.reasonPhrase = response.parsed.reasonPhrase;

      // Expect 4xx error
      if (response.parsed.statusCode < 400 || response.parsed.statusCode >= 600) {
        result.errors.push(`Expected 4xx error, got ${response.parsed.statusCode}`);
      }

      // Common error codes: 404 Not Found, 480 Temporarily Unavailable, 486 Busy Here
      const validErrorCodes = [404, 480, 486, 487, 603];
      if (!validErrorCodes.includes(response.parsed.statusCode)) {
        result.metrics.unexpectedErrorCode = true;
      }

      // Check RFC3261 compliance
      const compliance = SIPParser.validateRFC3261(response.parsed);
      if (!compliance.compliant) {
        result.violations.push(...compliance.violations);
      }
    });
  }

  /**
   * Generate detailed report
   */
  generateReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalViolations = this.results.reduce((sum, r) => sum + r.violations.length, 0);

    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) + '%' : '0%',
        totalViolations
      },
      tests: this.results.map(r => ({
        name: r.testName,
        passed: r.passed,
        duration: r.duration + 'ms',
        errors: r.errors,
        violations: r.violations,
        metrics: r.metrics
      })),
      details: this.results
    };

    return report;
  }

  /**
   * Print report to console
   */
  printReport() {
    const report = this.generateReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('SIPPER TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passedTests}`);
    console.log(`Failed: ${report.summary.failedTests}`);
    console.log(`Pass Rate: ${report.summary.passRate}`);
    console.log(`RFC3261 Violations: ${report.summary.totalViolations}`);
    console.log('='.repeat(60));

    report.tests.forEach(test => {
      console.log(`\n${test.passed ? '✓' : '✗'} ${test.name} (${test.duration})`);
      
      if (test.errors.length > 0) {
        console.log('  Errors:');
        test.errors.forEach(err => console.log(`    - ${err}`));
      }

      if (test.violations.length > 0) {
        console.log('  RFC3261 Violations:');
        test.violations.forEach(v => console.log(`    - ${v}`));
      }

      if (Object.keys(test.metrics).length > 0) {
        console.log('  Metrics:');
        Object.entries(test.metrics).forEach(([key, value]) => {
          console.log(`    ${key}: ${value}`);
        });
      }
    });

    console.log('\n' + '='.repeat(60));
  }
}
