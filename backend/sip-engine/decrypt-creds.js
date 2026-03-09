#!/usr/bin/env node
/**
 * Decrypt Telnyx credentials from environment
 * Usage: node decrypt-creds.js <base64-encrypted-password>
 */

import crypto from 'crypto';

const encryptedB64 = process.argv[2];
if (!encryptedB64) {
  console.error('Usage: node decrypt-creds.js <base64-encrypted-password>');
  process.exit(1);
}

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  console.error('Error: ENCRYPTION_KEY environment variable not set');
  process.exit(1);
}

try {
  // Fernet format: Version (1 byte) | Timestamp (8 bytes) | IV (16 bytes) | Ciphertext | HMAC (32 bytes)
  // For simplicity, we'll use a basic approach compatible with Python's Fernet
  
  // Fernet uses URL-safe base64, so we need to handle it
  const encrypted = Buffer.from(encryptedB64, 'base64');
  
  // Fernet structure: 
  // Byte 0: Version (0x80)
  // Bytes 1-8: Timestamp
  // Bytes 9-24: IV (16 bytes)
  // Bytes 25+: Ciphertext + HMAC (last 32 bytes)
  
  // Extract components
  const version = encrypted[0];
  const timestamp = encrypted.slice(1, 9);
  const iv = encrypted.slice(9, 25);
  const ciphertextAndHmac = encrypted.slice(25);
  const ciphertext = ciphertextAndHmac.slice(0, -32);
  const hmac = ciphertextAndHmac.slice(-32);
  
  // Derive signing and encryption keys from the master key
  const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'base64');
  const signingKey = keyBuffer.slice(0, 16);
  const encryptionKey = keyBuffer.slice(16, 32);
  
  // Decrypt using AES-128-CBC
  const decipher = crypto.createDecipheriv('aes-128-cbc', encryptionKey, iv);
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  // Remove PKCS7 padding
  const padding = decrypted[decrypted.length - 1];
  decrypted = decrypted.slice(0, -padding);
  
  console.log(decrypted.toString('utf8'));
} catch (error) {
  console.error('Decryption failed:', error.message);
  process.exit(1);
}
