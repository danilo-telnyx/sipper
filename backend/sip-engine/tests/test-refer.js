/**
 * Test SIP REFER Method (RFC 3515)
 */

import { SIPMessageBuilder } from '../src/sip-message-builder.js';
import { SIPValidator } from '../src/sip-validator.js';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n=== Testing SIP REFER (RFC 3515) ===\n'));

const builder = new SIPMessageBuilder({
  localIP: '192.168.1.100',
  localPort: 5060,
  userAgent: 'SIPPER-Test/1.0'
});

// Test 1: Basic REFER (Unattended Transfer)
console.log(chalk.yellow('Test 1: Basic REFER (Unattended Transfer)'));
try {
  const callId = builder.generateCallId();
  const fromTag = builder.generateTag();
  
  const params = {
    fromUser: 'alice',
    fromDomain: 'example.com',
    toUser: 'bob',
    toDomain: 'example.com',
    referTo: 'sip:charlie@example.com',
    callId,
    fromTag,
    toTag: builder.generateTag()
  };
  
  const validation = SIPValidator.validateMandatoryParams(params, 'REFER');
  if (!validation.valid) {
    console.log(chalk.red('✗ Validation failed:'), validation.errors);
  } else {
    const { message, metadata } = builder.buildREFER(params);
    console.log(chalk.green('✓ REFER message built successfully'));
    console.log(chalk.dim(message));
    console.log(chalk.cyan('\nMetadata:'), metadata);
    
    // Verify mandatory headers
    if (message.includes('Refer-To: <sip:charlie@example.com>')) {
      console.log(chalk.green('✓ Refer-To header present'));
    } else {
      console.log(chalk.red('✗ Refer-To header missing'));
    }
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

// Test 2: REFER with Replaces (Attended Transfer)
console.log(chalk.yellow('\nTest 2: REFER with Replaces (Attended Transfer)'));
try {
  const params = {
    fromUser: 'alice',
    fromDomain: 'example.com',
    toUser: 'bob',
    toDomain: 'example.com',
    referTo: 'sip:charlie@example.com',
    replaces: 'call-id-123;to-tag=abc;from-tag=def',
    callId: builder.generateCallId(),
    fromTag: builder.generateTag(),
    toTag: builder.generateTag(),
    referredBy: 'sip:alice@example.com'
  };
  
  const validation = SIPValidator.validateMandatoryParams(params, 'REFER');
  if (!validation.valid) {
    console.log(chalk.red('✗ Validation failed:'), validation.errors);
  } else {
    const { message } = builder.buildREFER(params);
    console.log(chalk.green('✓ REFER with Replaces built successfully'));
    
    // Verify attended transfer headers
    if (message.includes('Replaces:') && message.includes('Referred-By:')) {
      console.log(chalk.green('✓ Attended transfer headers present'));
    } else {
      console.log(chalk.red('✗ Attended transfer headers missing'));
    }
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

// Test 3: NOTIFY for REFER status
console.log(chalk.yellow('\nTest 3: NOTIFY for REFER status update'));
try {
  const callId = builder.generateCallId();
  const fromTag = builder.generateTag();
  const toTag = builder.generateTag();
  
  // Sipfrag body indicating success
  const sipfragBody = 'SIP/2.0 200 OK';
  
  const { message } = builder.buildNOTIFY({
    fromUser: 'bob',
    fromDomain: 'example.com',
    toUser: 'alice',
    toDomain: 'example.com',
    callId,
    fromTag,
    toTag,
    event: 'refer',
    subscriptionState: 'terminated;reason=noresource',
    body: sipfragBody
  });
  
  console.log(chalk.green('✓ NOTIFY message built successfully'));
  
  // Verify NOTIFY specifics
  if (message.includes('Event: refer') && message.includes('message/sipfrag')) {
    console.log(chalk.green('✓ REFER NOTIFY properly formatted'));
  } else {
    console.log(chalk.red('✗ REFER NOTIFY headers incorrect'));
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

// Test 4: Validation - Missing referTo
console.log(chalk.yellow('\nTest 4: Validation - Missing referTo'));
try {
  const params = {
    fromUser: 'alice',
    fromDomain: 'example.com',
    toUser: 'bob',
    toDomain: 'example.com',
    // Missing referTo - should fail
    callId: builder.generateCallId(),
    fromTag: builder.generateTag()
  };
  
  const validation = SIPValidator.validateMandatoryParams(params, 'REFER');
  if (!validation.valid && validation.errors.some(e => e.includes('referTo'))) {
    console.log(chalk.green('✓ Correctly rejected REFER without referTo'));
  } else {
    console.log(chalk.red('✗ Should have rejected REFER without referTo'));
  }
} catch (error) {
  console.log(chalk.green('✓ Correctly threw error:'), error.message);
}

// Test 5: Validation - Invalid Replaces format
console.log(chalk.yellow('\nTest 5: Validation - Invalid Replaces format'));
try {
  const params = {
    fromUser: 'alice',
    fromDomain: 'example.com',
    toUser: 'bob',
    toDomain: 'example.com',
    referTo: 'sip:charlie@example.com',
    replaces: 'invalid-format',  // Missing to-tag and from-tag
    callId: builder.generateCallId(),
    fromTag: builder.generateTag()
  };
  
  const validation = SIPValidator.validateMandatoryParams(params, 'REFER');
  if (!validation.valid && validation.errors.some(e => e.includes('Replaces'))) {
    console.log(chalk.green('✓ Correctly rejected invalid Replaces header'));
  } else {
    console.log(chalk.red('✗ Should have rejected invalid Replaces header'));
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

console.log(chalk.bold.blue('\n=== REFER Tests Complete ===\n'));
