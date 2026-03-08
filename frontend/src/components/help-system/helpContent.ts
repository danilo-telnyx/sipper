/**
 * Help Content Database
 * Sprint 3: Help System (v0.5.0)
 * Context-aware help content mapped to routes
 */

import type { HelpContent } from './types'

// Route-to-content mapping
export function getHelpContent(pathname: string): HelpContent | null {
  // Normalize pathname
  const path = pathname.toLowerCase()

  // Dashboard
  if (path === '/dashboard' || path === '/') {
    return dashboardHelp
  }

  // Credentials
  if (path === '/credentials') {
    return credentialsHelp
  }

  // Test Runner (Classic)
  if (path === '/test-runner') {
    return testRunnerHelp
  }

  // SIP Test Builder
  if (path === '/sip-test-builder') {
    return sipTestBuilderHelp
  }

  // Test Results
  if (path.startsWith('/test-results')) {
    return testResultsHelp
  }

  // Users
  if (path === '/users') {
    return usersHelp
  }

  // Organization
  if (path === '/organization') {
    return organizationHelp
  }

  return null
}

// Dashboard Help
const dashboardHelp: HelpContent = {
  title: 'Dashboard Overview',
  description: 'Monitor your SIP testing activity and system health',
  category: 'Overview',
  guide: [
    {
      heading: 'Getting Started',
      content: 'The dashboard provides a real-time overview of your SIP testing activity. View recent tests, success rates, and quick access to key features.',
      steps: [
        'Check the Stats Cards for a quick overview',
        'Review Recent Tests for latest activity',
        'Use the Test Chart to analyze trends',
        'Click any test to view detailed results',
      ],
    },
    {
      heading: 'Understanding Metrics',
      content: 'Key metrics displayed on the dashboard:\n\n- Total Tests: All tests run in your organization\n- Success Rate: Percentage of successful tests\n- Average Score: Mean RFC compliance score (0-100)\n- Active Credentials: Number of configured SIP credentials',
    },
  ],
  examples: [],
  rfcs: [],
  troubleshooting: [
    {
      problem: 'Dashboard not loading data',
      solution: 'Check your network connection and ensure you\'re authenticated. Try refreshing the page. If the issue persists, contact your administrator.',
    },
  ],
}

// Credentials Help
const credentialsHelp: HelpContent = {
  title: 'SIP Credentials Manager',
  description: 'Manage SIP credentials for testing',
  category: 'Configuration',
  guide: [
    {
      heading: 'Adding Credentials',
      content: 'Store SIP credentials securely for use in tests. All passwords are encrypted.',
      steps: [
        'Click "Add Credential" button',
        'Fill in credential details (username, password, domain, port)',
        'Optional: Use Telnyx Auto-Import for automatic population',
        'Click "Save" to store (encrypted)',
      ],
    },
    {
      heading: 'Telnyx Auto-Import',
      content: 'Automatically import credentials from your Telnyx account:',
      steps: [
        'Toggle "Telnyx Integration" ON',
        'Enter your Telnyx Connection ID',
        'Enter your Telnyx API Key',
        'Wait ~1 second for auto-population',
        'Review and save',
      ],
    },
  ],
  examples: [
    {
      title: 'Manual SIP Credential',
      description: 'Example of manually configured SIP credentials',
      language: 'json',
      code: `{
  "name": "My SIP Trunk",
  "username": "alice",
  "password": "secure_password",
  "domain": "sip.example.com",
  "port": 5060,
  "transport": "UDP"
}`,
    },
  ],
  rfcs: [
    {
      number: '3261',
      title: 'SIP: Session Initiation Protocol',
      section: '§10 (Registration)',
      url: 'https://datatracker.ietf.org/doc/html/rfc3261#section-10',
      description: 'Defines SIP registration and authentication mechanisms.',
    },
  ],
  troubleshooting: [
    {
      problem: 'Credential test connection fails',
      solution: 'Verify the domain, port, and transport settings. Ensure your firewall allows SIP traffic on the specified port. Check username and password for typos.',
      relatedRFC: 'RFC 3261',
    },
    {
      problem: 'Telnyx Auto-Import not working',
      solution: 'Verify your Connection ID and API Key are correct. Ensure the API key has read permissions for connections. Check network connectivity.',
    },
  ],
}

