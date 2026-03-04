/**
 * Run All Tests
 * Comprehensive test suite
 */

import { SIPTestEngine } from '../src/test-engine.js';

const config = {
  localIP: '0.0.0.0',
  localPort: 5060,
  transport: 'UDP',
  username: process.env.SIP_USERNAME || 'test',
  domain: process.env.SIP_DOMAIN || 'sip.example.com'
};

const endpoint = {
  host: process.env.SIP_HOST || 'sip.example.com',
  port: parseInt(process.env.SIP_PORT || '5060'),
  domain: process.env.SIP_DOMAIN || 'sip.example.com',
  username: process.env.SIP_USERNAME || 'test',
  password: process.env.SIP_PASSWORD || '',
  targetUser: process.env.SIP_TARGET_USER || 'echo'
};

async function run() {
  console.log('🚀 SIPPER - SIP Testing Engine');
  console.log('Running Full Test Suite\n');
  console.log('Configuration:', config);
  console.log('Endpoint:', endpoint);
  console.log('\n' + '='.repeat(60) + '\n');

  const engine = new SIPTestEngine(config);
  
  try {
    await engine.init();

    // Run all tests
    await engine.testOPTIONSPing(endpoint);
    await engine.testAuthChallenge(endpoint);
    await engine.testREGISTER(endpoint);
    await engine.testErrorHandling(endpoint);
    
    // Basic call flow (might timeout on test server)
    // await engine.testBasicCallFlow(endpoint);

    // Print results
    engine.printReport();

    // Export report as JSON
    const report = engine.generateReport();
    console.log('\n📄 JSON Report:\n');
    console.log(JSON.stringify(report, null, 2));

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    await engine.shutdown();
  }
}

run();
