/**
 * Sample Course Data for E-Learning Admin Testing
 * Based on Agent 5's complete content structure
 */

import { SectionContent, QuizQuestion, SectionQuizConfig, FinalTestConfig, BranchingRule } from '@/contexts/ELearningAdminContext';

// Sample sections (subset of full 15 sections)
export const sampleSections: SectionContent[] = [
  {
    id: 'section-1-1',
    course_id: 'course-sip-101',
    title: 'What is SIP?',
    content: `# What is SIP?

**Session Initiation Protocol (SIP)** is an application-layer signaling protocol used to create, modify, and terminate multimedia sessions like voice calls, video calls, and instant messaging.

## Key Concepts

SIP is a **text-based protocol** similar to HTTP. It uses:
- Request/response transactions
- SIP URIs (like email addresses): \`sip:alice@example.com\`
- Headers for call setup and teardown

## SIP Message Example

\`\`\`
INVITE sip:bob@telnyx.com SIP/2.0
Via: SIP/2.0/UDP pc33.atlanta.com;branch=z9hG4bKnashds8
To: Bob <sip:bob@telnyx.com>
From: Alice <sip:alice@atlanta.com>;tag=1928301774
Call-ID: a84b4c76e66710@pc33.atlanta.com
CSeq: 314159 INVITE
Contact: <sip:alice@pc33.atlanta.com>
Content-Type: application/sdp
Content-Length: 142

v=0
o=alice 2890844526 2890844526 IN IP4 pc33.atlanta.com
s=Session SDP
c=IN IP4 pc33.atlanta.com
t=0 0
m=audio 49170 RTP/AVP 0
a=rtpmap:0 PCMU/8000
\`\`\`

## Why SIP Matters

- **Interoperability**: Works across different vendors and platforms
- **Flexibility**: Supports various media types
- **Scalability**: Used by carriers like Telnyx for millions of calls

## Telnyx Integration

Telnyx uses SIP for:
- Call Control API
- SIP Trunking
- Voice API
- Programmable connectivity
`,
    order: 1,
    is_published: true,
    sip_blocks: [
      {
        id: 'sip_1',
        content: `INVITE sip:bob@telnyx.com SIP/2.0
Via: SIP/2.0/UDP pc33.atlanta.com;branch=z9hG4bKnashds8
To: Bob <sip:bob@telnyx.com>
From: Alice <sip:alice@atlanta.com>;tag=1928301774
Call-ID: a84b4c76e66710@pc33.atlanta.com
CSeq: 314159 INVITE
Contact: <sip:alice@pc33.atlanta.com>
Content-Type: application/sdp
Content-Length: 142`
      }
    ],
    callouts: [
      {
        id: 'callout_1',
        type: 'tip',
        content: '💡 Think of SIP as the "call setup" protocol. It doesn\'t carry the audio—that\'s RTP\'s job!'
      },
      {
        id: 'callout_2',
        type: 'rfc',
        content: '📋 RFC 3261: Session Initiation Protocol - The main SIP specification'
      }
    ],
    ladder_diagrams: [
      {
        id: 'ladder_1',
        lines: [
          'Alice -> Bob: INVITE',
          'Bob -> Alice: 180 Ringing',
          'Bob -> Alice: 200 OK',
          'Alice -> Bob: ACK'
        ]
      }
    ],
    key_takeaways: [
      'SIP is a signaling protocol for multimedia sessions',
      'SIP messages are text-based and human-readable',
      'SIP URIs look like email addresses (sip:user@domain)',
      'SIP sets up calls, RTP carries the media'
    ]
  },
  {
    id: 'section-1-2',
    course_id: 'course-sip-101',
    title: 'SIP Request Methods',
    content: `# SIP Request Methods

SIP defines several **request methods** (verbs) for different call operations.

## Core Methods

### INVITE
Initiates a session (call setup)

### ACK
Acknowledges a final response to INVITE

### BYE
Terminates a session (call teardown)

### CANCEL
Cancels a pending INVITE

### REGISTER
Registers a user agent with a registrar

### OPTIONS
Queries the capabilities of a server

## Example: REGISTER

\`\`\`
REGISTER sip:registrar.telnyx.com SIP/2.0
Via: SIP/2.0/UDP phone.atlanta.com;branch=z9hG4bKnashds7
To: Alice <sip:alice@atlanta.com>
From: Alice <sip:alice@atlanta.com>;tag=456248
Call-ID: 843817637684230@998sdasdh09
CSeq: 1826 REGISTER
Contact: <sip:alice@phone.atlanta.com>
Expires: 3600
Content-Length: 0
\`\`\`

## Method Usage

| Method | Purpose | Creates Dialog? |
|--------|---------|-----------------|
| INVITE | Start call | Yes |
| ACK | Confirm | No (part of INVITE) |
| BYE | End call | No (uses existing) |
| CANCEL | Cancel setup | No |
| REGISTER | Register UA | No |
| OPTIONS | Query caps | No |
`,
    order: 2,
    is_published: true,
    key_takeaways: [
      'INVITE starts a call, BYE ends it',
      'ACK confirms INVITE success',
      'REGISTER tells the server where you are',
      'CANCEL stops a call setup in progress'
    ]
  },
  {
    id: 'section-1-3',
    course_id: 'course-sip-101',
    title: 'SIP Response Codes',
    content: `# SIP Response Codes

SIP responses use **3-digit status codes** similar to HTTP.

## Response Classes

- **1xx**: Provisional (call in progress)
- **2xx**: Success
- **3xx**: Redirection
- **4xx**: Client error
- **5xx**: Server error
- **6xx**: Global failure

## Common Responses

### 100 Trying
Server received request, processing

### 180 Ringing
Callee is being alerted

### 200 OK
Request succeeded

### 401 Unauthorized
Authentication required

### 404 Not Found
User not found

### 486 Busy Here
Callee is busy

### 487 Request Terminated
Request cancelled by CANCEL

## Example Flow

\`\`\`
Alice -> Server: INVITE
Server -> Alice: 100 Trying
Server -> Bob: INVITE
Bob -> Server: 180 Ringing
Server -> Alice: 180 Ringing
Bob -> Server: 200 OK
Server -> Alice: 200 OK
Alice -> Server: ACK
\`\`\`
`,
    order: 3,
    is_published: true,
    callouts: [
      {
        id: 'callout_3',
        type: 'mistake',
        content: '❌ Common mistake: Forgetting that 1xx responses don\'t end the transaction—only 2xx-6xx do!'
      }
    ],
    key_takeaways: [
      '1xx = provisional, 2xx = success, 4xx/5xx/6xx = errors',
      '180 Ringing tells the caller the phone is ringing',
      '200 OK means the call was answered',
      'Response codes are similar to HTTP status codes'
    ]
  },
  {
    id: 'section-2-1',
    course_id: 'course-sip-201',
    title: 'SIP Registration',
    content: `# SIP Registration

**Registration** is how a SIP user agent tells the registrar server where it can be reached.

## Registration Process

1. UA sends REGISTER to registrar
2. Registrar responds with 200 OK
3. UA re-registers before expiration
4. Contact binding stored in location service

## Registration Message

\`\`\`
REGISTER sip:registrar.telnyx.com SIP/2.0
Via: SIP/2.0/UDP phone.atlanta.com;branch=z9hG4bKnashds7
To: Alice <sip:alice@atlanta.com>
From: Alice <sip:alice@atlanta.com>;tag=456248
Call-ID: 843817637684230@998sdasdh09
CSeq: 1826 REGISTER
Contact: <sip:alice@phone.atlanta.com>
Expires: 3600
Content-Length: 0
\`\`\`

## Key Headers

- **To/From**: User's AOR (Address of Record)
- **Contact**: Current device URI
- **Expires**: Registration lifetime (seconds)
- **Call-ID**: Unique identifier for this registration

## Telnyx Registration

In Telnyx Portal:
- Configure SIP credentials
- Set registration expiry
- Enable/disable registration
- Monitor registration status
`,
    order: 1,
    is_published: true,
    key_takeaways: [
      'REGISTER tells the server where to find you',
      'Contact header contains your current location',
      'Expires header sets registration lifetime',
      'Must re-register before expiration'
    ]
  },
  {
    id: 'section-2-2',
    course_id: 'course-sip-201',
    title: 'SIP Authentication',
    content: `# SIP Authentication

SIP uses **digest authentication** to verify user identity.

## Authentication Flow

1. Client sends REGISTER (no credentials)
2. Server responds with 401 Unauthorized + WWW-Authenticate
3. Client resends REGISTER with Authorization header
4. Server validates and responds 200 OK

## Challenge/Response

**401 Response:**
\`\`\`
SIP/2.0 401 Unauthorized
WWW-Authenticate: Digest realm="telnyx.com",
  nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",
  qop="auth",
  algorithm=MD5
\`\`\`

**Authenticated Request:**
\`\`\`
REGISTER sip:registrar.telnyx.com SIP/2.0
Authorization: Digest username="alice",
  realm="telnyx.com",
  nonce="dcd98b7102dd2f0e8b11d0f600bfb0c093",
  uri="sip:registrar.telnyx.com",
  response="6629fae49393a05397450978507c4ef1",
  qop=auth,
  nc=00000001,
  cnonce="0a4f113b"
\`\`\`

## Security Best Practices

- Always use digest (not basic)
- Increase nonce expiry for better security
- Use TLS for credentials in transit
- Monitor failed authentication attempts
`,
    order: 2,
    is_published: true,
    callouts: [
      {
        id: 'callout_auth_1',
        type: 'rfc',
        content: '📋 RFC 2617: HTTP Authentication - SIP uses the same digest mechanism'
      }
    ],
    key_takeaways: [
      'SIP uses digest authentication (RFC 2617)',
      '401 Unauthorized triggers the auth challenge',
      'Client calculates response hash using credentials',
      'Never send passwords in plaintext'
    ]
  }
];