// Test Runner Help (Classic)
const testRunnerHelp: HelpContent = {
  title: 'Test Runner (Classic)',
  description: 'Execute pre-configured SIP test scenarios',
  category: 'Testing',
  guide: [
    {
      heading: 'Running Tests',
      content: 'The classic test runner provides guided test execution.',
      steps: [
        'Select a credential',
        'Choose a test type',
        'Configure options (timeout, retries, etc.)',
        'Click "Run Test"',
        'Monitor real-time progress',
        'View results when complete',
      ],
    },
    {
      heading: 'Test Types',
      content: 'Available test scenarios:\n\n- Basic Registration: SIP REGISTER test\n- Authentication Flow: Challenge-response test\n- Call Flow: Full INVITE→ACK→BYE cycle\n- Codec Negotiation: SDP offer/answer\n- DTMF: Tone sending test\n- Hold/Resume: Media manipulation\n- Transfer: Call transfer (REFER)\n- Conference: Multi-party call\n- RFC Compliance: Comprehensive validation',
    },
  ],
  examples: [],
  rfcs: [],
  troubleshooting: [
    {
      problem: 'Test stuck in "Running" state',
      solution: 'Click "Cancel" to stop the test. Check if the SIP server is responding. Verify network connectivity. Try reducing the timeout value.',
      relatedRFC: 'RFC 3261',
    },
  ],
}

// SIP Test Builder Help
const sipTestBuilderHelp: HelpContent = {
  title: 'Enhanced SIP Test Builder',
  description: 'Advanced SIP testing with method selection and RFC validation',
  category: 'Testing',
  guide: [
    {
      heading: 'Method Selection',
      content: 'Choose the SIP method to test:',
      steps: [
        'INVITE: Initiate a SIP session (call setup)',
        'REGISTER: Register a SIP endpoint',
        'OPTIONS: Query server capabilities',
        'REFER: Transfer a call (RFC 3515)',
      ],
    },
    {
      heading: 'Authentication Toggle',
      content: 'Switch between authenticated and unauthenticated flows:\n\n- Authenticated: Includes Digest MD5 credentials\n- Unauthenticated: No auth headers (tests server response)',
    },
    {
      heading: 'REFER (Call Transfer)',
      content: 'Test call transfer mechanisms:',
      steps: [
        'Enter Refer-To URI (transfer target)',
        'Optional: Add Replaces header for attended transfer',
        'Validate RFC 3515 compliance',
        'Run test',
      ],
    },
    {
      heading: 'Session Recording',
      content: 'Add recording metadata (RFC 7865):',
      steps: [
        'Toggle recording ON',
        'Select recording reason (Legal, QA, Training, etc.)',
        'Choose mode (always, never, on-demand)',
        'Recording metadata added to SIP headers',
      ],
    },
  ],
  examples: [
    {
      title: 'Basic INVITE',
      description: 'Simple unauthenticated INVITE message',
      language: 'sip',
      code: `INVITE sip:bob@example.com SIP/2.0
Via: SIP/2.0/UDP 192.0.2.1:5060;branch=z9hG4bK74bf9
From: Alice <sip:alice@example.com>;tag=9fxced76sl
To: Bob <sip:bob@example.com>
Call-ID: 3848276298220188511@example.com
CSeq: 1 INVITE
Contact: <sip:alice@192.0.2.1>
Max-Forwards: 70
Content-Type: application/sdp
Content-Length: 142

v=0
o=alice 2890844526 2890844526 IN IP4 192.0.2.1
s=Session
c=IN IP4 192.0.2.1
t=0 0
m=audio 49170 RTP/AVP 0
a=rtpmap:0 PCMU/8000`,
    },
    {
      title: 'REFER with Replaces (Attended Transfer)',
      description: 'Call transfer with Replaces header',
      language: 'sip',
      code: `REFER sip:bob@example.com SIP/2.0
Via: SIP/2.0/UDP 192.0.2.1:5060;branch=z9hG4bK74bf9
From: Alice <sip:alice@example.com>;tag=9fxced76sl
To: Bob <sip:bob@example.com>;tag=314159
Call-ID: 3848276298220188511@example.com
CSeq: 101 REFER
Refer-To: <sip:carol@example.com?Replaces=12345%40example.com%3Bfrom-tag%3Dabc%3Bto-tag%3Ddef>
Contact: <sip:alice@192.0.2.1>
Content-Length: 0`,
    },
  ],
  rfcs: [
    {
      number: '3261',
      title: 'SIP: Session Initiation Protocol',
      section: 'All sections',
      url: 'https://datatracker.ietf.org/doc/html/rfc3261',
      description: 'Core SIP protocol specification. Defines INVITE, REGISTER, OPTIONS, and base authentication.',
    },
    {
      number: '3515',
      title: 'The SIP Refer Method',
      section: '§2.4',
      url: 'https://datatracker.ietf.org/doc/html/rfc3515',
      description: 'Defines the REFER method for call transfer. Includes blind and attended transfer mechanisms.',
    },
    {
      number: '3891',
      title: 'The "Replaces" Header Field',
      section: '§3',
      url: 'https://datatracker.ietf.org/doc/html/rfc3891',
      description: 'Defines Replaces header for attended transfer scenarios.',
    },
    {
      number: '7865',
      title: 'Session Recording Metadata',
      section: '§5',
      url: 'https://datatracker.ietf.org/doc/html/rfc7865',
      description: 'Defines Recording-Session header and metadata for session recording.',
    },
    {
      number: '4566',
      title: 'SDP: Session Description Protocol',
      section: 'All sections',
      url: 'https://datatracker.ietf.org/doc/html/rfc4566',
      description: 'Defines SDP format for media negotiation in SIP sessions.',
    },
  ],
  troubleshooting: [
    {
      problem: 'Validation errors for mandatory fields',
      solution: 'Ensure all required fields are filled:\n- From User and Domain\n- To User and Domain\n- If authenticated: Username and Password\n- For REFER: Refer-To URI',
      relatedRFC: 'RFC 3261 §8.1.1',
    },
    {
      problem: 'SDP validation fails',
      solution: 'SDP must include:\n- v= (version)\n- o= (origin)\n- s= (session name)\n- c= (connection)\n- t= (time)\n- m= (media description)',
      relatedRFC: 'RFC 4566',
    },
    {
      problem: 'REFER Replaces header format error',
      solution: 'Replaces must include from-tag and to-tag parameters:\nFormat: call-id;from-tag=X;to-tag=Y',
      relatedRFC: 'RFC 3891 §3',
    },
  ],
}

