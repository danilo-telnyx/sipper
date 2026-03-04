/**
 * Test: Telnyx Integration
 * Tests SIP connectivity with Telnyx endpoints
 */

import { SIPTestEngine } from '../src/test-engine.js';
import { TelnyxIntegration } from '../src/telnyx-integration.js';

// Load Telnyx credentials from environment
const telnyxConfig = {
  username: process.env.TELNYX_SIP_USERNAME || '',
  password: process.env.TELNYX_SIP_PASSWORD || '',
  region: process.env.TELNYX_REGION || 'us-east'
};

// Validate configuration
const validation = TelnyxIntegration.validateConnectionRequirements(telnyxConfig);
if (!validation.valid) {
  console.error('❌ Invalid Telnyx configuration:');
  validation.issues.forEach(issue => console.error(`  - ${issue}`));
  console.error('\nPlease set environment variables:');
  console.error('  export TELNYX_SIP_USERNAME="your-username"');
  console.error('  export TELNYX_SIP_PASSWORD="your-password"');
  console.error('  export TELNYX_REGION="us-east"  # optional');
  process.exit(1);
}

const endpoint = TelnyxIntegration.createCredentials(
  telnyxConfig.username,
  telnyxConfig.password,
  telnyxConfig.region
);

const config = {
  localIP: '0.0.0.0',
  localPort: 5060,
  transport: 'UDP',
  username: telnyxConfig.username,
  domain: 'sip.telnyx.com'
};

async function run() {
  console.log('🚀 Starting Telnyx Integration Tests...\n');
  console.log('Region:', telnyxConfig.region);
  console.log('Endpoint:', endpoint.description);
  console.log('Host:', endpoint.host);
  console.log('Username:', telnyxConfig.username);
  console.log('\n' + '='.repeat(60) + '\n');

  const engine = new SIPTestEngine(config);
  
  try {
    await engine.init();

    // Test 1: OPTIONS Ping
    console.log('\n📡 Test 1: OPTIONS Ping to Telnyx');
    await engine.testOPTIONSPing(endpoint);

    // Test 2: Authentication Challenge
    console.log('\n🔐 Test 2: Authentication Challenge');
    await engine.testAuthChallenge(endpoint);

    // Test 3: Registration
    console.log('\n📝 Test 3: SIP Registration');
    await engine.testREGISTER(endpoint);

    // Test 4: Error Handling
    console.log('\n❌ Test 4: Error Response Handling');
    await engine.testErrorHandling(endpoint);

    // Print comprehensive report
    engine.printReport();

    // Print Telnyx best practices
    console.log('\n' + '='.repeat(60));
    console.log('TELNYX BEST PRACTICES');
    console.log('='.repeat(60));
    const bestPractices = TelnyxIntegration.getBestPractices();
    console.log('\nRegistration:');
    console.log(`  Recommended Expires: ${bestPractices.registration.expiresRecommended}s`);
    console.log(`  Re-register before: ${bestPractices.registration.reregisterBefore}s`);
    console.log('\nKeepalive:');
    console.log(`  Method: ${bestPractices.keepalive.method}`);
    console.log(`  Interval: ${bestPractices.keepalive.intervalSeconds}s`);
    console.log('\nCodecs:');
    console.log(`  Recommended: ${bestPractices.codecs.recommended.join(', ')}`);
    console.log(`  DTMF: ${bestPractices.codecs.dtmf}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    await engine.shutdown();
  }
}

run();