// Sample questions
export const sampleQuestions: QuizQuestion[] = [
  {
    id: 'q1-1-1',
    section_id: 'section-1-1',
    question_text: 'What protocol does SIP use for its transport?',
    question_type: 'mcq-4',
    options: ['UDP or TCP', 'Only UDP', 'Only TCP', 'HTTP'],
    correct_answer: 'UDP or TCP',
    explanation: 'SIP can use either UDP or TCP as its transport protocol. UDP is more common for its lower overhead, but TCP is used for larger messages and reliability.',
    difficulty: 'easy',
    topic: 'SIP Basics',
    is_active: true,
    is_in_final_bank: true
  },
  {
    id: 'q1-1-2',
    section_id: 'section-1-1',
    question_text: 'What does a SIP URI look like?',
    question_type: 'mcq-4',
    options: [
      'sip:user@domain',
      'http://domain/user',
      'tel:+1234567890',
      'user@domain'
    ],
    correct_answer: 'sip:user@domain',
    explanation: 'SIP URIs use the format sip:user@domain, similar to email addresses but with the "sip:" scheme prefix.',
    difficulty: 'easy',
    topic: 'SIP URIs',
    is_active: true,
    is_in_final_bank: true
  },
  {
    id: 'q1-1-3',
    section_id: 'section-1-1',
    question_text: 'SIP is text-based, like HTTP',
    question_type: 'true-false',
    options: ['True', 'False'],
    correct_answer: 'True',
    explanation: 'Correct! SIP messages are text-based and human-readable, using a syntax similar to HTTP with headers and body.',
    difficulty: 'easy',
    topic: 'SIP Protocol',
    is_active: true,
    is_in_final_bank: false
  },
  {
    id: 'q1-2-1',
    section_id: 'section-1-2',
    question_text: 'Which SIP method is used to start a call?',
    question_type: 'mcq-4',
    options: ['INVITE', 'REGISTER', 'OPTIONS', 'NOTIFY'],
    correct_answer: 'INVITE',
    explanation: 'INVITE is the SIP method used to initiate a session (start a call). It contains the SDP offer describing the media session.',
    difficulty: 'easy',
    topic: 'SIP Methods',
    is_active: true,
    is_in_final_bank: true
  },
  {
    id: 'q1-2-2',
    section_id: 'section-1-2',
    question_text: 'Which method terminates a SIP call?',
    question_type: 'mcq-4',
    options: ['BYE', 'CANCEL', 'TERMINATE', 'STOP'],
    correct_answer: 'BYE',
    explanation: 'BYE is used to terminate an established session. CANCEL is used to abort a pending INVITE that hasn\'t completed yet.',
    difficulty: 'easy',
    topic: 'SIP Methods',
    is_active: true,
    is_in_final_bank: true
  },
  {
    id: 'q1-2-3',
    section_id: 'section-1-2',
    question_text: 'REGISTER creates a dialog',
    question_type: 'true-false',
    options: ['True', 'False'],
    correct_answer: 'False',
    explanation: 'False. REGISTER does not create a dialog. Only INVITE and SUBSCRIBE create dialogs.',
    difficulty: 'medium',
    topic: 'SIP Dialogs',
    is_active: true,
    is_in_final_bank: true
  },
  {
    id: 'q1-3-1',
    section_id: 'section-1-3',
    question_text: 'What does a 180 Ringing response indicate?',
    question_type: 'mcq-4',
    options: [
      'The callee\'s phone is ringing',
      'The call was answered',
      'The server is processing the request',
      'The call failed'
    ],
    correct_answer: 'The callee\'s phone is ringing',
    explanation: '180 Ringing is a provisional response indicating the destination user agent is alerting the user (phone is ringing).',
    difficulty: 'easy',
    topic: 'Response Codes',
    is_active: true,
    is_in_final_bank: true
  },
  {
    id: 'q1-3-2',
    section_id: 'section-1-3',
    question_text: '200 OK means the request succeeded',
    question_type: 'true-false',
    options: ['True', 'False'],
    correct_answer: 'True',
    explanation: 'Correct! 200 OK is a success response, indicating the request was successfully completed.',
    difficulty: 'easy',
    topic: 'Response Codes',
    is_active: true,
    is_in_final_bank: false
  },
  {
    id: 'q1-3-3',
    section_id: 'section-1-3',
    question_text: 'Which response code indicates authentication is required?',
    question_type: 'mcq-4',
    options: ['401 Unauthorized', '404 Not Found', '486 Busy Here', '503 Service Unavailable'],
    correct_answer: '401 Unauthorized',
    explanation: '401 Unauthorized indicates that valid credentials are required. The response includes a WWW-Authenticate header with the challenge.',
    difficulty: 'medium',
    topic: 'Authentication',
    is_active: true,
    is_in_final_bank: true
  },
  {
    id: 'q2-1-1',
    section_id: 'section-2-1',
    question_text: 'What header in REGISTER contains the user\'s current location?',
    question_type: 'mcq-4',
    options: ['Contact', 'From', 'To', 'Via'],
    correct_answer: 'Contact',
    explanation: 'The Contact header in a REGISTER request contains the URI where the user can currently be reached.',
    difficulty: 'medium',
    topic: 'Registration',
    is_active: true,
    is_in_final_bank: true
  },
  {
    id: 'q2-1-2',
    section_id: 'section-2-1',
    question_text: 'The Expires header sets how long the registration is valid',
    question_type: 'true-false',
    options: ['True', 'False'],
    correct_answer: 'True',
    explanation: 'Correct! The Expires header (or expires parameter in Contact) sets the registration lifetime in seconds.',
    difficulty: 'easy',
    topic: 'Registration',
    is_active: true,
    is_in_final_bank: false
  },
  {
    id: 'q2-2-1',
    section_id: 'section-2-2',
    question_text: 'What authentication method does SIP use?',
    question_type: 'mcq-4',
    options: ['Digest', 'Basic', 'Bearer Token', 'API Key'],
    correct_answer: 'Digest',
    explanation: 'SIP uses Digest authentication (from RFC 2617), which is more secure than Basic auth as it doesn\'t send passwords in plaintext.',
    difficulty: 'medium',
    topic: 'Authentication',
    is_active: true,
    is_in_final_bank: true
  },
  {
    id: 'q2-2-2',
    section_id: 'section-2-2',
    question_text: 'Which response triggers authentication challenge?',
    question_type: 'mcq-4',
    options: ['401 Unauthorized', '403 Forbidden', '407 Proxy Authentication Required', '200 OK'],
    correct_answer: '401 Unauthorized',
    explanation: '401 Unauthorized (for UAS) or 407 Proxy Authentication Required (for proxies) trigger the authentication challenge.',
    difficulty: 'medium',
    topic: 'Authentication',
    is_active: true,
    is_in_final_bank: true
  }
];

