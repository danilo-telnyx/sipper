/**
 * Simple SIP Test Example
 * Demonstrates basic usage of SIPPER
 */

import { SIPTestEngine } from '../src/test-engine.js';
import { TelnyxIntegration } from '../src/telnyx-integration.js';

async function runSimpleTest() {
  console.log('🧪 Simple SIPPER Test\n');

  // Configuration
  const config = {
    localIP: '0.0.0.0',
    localPort: 5060,
    transport: 'UDP',
    timeout: 5000
  };

  // Endpoint (using public SIP test server)
  const endpoint = {
    host: 'sip.example.com',  // Replace with your SIP server
    port: 5060,
    domain: 'sip.example.com',
    username: 'test'
  };

  // Create test engine
  const engine = new SIPTestEngine(config);

  try {
    // Initialize
    await engine.init();
    console.log('✓ SIP client initialized\n');

    // Run OPTIONS ping
    console.log('Testing OPTIONS ping...');
    await engine.testOPTIONSPing(endpoint);

    // Print results
    engine.printReport();

    // Get JSON report
    const report = engine.generateReport();
    console.log('\n📊 Summary:');
    console.log(`  Tests run: ${report.summary.totalTests}`);
    console.log(`  Passed: ${report.summary.passedTests}`);
    console.log(`  Pass rate: ${report.summary.passRate}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await engine.shutdown();
    console.log('\n✓ Test complete');
  }
}

// Run the test
runSimpleTest();
