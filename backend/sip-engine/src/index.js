/**
 * SIPPER - SIP Testing Engine
 * Main entry point
 */

import { SIPMessageBuilder } from './sip-message-builder.js';
import { SIPParser } from './sip-parser.js';
import { SIPClient } from './sip-client.js';
import { SIPTestEngine } from './test-engine.js';
import { TelnyxIntegration } from './telnyx-integration.js';

// Re-export as named exports
export { SIPMessageBuilder, SIPParser, SIPClient, SIPTestEngine, TelnyxIntegration };

// Version
export const VERSION = '1.0.0';

// Quick start helper
export async function createTestEngine(config = {}) {
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