// Sample section quiz configs
export const sampleSectionQuizConfigs: SectionQuizConfig[] = [
  {
    section_id: 'section-1-1',
    pass_threshold: 2,
    allow_retries: true,
    max_retries: 3,
    active_questions: ['q1-1-1', 'q1-1-2', 'q1-1-3'],
    pool_questions: []
  },
  {
    section_id: 'section-1-2',
    pass_threshold: 2,
    allow_retries: true,
    max_retries: 3,
    active_questions: ['q1-2-1', 'q1-2-2', 'q1-2-3'],
    pool_questions: []
  },
  {
    section_id: 'section-1-3',
    pass_threshold: 2,
    allow_retries: true,
    max_retries: 3,
    active_questions: ['q1-3-1', 'q1-3-2', 'q1-3-3'],
    pool_questions: []
  },
  {
    section_id: 'section-2-1',
    pass_threshold: 2,
    allow_retries: true,
    max_retries: 3,
    active_questions: ['q2-1-1', 'q2-1-2'],
    pool_questions: []
  },
  {
    section_id: 'section-2-2',
    pass_threshold: 2,
    allow_retries: true,
    max_retries: 3,
    active_questions: ['q2-2-1', 'q2-2-2'],
    pool_questions: []
  }
];

// Sample final test config
export const sampleFinalTestConfig: FinalTestConfig = {
  course_id: 'course-sip-101',
  pass_threshold: 70,
  time_limit_minutes: 60,
  questions_count: 20,
  coverage_guarantee: true,
  randomize: true
};

// Sample branching rules
export const sampleBranchingRules: BranchingRule[] = [
  {
    section_id: 'section-1-1',
    quiz_number: 1,
    score_threshold: 2,
    on_pass: {
      type: 'proceed'
    },
    on_fail: {
      type: 'retry'
    }
  },
  {
    section_id: 'section-1-2',
    quiz_number: 1,
    score_threshold: 2,
    on_pass: {
      type: 'proceed'
    },
    on_fail: {
      type: 'retry'
    }
  },
  {
    section_id: 'section-1-3',
    quiz_number: 1,
    score_threshold: 2,
    on_pass: {
      type: 'proceed'
    },
    on_fail: {
      type: 'retry'
    }
  }
];