// Test Results Help
const testResultsHelp: HelpContent = {
  title: 'Test Results',
  description: 'View and analyze SIP test results',
  category: 'Analysis',
  guide: [
    {
      heading: 'Understanding Results',
      content: 'Test results include:\n\n- Status: Passed/Failed/Cancelled\n- Score: RFC compliance score (0-100)\n- Duration: Test execution time\n- Details: SIP message flow\n- Logs: Real-time execution logs',
    },
    {
      heading: 'Exporting Results',
      content: 'Export test results for analysis or reporting.',
      steps: [
        'Select tests to export',
        'Choose format (JSON, CSV)',
        'Click "Export"',
        'Download file',
      ],
    },
  ],
  examples: [],
  rfcs: [],
  troubleshooting: [
    {
      problem: 'Cannot view test details',
      solution: 'Ensure you have permission to view the test. If the test belongs to another user in your organization, you may need elevated permissions.',
    },
  ],
}

// Users Help
const usersHelp: HelpContent = {
  title: 'User Management',
  description: 'Manage users in your organization',
  category: 'Administration',
  guide: [
    {
      heading: 'User Roles',
      content: 'SIPPER has three user roles:\n\n- User: Can run tests and view results\n- Manager: Can manage credentials and view all tests\n- Admin: Full system access',
    },
    {
      heading: 'Adding Users',
      content: 'Invite users to your organization.',
      steps: [
        'Click "Add User"',
        'Enter email and name',
        'Select role',
        'User receives invitation email',
      ],
    },
  ],
  examples: [],
  rfcs: [],
  troubleshooting: [],
}

// Organization Help
const organizationHelp: HelpContent = {
  title: 'Organization Settings',
  description: 'Configure organization-wide settings',
  category: 'Administration',
  guide: [
    {
      heading: 'Organization Configuration',
      content: 'Manage organization-wide settings:\n\n- Plan: Free, Pro, Enterprise\n- Limits: Max users, max credentials\n- Retention: Test result retention period\n- Notifications: Email settings',
    },
  ],
  examples: [],
  rfcs: [],
  troubleshooting: [],
}
