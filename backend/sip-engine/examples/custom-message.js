/**
 * Custom SIP Message Example
 * Demonstrates building and sending custom SIP messages
 */

import { SIPMessageBuilder } from '../src/sip-message-builder.js';
import { SIPParser } from '../src/sip-parser.js';
import { SIPClient } from '../src/sip-client.js';

async function customMessageExample() {
  console.log('🔧 Custom SIP Message Example\n');

  // Create message builder
  const builder = new SIPMessageBuilder({
    localIP: '192.168.1.100',
    localPort: 5060,
    userAgent: 'CustomApp/1.0'
  });

  // Build INVITE with custom headers
  const { message, metadata } = builder.buildINVITE({
    fromUser: 'alice',
    fromDomain: 'example.com',
    toUser: 'bob',
    toDomain: 'example.com',
    sdp: true,
    extraHeaders: {
      'X-Custom-Header': 'MyValue',
      'P-Asserted-Identity': '<sip:alice@example.com>'
    }
  });

  console.log('📤 Built INVITE message:');
  console.log('─'.repeat(60));
  console.log(message);
  console.log('─'.repeat(60));
  console.log('\n📋 Metadata:', metadata);

  // Parse the message
  console.log('\n🔍 Parsing message...');
  const parsed = SIPParser.parse(message);
  
  console.log('\nParsed result:');
  console.log('  Type:', parsed.type);
  console.log('  Method:', parsed.method);
  console.log('  Call-ID:', parsed.callId);
  console.log('  CSeq:', parsed.cseq);
  console.log('  From:', parsed.from.uri);
  console.log('  To:', parsed.to.uri);

  // Validate RFC3261 compliance
  console.log('\n✅ Validating RFC3261 compliance...');
  const compliance = SIPParser.validateRFC3261(parsed);
  
  if (compliance.compliant) {
    console.log('  ✓ Message is RFC3261 compliant');
  } else {
    console.log('  ✗ Violations found:');
    compliance.violations.forEach(v => console.log(`    - ${v}`));
  }

  // Example: Send the message (requires valid endpoint)
  /*
  const client = new SIPClient({ localIP: '0.0.0.0', localPort: 5060 });
  await client.listen();
  
  const response = await client.sendAndWait(
    message,
    'sip.example.com',
    5060
  );
  
  console.log('Response:', response.parsed.statusCode);
  await client.close();
  */

  console.log('\n✓ Example complete');
}

// Run example
customMessageExample();
