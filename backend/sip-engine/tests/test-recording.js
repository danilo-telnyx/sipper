/**
 * Test SIP Recording (RFC 7865)
 */

import { SIPMessageBuilder } from '../src/sip-message-builder.js';
import { SIPValidator } from '../src/sip-validator.js';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

console.log(chalk.bold.blue('\n=== Testing SIP Recording (RFC 7865) ===\n'));

const builder = new SIPMessageBuilder({
  localIP: '192.168.1.100',
  localPort: 5060,
  userAgent: 'SIPPER-Test/1.0'
});

// Test 1: INVITE with Recording-Session header
console.log(chalk.yellow('Test 1: INVITE with Recording-Session header'));
try {
  const sessionId = uuidv4();
  
  const params = {
    fromUser: 'alice',
    fromDomain: 'example.com',
    toUser: 'bob',
    toDomain: 'example.com',
    recordingSession: {
      sessionId,
      reason: 'Legal',
      recordingUri: 'sip:srs@recording.example.com',
      mode: 'always'
    }
  };
  
  // Validate recording session params
  const validation = SIPValidator.validateRecordingSession(params.recordingSession, []);
  if (validation === undefined) {  // No errors added
    const { message, metadata } = builder.buildRecordingINVITE(params);
    console.log(chalk.green('✓ Recording INVITE built successfully'));
    console.log(chalk.dim(message.substring(0, 500) + '...\n'));
    
    // Verify Recording-Session header
    if (message.includes('Recording-Session:') && 
        message.includes('reason=Legal') &&
        message.includes(`session-id=${sessionId}`)) {
      console.log(chalk.green('✓ Recording-Session header properly formatted'));
    } else {
      console.log(chalk.red('✗ Recording-Session header incorrect'));
    }
  } else {
    console.log(chalk.red('✗ Validation failed'));
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

// Test 2: Recording Metadata XML
console.log(chalk.yellow('\nTest 2: Recording Metadata XML generation'));
try {
  const sessionId = uuidv4();
  const participants = [
    { id: 'p1', uri: 'sip:alice@example.com', name: 'Alice Smith', role: 'caller' },
    { id: 'p2', uri: 'sip:bob@example.com', name: 'Bob Jones', role: 'callee' }
  ];
  
  const xml = builder.buildRecordingMetadataXML({
    sessionId,
    participants,
    reason: 'QualityAssurance',
    startTime: new Date().toISOString()
  });
  
  console.log(chalk.green('✓ Recording metadata XML generated'));
  console.log(chalk.dim(xml));
  
  // Verify XML structure
  if (xml.includes('<recording xmlns=') &&
      xml.includes(`session_id="${sessionId}"`) &&
      xml.includes('QualityAssurance') &&
      xml.includes('alice@example.com')) {
    console.log(chalk.green('✓ XML metadata properly structured'));
  } else {
    console.log(chalk.red('✗ XML metadata incorrect'));
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

// Test 3: Recording modes (always, never, on-demand)
console.log(chalk.yellow('\nTest 3: Recording modes'));
const modes = ['always', 'never', 'on-demand'];
modes.forEach(mode => {
  try {
    const { message } = builder.buildRecordingINVITE({
      fromUser: 'alice',
      fromDomain: 'example.com',
      toUser: 'bob',
      toDomain: 'example.com',
      recordingSession: {
        sessionId: uuidv4(),
        reason: 'Training',
        mode
      }
    });
    
    if (message.includes(`mode=${mode}`)) {
      console.log(chalk.green(`✓ Recording mode "${mode}" works correctly`));
    } else {
      console.log(chalk.red(`✗ Recording mode "${mode}" not found in message`));
    }
  } catch (error) {
    console.log(chalk.red(`✗ Mode "${mode}" failed:`), error.message);
  }
});

// Test 4: Validation - Missing sessionId
console.log(chalk.yellow('\nTest 4: Validation - Missing sessionId'));
try {
  const errors = [];
  SIPValidator.validateRecordingSession({
    reason: 'Legal'
    // Missing sessionId
  }, errors);
  
  if (errors.some(e => e.includes('sessionId'))) {
    console.log(chalk.green('✓ Correctly rejected recording session without sessionId'));
  } else {
    console.log(chalk.red('✗ Should have rejected missing sessionId'));
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

// Test 5: Validation - Invalid reason
console.log(chalk.yellow('\nTest 5: Validation - Invalid recording reason'));
try {
  const errors = [];
  SIPValidator.validateRecordingSession({
    sessionId: uuidv4(),
    reason: 'InvalidReason'  // Not in allowed list
  }, errors);
  
  if (errors.some(e => e.includes('Invalid recording reason'))) {
    console.log(chalk.green('✓ Correctly rejected invalid recording reason'));
  } else {
    console.log(chalk.red('✗ Should have rejected invalid reason'));
  }
} catch (error) {
  console.log(chalk.red('✗ Test failed:'), error.message);
}

// Test 6: Recording reasons compliance
console.log(chalk.yellow('\nTest 6: Valid recording reasons (RFC 7865)'));
const validReasons = ['Legal', 'QualityAssurance', 'Training', 'CustomerApproval'];
validReasons.forEach(reason => {
  try {
    const errors = [];
    SIPValidator.validateRecordingSession({
      sessionId: uuidv4(),
      reason
    }, errors);
    
    if (errors.length === 0) {
      console.log(chalk.green(`✓ Reason "${reason}" is valid`));
    } else {
      console.log(chalk.red(`✗ Reason "${reason}" was rejected`));
    }
  } catch (error) {
    console.log(chalk.red(`✗ Reason "${reason}" failed:`), error.message);
  }
});

console.log(chalk.bold.blue('\n=== Recording Tests Complete ===\n'));
