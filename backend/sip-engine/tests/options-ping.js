/**
 * Test: OPTIONS Ping
 * Tests SIP OPTIONS keepalive/ping
 */

import { SIPTestEngine } from '../src/test-engine.js';

const config = {
  localIP: '0.0.0.0',
  localPort: 5060,
  transport: 'UDP'
};

const endpoint = {
  host: process.env.SIP_HOST || 'sip.example.com',
  port: parseInt(process.env.SIP_PORT || '5060'),
  domain: process.env.SIP_DOMAIN || 'sip.example.com',
  username: process.env.SIP_USERNAME || 'test'
};

async function run() {
  console.log('Starting OPTIONS Ping Test...\n');
  console.log('Configuration:', config);
  console.log('Endpoint:', endpoint);

  const engine = new SIPTestEngine(config);
  
  try {
    await engine.init();
    await engine.testOPTIONSPing(endpoint);
    engine.printReport();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await engine.shutdown();
  }
}

run();
