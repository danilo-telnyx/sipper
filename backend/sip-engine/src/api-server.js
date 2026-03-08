/**
 * SIP Engine HTTP API Server
 * Provides REST endpoints for the Python backend to call
 */

import express from 'express';
import { createTestEngine } from './index.js';

const app = express();
app.use(express.json());

const PORT = process.env.SIP_ENGINE_PORT || 5001;
const API_SECRET = process.env.SIP_ENGINE_SECRET || '';

// Authentication middleware (skipped for health check)
function authenticateRequest(req, res, next) {
  // Skip auth for health check
  if (req.path === '/health') {
    return next();
  }
  
  // In development without secret, allow all requests
  if (!API_SECRET) {
    console.warn('⚠️  SIP_ENGINE_SECRET not set - authentication disabled (development mode)');
    return next();
  }
  
  const providedSecret = req.headers['x-sip-engine-secret'];
  
  if (!providedSecret || providedSecret !== API_SECRET) {
    console.error('❌ Unauthorized SIP engine request - invalid secret');
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing X-SIP-Engine-Secret header'
    });
  }
  
  next();
}

app.use(authenticateRequest);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sipper-sip-engine', version: '1.0.0' });
});

// Run test endpoint
app.post('/test/run', async (req, res) => {
  const { testType, credentials, config = {} } = req.body;
  
  if (!testType) {
    return res.status(400).json({ error: 'testType is required' });
  }

  try {
    // Create test engine instance
    const engine = await createTestEngine({
      localIP: config.localIP || '127.0.0.1',
      localPort: config.localPort || 5060,
      transport: config.transport || 'UDP',
      timeout: config.timeout || 10000,
      username: credentials?.username,
      domain: credentials?.domain || credentials?.host,
      password: credentials?.password
    });

    const endpoint = {
      host: credentials?.host || credentials?.domain,
      port: credentials?.port || 5060,
      username: credentials?.username,
      password: credentials?.password,
      domain: credentials?.domain || credentials?.host,
      targetUser: config.targetUser
    };

    let result;

    // Execute test based on type
    switch (testType.toLowerCase()) {
      case 'options':
      case 'options_ping':
        result = await engine.testOPTIONSPing(endpoint);
        break;

      case 'register':
      case 'registration':
        result = await engine.testREGISTER(endpoint);
        break;

      case 'call':
      case 'basic_call':
      case 'basic_call_flow':
        result = await engine.testBasicCallFlow(endpoint);
        break;

      case 'auth':
      case 'auth_challenge':
        result = await engine.testAuthChallenge(endpoint);
        break;

      case 'error':
      case 'error_handling':
        result = await engine.testErrorHandling(endpoint);
        break;

      default:
        await engine.shutdown();
        return res.status(400).json({ 
          error: `Unknown test type: ${testType}`,
          supportedTypes: ['options', 'register', 'call', 'auth', 'error']
        });
    }

    // Shutdown engine
    await engine.shutdown();

    // Return result
    res.json({
      success: result.passed,
      testName: result.testName,
      duration: result.duration,
      messages: result.messages,
      errors: result.errors,
      violations: result.violations,
      metrics: result.metrics,
      startTime: result.startTime,
      endTime: result.endTime
    });

  } catch (error) {
    console.error('Test execution error:', error);
    res.status(500).json({ 
      error: 'Test execution failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`✓ SIP Engine API listening on http://127.0.0.1:${PORT}`);
  console.log(`  Health check: http://127.0.0.1:${PORT}/health`);
  console.log(`  Test endpoint: POST http://127.0.0.1:${PORT}/test/run`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
