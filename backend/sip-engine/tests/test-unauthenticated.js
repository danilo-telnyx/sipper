/**
 * Test Unauthenticated SIP Messages
 * Verify messages work without authentication headers
 */

import { SIPMessageBuilder } from '../src/sip-message-builder.js';
import { SIPValidator } from '../src/sip-validator.js';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n=== Testing Unauthenticated SIP Messages ===\n'));

const builder = new SIPMessageBuilder({
  localIP: '192.168.1.100',
  localPort: 5060,
  userAgent: 'SIPPER-Test/1.0'
});

// Test 1: Unauthenticated INVITE
console.log(chalk.yellow('Test 1: Unauthenticated INVITE'));
try {
  const params = {
    fromUser: 'alice',
    fromDomain: 'example.com',
    toUser: 'bob',
    toDomain: 'example.com'
    // No authorization headers
  };
  
  const validation = SIPValidator.validateMandatoryParams(params, 'INVITE');
  if (!validation.valid) {
    console.log(chalk.red('✗ Validation failed:'), validation.errors);
  } else {
    const { message, metadata } = builder.buildINVITE(params);
    console.log(chalk.green('✓ Unauthenticated INVITE built successfully'));
    
    // Verify NO Authorization header present
    if (!message.includes('Authorization:')) {
      console.log(chalk.green('✓ No Authorization header (as expected)'));
    } else {
      console.log(chalk.red('✗ Authorization header should not be present'));
    }
    
    // Verify mandatory headers present
    const mandatoryHeaders = ['Via:', 'From:', 'To:', 'Call-ID:', 'CSeq:', 'Max-Forwards:'];
    const allPresent = mandatoryHeaders.every(h => message.includes(h));
    if (allPresent) {
      console.log(chalk.green('✓ All mandatory headers present'));
    } else {
      console.log(chalk.red('✗ Some mandatory headers missing'));
    }
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

// Test 2: Unauthenticated REGISTER
console.log(chalk.yellow('\nTest 2: Unauthenticated REGISTER'));
try {
  const params = {
    username: 'alice',
    domain: 'example.com'
    // No authorization headers
  };
  
  const validation = SIPValidator.validateMandatoryParams({
    fromUser: params.username,
    fromDomain: params.domain,
    toUser: params.username,
    toDomain: params.domain,
    username: params.username
  }, 'REGISTER');
  
  if (!validation.valid) {
    console.log(chalk.red('✗ Validation failed:'), validation.errors);
  } else {
    const { message } = builder.buildREGISTER(params);
    console.log(chalk.green('✓ Unauthenticated REGISTER built successfully'));
    
    // Verify structure
    if (!message.includes('Authorization:')) {
      console.log(chalk.green('✓ No Authorization header (testing server response)'));
    }
    
    if (message.includes('Contact:') && message.includes('Expires:')) {
      console.log(chalk.green('✓ Registration headers present'));
    }
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

// Test 3: Unauthenticated OPTIONS
console.log(chalk.yellow('\nTest 3: Unauthenticated OPTIONS (ping)'));
try {
  const params = {
    fromUser: 'sipper',
    fromDomain: 'test.local',
    toUser: 'server',
    toDomain: 'example.com'
  };
  
  const validation = SIPValidator.validateMandatoryParams(params, 'OPTIONS');
  if (!validation.valid) {
    console.log(chalk.red('✗ Validation failed:'), validation.errors);
  } else {
    const { message } = builder.buildOPTIONS(params);
    console.log(chalk.green('✓ Unauthenticated OPTIONS built successfully'));
    
    if (message.startsWith('OPTIONS sip:')) {
      console.log(chalk.green('✓ Correct request-URI format'));
    }
    
    if (message.includes('Accept:')) {
      console.log(chalk.green('✓ Accept header present for capability discovery'));
    }
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

// Test 4: Expected flow - INVITE → 407 (Proxy Auth Required)
console.log(chalk.yellow('\nTest 4: Typical unauthenticated flow'));
console.log(chalk.dim('Expected flow:'));
console.log(chalk.dim('  1. Send unauthenticated INVITE'));
console.log(chalk.dim('  2. Receive 407 Proxy Authentication Required'));
console.log(chalk.dim('  3. Resend INVITE with Authorization header'));
console.log(chalk.dim('  4. Receive 200 OK\n'));

try {
  // Step 1: Initial unauthenticated request
  const initialParams = {
    fromUser: 'alice',
    fromDomain: 'example.com',
    toUser: 'bob',
    toDomain: 'example.com'
  };
  
  const { message: unauthMsg, metadata } = builder.buildINVITE(initialParams);
  console.log(chalk.green('✓ Step 1: Unauthenticated INVITE sent'));
  
  // Simulate 407 response (in real scenario, this comes from server)
  console.log(chalk.green('✓ Step 2: Received 407 (simulated)'));
  
  // Step 3: Build Authorization header
  const authHeader = builder.buildAuthorizationHeader({
    username: 'alice',
    password: 'secret123',
    realm: 'example.com',
    nonce: 'abc123xyz',
    uri: `sip:${initialParams.toUser}@${initialParams.toDomain}`,
    method: 'INVITE'
  });
  
  console.log(chalk.green('✓ Step 3: Authorization header built'));
  console.log(chalk.dim(`  ${authHeader.substring(0, 80)}...`));
  
  // Build authenticated INVITE
  const authParams = {
    ...initialParams,
    extraHeaders: {
      'Authorization': authHeader
    },
    callId: metadata.callId,
    cseq: metadata.cseq,
    fromTag: metadata.fromTag
  };
  
  const { message: authMsg } = builder.buildINVITE(authParams);
  if (authMsg.includes('Authorization: Digest')) {
    console.log(chalk.green('✓ Step 4: Authenticated INVITE ready to send'));
  }
  
  console.log(chalk.green('\n✓ Complete authentication flow demonstrated'));
} catch (error) {
  console.log(chalk.red('✗ Flow test failed:'), error.message);
}

// Test 5: Validation warnings
console.log(chalk.yellow('\nTest 5: Validation warnings for unauthenticated INVITE'));
try {
  const params = {
    fromUser: 'alice',
    fromDomain: 'example.com',
    toUser: 'bob',
    toDomain: 'example.com'
    // No SDP provided
  };
  
  const validation = SIPValidator.validateMandatoryParams(params, 'INVITE');
  if (validation.warnings && validation.warnings.length > 0) {
    console.log(chalk.yellow('⚠  Warnings:'));
    validation.warnings.forEach(w => console.log(chalk.dim(`   - ${w}`)));
  }
  
  if (validation.warnings.some(w => w.includes('SDP'))) {
    console.log(chalk.green('✓ Correctly warns about missing SDP'));
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

console.log(chalk.bold.blue('\n=== Unauthenticated Tests Complete ===\n'));
