# SIPPER Quick Start Guide

Get started with SIPPER in 5 minutes.

## Installation

```bash
cd ~/Documents/projects/sipper/backend/sip-engine
npm install
```

## Basic Usage

### 1. Simple OPTIONS Ping

```bash
node examples/simple-test.js
```

### 2. Test with Environment Variables

```bash
# Create .env file
cp .env.example .env

# Edit .env with your SIP server details
nano .env

# Run test
SIP_HOST=your-sip-server.com node tests/options-ping.js
```

### 3. Telnyx Integration

```bash
# Set Telnyx credentials
export TELNYX_SIP_USERNAME="your-username"
export TELNYX_SIP_PASSWORD="your-password"

# Run Telnyx tests
node tests/telnyx-integration.js
```

## Test a Real Endpoint

### SIP Server Requirements
- SIP server reachable on UDP port 5060
- Username/password (if authentication required)
- Valid SIP domain

### Run Full Test Suite

```bash
SIP_HOST=sip.example.com \
SIP_USERNAME=myuser \
SIP_PASSWORD=mypass \
SIP_DOMAIN=example.com \
node tests/run-all.js
```

## Quick Code Example

```javascript
import { SIPTestEngine } from './src/test-engine.js';

const engine = new SIPTestEngine({
  localIP: '0.0.0.0',
  localPort: 5060
});

await engine.init();

await engine.testOPTIONSPing({
  host: 'sip.example.com',
  port: 5060,
  domain: 'sip.example.com'
});

engine.printReport();
await engine.shutdown();
```

## Available Tests

| Test | Command |
|------|---------|
| OPTIONS Ping | `node tests/options-ping.js` |
| Registration | `node tests/registration.js` |
| Auth Challenge | `node tests/auth-challenge.js` |
| Basic Call Flow | `node tests/basic-call-flow.js` |
| Telnyx Integration | `node tests/telnyx-integration.js` |
| All Tests | `node tests/run-all.js` |

## Test Your Own Endpoint

```javascript
import { SIPTestEngine } from './src/test-engine.js';

const config = {
  localIP: '0.0.0.0',
  localPort: 5060,
  username: 'myuser',
  domain: 'example.com'
};

const endpoint = {
  host: 'sip.example.com',
  port: 5060,
  domain: 'example.com',
  username: 'myuser',
  password: 'mypassword'
};

const engine = new SIPTestEngine(config);
await engine.init();

// Run tests
await engine.testOPTIONSPing(endpoint);
await engine.testREGISTER(endpoint);
await engine.testAuthChallenge(endpoint);

// Get results
engine.printReport();
const report = engine.generateReport();
console.log(JSON.stringify(report, null, 2));

await engine.shutdown();
```

## Troubleshooting

### Port Already in Use
```bash
# Use different port
LOCAL_PORT=5061 node tests/options-ping.js
```

### Connection Timeout
```bash
# Increase timeout
node -e "
import { SIPTestEngine } from './src/test-engine.js';
const engine = new SIPTestEngine({ timeout: 15000 });
// ... rest of code
"
```

### Firewall Issues
- Ensure UDP port 5060 is open
- Check if SIP server allows your IP
- Verify no NAT/firewall blocking

## Next Steps

1. Read [README.md](./README.md) for full API documentation
2. Check [TEST-SCENARIOS.md](./docs/TEST-SCENARIOS.md) for test details
3. Review [RFC3261-COMPLIANCE.md](./docs/RFC3261-COMPLIANCE.md) for compliance info
4. Explore [scenarios/telnyx-examples.json](./scenarios/telnyx-examples.json) for Telnyx-specific tests

## Support

- Issues: GitHub Issues
- Documentation: See `docs/` folder
- Examples: See `examples/` folder

## License

MIT
