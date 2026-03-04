/**
 * SIPPER - SIP Testing Engine
 * Main entry point
 */

export { SIPMessageBuilder } from './sip-message-builder.js';
export { SIPParser } from './sip-parser.js';
export { SIPClient } from './sip-client.js';
export { SIPTestEngine } from './test-engine.js';
export { TelnyxIntegration } from './telnyx-integration.js';

// Version
export const VERSION = '1.0.0';

// Quick start helper
export async function createTestEngine(config = {}) {
  const { SIPTestEngine } = await import('./test-engine.js');
  const engine = new SIPTestEngine(config);
  await engine.init();
  return engine;
}

// Default export
export default {
  SIPMessageBuilder,
  SIPParser,
  SIPClient,
  SIPTestEngine,
  TelnyxIntegration,
  createTestEngine,
  VERSION
};
