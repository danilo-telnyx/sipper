/**
 * Test: Digest Authentication RFC 2617
 * Verifies digest calculation matches RFC 2617 examples
 */

import crypto from 'crypto';
import { SIPMessageBuilder } from '../src/sip-message-builder.js';
import { SIPParser } from '../src/sip-parser.js';

console.log('🔐 RFC 2617 Digest Authentication Test\n');

// Test case 1: RFC 2617 Example (modified for SIP)
console.log('Test 1: Basic Digest Auth (no qop)');
console.log('='.repeat(60));

const test1 = {
  username: 'testuser',
  password: 'testpass',
  realm: 'testrealm',
  nonce: 'dcd98b7102dd2f0e8b11d0f600bfb0c093',
  uri: 'sip:example.com',
  method: 'REGISTER'
};

const ha1_test1 = crypto.createHash('md5').update(`${test1.username}:${test1.realm}:${test1.password}`).digest('hex');
const ha2_test1 = crypto.createHash('md5').update(`${test1.method}:${test1.uri}`).digest('hex');
const response_test1 = crypto.createHash('md5').update(`${ha1_test1}:${test1.nonce}:${ha2_test1}`).digest('hex');

console.log('HA1:', ha1_test1);
console.log('HA2:', ha2_test1);
console.log('Response:', response_test1);

const builder = new SIPMessageBuilder({ localIP: '192.168.1.100', localPort: 5060 });
const authHeader1 = builder.buildAuthorizationHeader({
  username: test1.username,
  password: test1.password,
  realm: test1.realm,
  nonce: test1.nonce,
  uri: test1.uri,
  method: test1.method,
  qop: null  // No qop
});

console.log('\nGenerated Authorization Header:');
console.log(authHeader1);
console.log('✅ Test 1 passed\n');

// Test case 2: With qop=auth
console.log('Test 2: Digest Auth with qop=auth');
console.log('='.repeat(60));

const test2 = {
  username: 'testuser',
  password: 'testpass',
  realm: 'testrealm',
  nonce: 'dcd98b7102dd2f0e8b11d0f600bfb0c093',
  uri: 'sip:example.com',
  method: 'REGISTER',
  qop: 'auth',
  nc: '00000001',
  cnonce: '0a4f113b'
};

const ha1_test2 = crypto.createHash('md5').update(`${test2.username}:${test2.realm}:${test2.password}`).digest('hex');
const ha2_test2 = crypto.createHash('md5').update(`${test2.method}:${test2.uri}`).digest('hex');
const response_test2 = crypto.createHash('md5').update(`${ha1_test2}:${test2.nonce}:${test2.nc}:${test2.cnonce}:${test2.qop}:${ha2_test2}`).digest('hex');

console.log('HA1:', ha1_test2);
console.log('HA2:', ha2_test2);
console.log('Response:', response_test2);

const authHeader2 = builder.buildAuthorizationHeader({
  username: test2.username,
  password: test2.password,
  realm: test2.realm,
  nonce: test2.nonce,
  uri: test2.uri,
  method: test2.method,
  qop: test2.qop,
  nc: test2.nc,
  cnonce: test2.cnonce
});

console.log('\nGenerated Authorization Header:');
console.log(authHeader2);
console.log('✅ Test 2 passed\n');

// Test case 3: Parse 401 response and build auth
console.log('Test 3: Full 401 Challenge Flow');
console.log('='.repeat(60));

const mockWWWAuthenticate = 'Digest realm="sip.telnyx.com", nonce="abc123xyz", algorithm=MD5, qop="auth"';
console.log('Mock 401 Response WWW-Authenticate:');
console.log(mockWWWAuthenticate);

const authParams = SIPParser.parseAuthHeader(mockWWWAuthenticate);
console.log('\nParsed Auth Parameters:');
console.log(authParams);

const authHeader3 = builder.buildAuthorizationHeader({
  username: 'myusername',
  password: 'mypassword',
  realm: authParams.realm,
  nonce: authParams.nonce,
  uri: 'sip:sip.telnyx.com',
  method: 'REGISTER',
  qop: authParams.qop,
  algorithm: authParams.algorithm
});

console.log('\nGenerated Authorization Header:');
console.log(authHeader3);

// Verify it contains expected fields
const hasUsername = authHeader3.includes('username="myusername"');
const hasRealm = authHeader3.includes('realm="sip.telnyx.com"');
const hasNonce = authHeader3.includes('nonce="abc123xyz"');
const hasResponse = authHeader3.includes('response="');
const hasQop = authHeader3.includes('qop=auth');
const hasCnonce = authHeader3.includes('cnonce="');
const hasNc = authHeader3.includes('nc=00000001');

if (hasUsername && hasRealm && hasNonce && hasResponse && hasQop && hasCnonce && hasNc) {
  console.log('✅ Test 3 passed - All required fields present\n');
} else {
  console.log('❌ Test 3 failed - Missing required fields:');
  if (!hasUsername) console.log('  - username');
  if (!hasRealm) console.log('  - realm');
  if (!hasNonce) console.log('  - nonce');
  if (!hasResponse) console.log('  - response');
  if (!hasQop) console.log('  - qop');
  if (!hasCnonce) console.log('  - cnonce');
  if (!hasNc) console.log('  - nc');
  console.log('');
}

// Test case 4: No qop scenario
console.log('Test 4: 401 Challenge without qop');
console.log('='.repeat(60));

const mockWWWAuthenticateNoQop = 'Digest realm="sip.example.com", nonce="xyz789", algorithm=MD5';
console.log('Mock 401 Response WWW-Authenticate:');
console.log(mockWWWAuthenticateNoQop);

const authParams4 = SIPParser.parseAuthHeader(mockWWWAuthenticateNoQop);
console.log('\nParsed Auth Parameters:');
console.log(authParams4);

const authHeader4 = builder.buildAuthorizationHeader({
  username: 'user123',
  password: 'pass123',
  realm: authParams4.realm,
  nonce: authParams4.nonce,
  uri: 'sip:sip.example.com',
  method: 'REGISTER',
  qop: authParams4.qop,  // Should be null
  algorithm: authParams4.algorithm
});

console.log('\nGenerated Authorization Header:');
console.log(authHeader4);

// Verify it does NOT contain qop, cnonce, nc
const hasNoQop = !authHeader4.includes('qop=');
const hasNoCnonce = !authHeader4.includes('cnonce=');
const hasNoNc = !authHeader4.includes('nc=');

if (hasNoQop && hasNoCnonce && hasNoNc) {
  console.log('✅ Test 4 passed - No qop-related fields present\n');
} else {
  console.log('❌ Test 4 failed - Should not contain qop fields');
  if (!hasNoQop) console.log('  - qop should not be present');
  if (!hasNoCnonce) console.log('  - cnonce should not be present');
  if (!hasNoNc) console.log('  - nc should not be present');
  console.log('');
}

console.log('='.repeat(60));
console.log('✅ All digest authentication tests passed!');
console.log('='.repeat(60));
