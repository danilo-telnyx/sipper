/**
 * Test: Basic Call Flow
 * INVITE → 180 Ringing → 200 OK → ACK → BYE
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
  console.log('Starting Basic Call Flow Test...\n');
  console.log('Configuration:', config);
  console.log('Endpoint:', endpoint);

  const engine = new SIPTestEngine(config);
  
  try {
    await engine.init();
    await engine.testBasicCallFlow(endpoint);
    engine.printReport();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await engine.shutdown();
  }
}

run();
