# Level 3 (Advanced) Content - Draft

## Section 11: SIP Security Deep Dive

### Content (600 words)

# SIP Security Deep Dive

Security is paramount in production SIP deployments. This section covers transport encryption (TLS/SRTP), authentication internals, threat models, and security headers used in carrier-grade systems.

## TLS for Signaling Encryption

**TLS (Transport Layer Security)** encrypts SIP signaling to prevent eavesdropping and tampering. SIP over TLS uses port 5061 and the `sips:` URI scheme.

**TLS Handshake**:
1. Client initiates connection to server:5061
2. Server presents X.509 certificate
3. Client validates certificate (checks CA signature, domain match, expiration)
4. Symmetric session keys negotiated
5. All subsequent SIP messages encrypted

**Certificate Validation**:
- **Common Name (CN)** or **Subject Alternative Name (SAN)** must match SIP domain
- Certificate must chain to a trusted Certificate Authority (CA)
- Not expired or revoked

**Example INVITE over TLS**:
```sip
INVITE sips:bob@secure.example.com SIP/2.0
Via: SIP/2.0/TLS client.example.com:5061;branch=z9hG4bKsecure1
From: Alice <sips:alice@example.com>;tag=sec7890
To: Bob <sips:bob@secure.example.com>
Call-ID: secure-call-12345@client.example.com
CSeq: 1 INVITE
Contact: <sips:alice@client.example.com:5061>
Content-Type: application/sdp
Content-Length: 250

[SDP with SRTP crypto attributes]
```

Note the `sips:` scheme—this mandates TLS end-to-end.

## SRTP for Media Encryption

While TLS protects signaling, **SRTP (Secure RTP)** encrypts the media stream. SRTP uses AES encryption with keys exchanged via SDP.

**Two Key Exchange Methods**:

**1. SDES (Security Descriptions, RFC 4568)**:
- Keys embedded in SDP `crypto` attribute
- Simple but requires secure signaling (TLS)

**SDP Example**:
```sdp
m=audio 49170 RTP/SAVP 0
a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:d0RmdmcmVCspeEc3QGZiNWpVLFJhQX1cfHAwJSoj
a=rtpmap:0 PCMU/8000
```

**2. DTLS-SRTP (RFC 5764)**:
- Keys negotiated via DTLS handshake (similar to TLS but for UDP)
- Preferred for WebRTC
- More complex but doesn't expose keys in SDP

## Digest Authentication Internals

Covered in Level 2, but advanced considerations:

**Rainbow Table Attacks**: Pre-computed MD5 hashes can crack weak passwords. Mitigation:
- Use strong passwords (12+ characters, mixed case, symbols)
- Implement rate limiting on authentication failures
- Use SHA-256/SHA-512 (RFC 8760) instead of MD5

**Nonce Expiration**: Servers should expire nonces after 30-60 seconds to limit replay window.

## Threat Models

**SPIT (Spam over Internet Telephony)**:
- Unsolicited calls (robocalls)
- **Defense**: Whitelist/blacklist, CAPTCHA challenges, reputation scoring

**Toll Fraud**:
- Attackers make unauthorized calls to premium-rate numbers
- **Defense**: Strong authentication, IP whitelisting, call destination restrictions, usage monitoring/alerts

**DDoS (Distributed Denial of Service)**:
- Flood server with INVITE/REGISTER requests
- **Defense**: Rate limiting, SIP firewall, geo-blocking, proxy/SBC with attack mitigation

**Man-in-the-Middle (MITM)**:
- Attacker intercepts and modifies SIP messages
- **Defense**: TLS with certificate pinning, mutual TLS authentication

**Registration Hijacking**:
- Attacker re-registers your number to their device
- **Defense**: Strong passwords, IP restrictions, monitor for unexpected de-registrations

## Security Headers

**P-Asserted-Identity (PAI, RFC 3325)**:
- Asserts caller's verified identity in trusted networks
- Added by proxy/B2BUA after authentication

```sip
P-Asserted-Identity: "Alice Smith" <sip:+14155551234@example.com>
```

Telnyx uses PAI to pass verified caller ID information.

**P-Preferred-Identity (PPI)**:
- User suggests identity (not yet verified)
- Proxy validates and converts to PAI

**Identity Header (RFC 8224)**:
- Cryptographic signature proving caller identity
- Prevents caller ID spoofing
- Uses certificates and digital signatures

```sip
Identity: eyJhbGc...

[truncated base64-encoded JWT]
```

## 🔍 SIPper Tip

**Defense in Depth**: Layer security mechanisms:
1. **Network**: Firewall, VPN, IP whitelisting
2. **Transport**: TLS for signaling, SRTP for media
3. **Application**: Digest auth, rate limiting, input validation
4. **Monitoring**: Real-time alerts for suspicious activity

No single mechanism is perfect—combine multiple layers.

## Telnyx Scenario

**Telnyx Security Features**:
- **TLS Support**: Connect via `sip.telnyx.com:5061`
- **IP ACLs**: Whitelist source IPs in Portal
- **Credential Auth**: SIP username/password with digest
- **Fraud Detection**: Automatic alerts for unusual call patterns (e.g., sudden spike to expensive destinations)
- **STIR/SHAKEN**: Telnyx signs outbound calls with cryptographic attestation (combats caller ID spoofing)

**Best Practices**:
1. Use **credentials-based** auth with strong passwords
2. Restrict outbound destinations (block premium-rate if not needed)
3. Enable **fraud alerts** in Portal
4. Use **TLS** for credential-based connections
5. Monitor **CDR (Call Detail Records)** for anomalies

## ⚠️ Common Mistake

**Exposing SIP on public internet without authentication**: Open SIP servers are magnets for fraud. Within hours, attackers will find it and rack up thousands in charges to premium numbers.

**Always** require authentication or use strict IP whitelisting.

## Key Takeaways

- **TLS** encrypts SIP signaling; **SRTP** encrypts media (RTP)
- Key exchange: SDES (keys in SDP) or DTLS-SRTP (keys via handshake)
- Threat models: SPIT, toll fraud, DDoS, MITM, registration hijacking
- **P-Asserted-Identity** carries verified caller ID in trusted networks
- Defense in depth: Network + Transport + Application security + Monitoring
- Never expose SIP without authentication—toll fraud will occur

## 🔗 RFC Reference

RFC 5246 (TLS 1.2), RFC 3711 (SRTP), RFC 4568 (SDES), RFC 5764 (DTLS-SRTP), RFC 3325 (P-Asserted-Identity), RFC 8224 (SIP Identity), RFC 8760 (SHA-256 Digest)

---

## Section 12: Advanced SIP Topologies

### Content (650 words)

# Advanced SIP Topologies

Production SIP systems use complex topologies to provide features, scalability, and reliability beyond basic user agent to proxy architectures.

## Back-to-Back User Agent (B2BUA)

A **B2BUA** splits a call into two independent SIP call legs:
- **Leg A**: UAC → B2BUA (B2BUA acts as UAS)
- **Leg B**: B2BUA → UAS (B2BUA acts as UAC)

The B2BUA terminates both dialogs and can independently control each leg.

**Capabilities**:
- **Call recording**: B2BUA can fork media to recording server
- **Transcoding**: Convert codecs between incompatible endpoints
- **Billing**: Track precise call duration per leg
- **Call control**: Transfer, park, bridge calls programmatically
- **Topology hiding**: Prevent endpoints from learning network internals

**Trade-offs**:
- **Scalability**: Lower than proxies (maintains full call state)
- **Complexity**: More code, more failure modes
- **Media handling**: May need to relay media (not just signaling)

**Example: Call Transfer**
```
Alice ←(Leg A)→ B2BUA ←(Leg B)→ Bob

Alice requests transfer to Charlie:
B2BUA receives REFER from Alice
B2BUA sends BYE to Bob (Leg B)
B2BUA creates new Leg C to Charlie
Alice ←(Leg A)→ B2BUA ←(Leg C)→ Charlie
```

## Session Border Controller (SBC)

An **SBC** is a specialized B2BUA deployed at network boundaries to:
1. **Topology Hiding**: Conceal internal network structure
2. **NAT Traversal**: Fix SIP/SDP for devices behind NAT
3. **Security**: Firewall, DoS protection, encryption enforcement
4. **Interoperability**: Protocol translation, codec transcoding
5. **QoS**: Traffic shaping, prioritization

**Typical Deployment**:
```
Internet ←→ SBC ←→ Enterprise Network
        (DMZ)    (Internal PBX)
```

The SBC acts as a security and protocol gateway.

**SBC Functions**:
- **SIP Normalization**: Fix malformed messages from non-compliant devices
- **Media Relay**: Proxy RTP to traverse firewalls
- **Codec Enforcement**: Reject unsupported codecs
- **Fraud Prevention**: Rate limiting, geo-blocking
- **TLS Offloading**: Terminate TLS, forward to internal network via TCP/UDP

**Example SBC Vendors**: Ribbon, Oracle Acme Packet, Cisco, AudioCodes, Kamailio (open-source)

## Distributed Systems & Clustering

For carrier-grade scale, SIP infrastructure is distributed across multiple servers.

**Load Balancing**:
- **DNS SRV Records**: Distribute across servers (`_sip._udp.example.com`)
- **Layer 4 Load Balancer**: Distribute based on IP/port (e.g., HAProxy, F5)
- **Layer 7 Load Balancer**: SIP-aware, can route based on Call-ID, From header

**Example DNS SRV**:
```
_sip._tcp.example.com.  86400  IN  SRV  10 60 5060 sip1.example.com.
_sip._tcp.example.com.  86400  IN  SRV  10 40 5060 sip2.example.com.
```
- Priority 10 (same)
- Weight 60/40 (60% to sip1, 40% to sip2)

**Clustering**:
- **Active-Active**: All nodes handle traffic, share state via database (e.g., Redis, Cassandra)
- **Active-Passive**: Primary node handles traffic, secondary stands by for failover
- **Sharding**: Partition users across servers (e.g., by user ID hash)

**State Synchronization**:
- **Stateless Proxy**: No shared state needed (scales infinitely)
- **Stateful Proxy**: Replicate transaction/dialog state across cluster
- **B2BUA/Registrar**: Share location database, call state via backend DB

## Geographic Redundancy

Deploy SIP infrastructure across multiple data centers for disaster recovery.

**Multi-Region Architecture**:
```
        DNS (GeoDNS)
       /              \
US-East Region      EU-West Region
  - Proxy Cluster     - Proxy Cluster
  - Registrar         - Registrar
  - Media Gateways    - Media Gateways
```

**GeoDNS**: Route users to nearest region based on IP geolocation.

**Challenges**:
- **Registration Sync**: User registered in US-East must be reachable from EU-West
- **Call Routing**: Cross-region calls must traverse media gateways efficiently
- **Failover**: If US-East goes down, EU-West must handle its load

**Solutions**:
- **Global Database**: Centralized or replicated location service (e.g., DynamoDB Global Tables)
- **Anycast**: Same IP announced from multiple regions, traffic routes to nearest
- **Health Checks**: Monitor regional availability, fail traffic away from unhealthy regions

## 🔍 SIPper Tip

**When to Use What**:
- **Proxy**: Need scalability, simple routing, stateless operation
- **B2BUA**: Need call control, recording, billing, feature richness
- **SBC**: Need security, NAT traversal, carrier interconnect
- **Cluster**: Need redundancy, scale beyond one server
- **Geographic**: Need global reach, disaster recovery

Most production systems combine multiple: SBC at edge, proxies for routing, B2BUA for features, clustered for scale, geo-distributed for DR.

## Telnyx Scenario

**Telnyx Infrastructure Topology**:
- **Global Anycast Network**: 30+ regions worldwide
- **SBCs at Edge**: Handle customer SIP connections, NAT, security
- **Distributed Routing Layer**: Intelligent call routing to PSTN/SIP destinations
- **Redundant Media Gateways**: RTP transcoding, PSTN interconnect in each region
- **Centralized Control Plane**: Call Control API, webhooks, orchestration

When you send INVITE to `sip.telnyx.com`, DNS returns the nearest Telnyx edge SBC. That SBC routes your call through Telnyx's global network to the destination (PSTN, SIP endpoint, etc.).

**For High-Availability Customers**:
- Multi-region SIP Connection configuration
- Automatic failover across regions
- SLA guarantees with redundant infrastructure

## ⚠️ Common Mistake

**Single Point of Failure**: Deploying one server without redundancy. If it fails, your entire phone system is down.

**Minimum Production Setup**:
- 2+ servers in active-active cluster (load balanced)
- Shared database with replication
- Health checks and automatic failover

## Key Takeaways

- **B2BUA** terminates both call legs, enabling call control, recording, transcoding
- **SBC** sits at network edge for security, NAT, interoperability, DoS protection
- **Distributed systems** use load balancing (DNS SRV, Layer 4/7 LB) and clustering (active-active, active-passive)
- **Geographic redundancy** deploys across multiple regions with GeoDNS and global state sync
- Production systems combine: SBC (edge) + Proxy (routing) + B2BUA (features) + Clustering (scale) + Geo (DR)
- Avoid single points of failure—always design for redundancy

## 🔗 RFC Reference

RFC 3261 (B2BUA concept), RFC 2782 (DNS SRV), vendor-specific SBC documentation

---

## Section 13: SIP Troubleshooting & Debugging

### Content (700 words)

# SIP Troubleshooting & Debugging

When SIP calls fail, systematic troubleshooting with packet captures and trace analysis is essential. This section covers Wireshark analysis, common failure patterns, and debugging techniques.

## Wireshark SIP Analysis

**Wireshark** is the industry-standard tool for SIP packet analysis.

**Capturing SIP Traffic**:
```bash
# Linux/Mac
sudo tcpdump -i any -s 65535 -w sipcall.pcap port 5060 or port 5061

# Or use Wireshark GUI capture on interface
```

**Wireshark SIP Filters**:
```
sip                          # All SIP traffic
sip.Method == "INVITE"       # Only INVITE requests
sip.Status-Code == 404       # Only 404 responses
sip.Call-ID == "abc123"      # Specific call
sip.from.user == "alice"     # From specific user
```

**Following a SIP Call**:
1. Find the initial INVITE (filter: `sip.Method == "INVITE"`)
2. Note the **Call-ID**
3. Filter: `sip.Call-ID == "that-call-id"`
4. Analyze the full call flow: INVITE → 1xx → 200 OK → ACK → BYE → 200 OK

**Analyzing SDP**:
- Look for codec mismatch (offered vs accepted)
- Check c= line for unreachable IPs (private IPs over public internet)
- Verify port numbers are open/forwarded

**RTP Analysis**:
```
Telephony → RTP → Show All Streams
```
- Check for packet loss, jitter, out-of-order packets
- Listen to decoded audio (if codec supported)

## Common Failure Patterns

### 1. **403 Forbidden (Authentication Failure)**

**Symptoms**: REGISTER or INVITE fails with 403 after providing credentials.

**Causes**:
- Wrong username/password
- Password hash mismatch (HA1 pre-computed incorrectly)
- IP not whitelisted (server requires both auth + IP)

**Debug**:
- Verify credentials in server config
- Check if server uses IP whitelist
- Review Authorization header computation

### 2. **408 Request Timeout**

**Symptoms**: INVITE times out, no response from callee.

**Causes**:
- Destination unreachable (offline, network issue)
- Firewall blocking SIP traffic
- NAT timeout (request lost)

**Debug**:
- Ping destination
- Check firewall rules (port 5060/5061)
- Verify routing (traceroute)
- Look for ICMP "Destination Unreachable" packets

### 3. **484 Address Incomplete / 404 Not Found**

**Symptoms**: Call fails immediately with 484 or 404.

**Causes**:
- Invalid phone number format
- User not registered
- Routing failure (no route to destination)

**Debug**:
- Check Request-URI format
- Query location service (is user registered?)
- Review dial plan/routing logic

### 4. **488 Not Acceptable Here (Codec Mismatch)**

**Symptoms**: Call rejected with 488 after INVITE.

**Causes**:
- No common codec between caller and callee
- SDP malformed

**Debug**:
- Compare m= lines in INVITE offer vs remote capabilities
- Add more common codecs (PCMU, PCMA always safe)
- Check SDP syntax (validate with online parser)

### 5. **One-Way Audio or No Audio**

**Symptoms**: Call connects (200 OK), but audio missing or only one direction.

**Causes**:
- **SDP c= line has unreachable IP** (private IP, wrong interface)
- **Firewall blocks RTP ports** (usually UDP 10000-20000)
- **NAT not traversed** (SIP signaling works, but RTP can't reach)
- **Codec mismatch** (negotiation succeeded but encoding failed)

**Debug**:
1. **Check SDP**: Extract from INVITE and 200 OK
   - Does c= line contain reachable public IP?
   - Are ports correct?
2. **Test RTP connectivity**:
   ```bash
   # On receiver, listen on RTP port
   nc -ul 49170
   
   # On sender, send test packets
   echo "test" | nc -u receiver-ip 49170
   ```
3. **Check firewall**: Verify UDP ports open
4. **Wireshark RTP analysis**: Telephony → RTP → Show All Streams
   - Look for "RTP stream not found" (media not flowing)

### 6. **BYE Not Received (Hung Call)**

**Symptoms**: Call doesn't terminate cleanly, stays "active" indefinitely.

**Causes**:
- BYE request lost (network issue, NAT timeout)
- Endpoint crashed before sending BYE
- Firewall dropped BYE

**Debug**:
- Capture BYE in packet trace
- Check if sent to correct Contact (from 200 OK)
- Verify routing (proxies may have changed)
- Implement **session timers** (RFC 4028) for automatic cleanup

## SIP Trace Interpretation

**Example Trace Analysis**:
```
Time    Source          Dest            Protocol  Info
0.000   192.168.1.100   sip.telnyx.com  SIP       Request: INVITE sip:+14155551234
0.150   sip.telnyx.com  192.168.1.100   SIP       Status: 100 Trying
0.300   sip.telnyx.com  192.168.1.100   SIP       Status: 183 Session Progress
2.500   sip.telnyx.com  192.168.1.100   SIP       Status: 200 OK
2.505   192.168.1.100   sip.telnyx.com  SIP       Request: ACK
[RTP flows for 30 seconds]
32.800  192.168.1.100   sip.telnyx.com  SIP       Request: BYE
32.850  sip.telnyx.com  192.168.1.100   SIP       Status: 200 OK
```

**Analysis**:
- 0.150s: Telnyx acknowledged INVITE quickly (healthy)
- 0.300s: 183 with early media (ringback)
- 2.500s: Call answered after ~2.2 seconds (normal ring time)
- RTP flows (check separate RTP analysis)
- 32.800s: Call terminated cleanly

## Performance Optimization

**Reduce Latency**:
- Use UDP instead of TCP/TLS (unless security required)
- Deploy regionally to minimize round-trip time
- Minimize proxy hops

**Scale Registrations**:
- Use stateless registration proxies
- Distribute load via DNS SRV
- Use Redis/Cassandra for location service (fast lookups)

**Call Capacity**:
- B2BUA/SBC are bottlenecks (CPU-intensive)
- Stateless proxies scale linearly (add more servers)
- Offload media to separate gateways (don't co-locate with signaling)

## 🔍 SIPper Tip

**Call-ID is Your Friend**: Always log Call-ID. When users report issues, ask for the phone number and time—then search logs by Call-ID to see the exact SIP message flow. This pinpoints failures instantly.

## Telnyx Scenario

**Telnyx Support Troubleshooting**:
When opening a support ticket:
1. **Provide Call-ID** from your SIP logs
2. **Provide timestamp** (with timezone)
3. **Attach packet capture** if available (Wireshark .pcap)

Telnyx support correlates your Call-ID with internal logs to see both sides of the call flow.

**Common Telnyx Issues**:
- **403 Forbidden**: Check credentials in Portal (case-sensitive)
- **404 Not Found**: Verify phone number is routable (check ownership in Portal)
- **One-way audio**: Ensure your SDP c= line contains public IP (use STUN or static IP)

## ⚠️ Common Mistake

**Debugging without packet captures**: Reading application logs without seeing actual SIP messages is like debugging blindfolded. Always capture packets when troubleshooting SIP.

## Key Takeaways

- **Wireshark** is essential for SIP troubleshooting (capture, filter by Call-ID, analyze SDP and RTP)
- Common failures: 403 (auth), 408 (timeout), 404 (not found), 488 (codec), one-way audio (NAT/firewall)
- **One-way audio**: Check SDP c= line (reachable IP?), RTP ports (firewall?), NAT traversal (STUN?)
- Always **log Call-ID** for correlation across systems
- Use **session timers** to prevent hung calls
- **Packet captures** are mandatory for root cause analysis

## 🔗 RFC Reference

RFC 3261 (error codes), RFC 4028 (Session Timers), Wireshark documentation

---

## Section 14: SIP Extensions & RFCs

### Content (650 words)

# SIP Extensions & RFCs

SIP's core (RFC 3261) is extended by numerous RFCs adding features like reliable provisionals, mid-call updates, event notification, and WebRTC interop. This section covers key extensions.

## RFC 3262: PRACK (Provisional Response Acknowledgment)

**Problem**: Provisional responses (1xx) are unreliable—sent once, no retransmission. If lost, caller doesn't know call progress.

**Solution**: **PRACK** makes provisional responses reliable.

**How PRACK Works**:
1. UAC includes `Supported: 100rel` in INVITE
2. UAS sends reliable provisional (e.g., 183) with `Require: 100rel` and `RSeq` header
3. UAC acknowledges with **PRACK** request
4. UAS responds 200 OK to PRACK
5. Call proceeds normally

**Example Flow**:
```
UAC → INVITE (Supported: 100rel)
UAS → 183 Session Progress (Require: 100rel, RSeq: 1)
UAC → PRACK
UAS → 200 OK (to PRACK)
...
UAS → 200 OK (to INVITE)
UAC → ACK
```

**Use Cases**:
- Guaranteed delivery of early media SDP (183 with SDP)
- Critical progress notifications
- IMS (IP Multimedia Subsystem) networks

**RSeq Header** (Reliable Sequence):
```sip
RSeq: 1
```
Increments for each reliable provisional within a dialog.

**PRACK Request**:
```sip
PRACK sip:bob@biloxi.com SIP/2.0
RAck: 1 314159 INVITE
```
The `RAck` header acknowledges RSeq 1, CSeq 314159, method INVITE.

## RFC 3311: UPDATE

**Problem**: Want to modify session parameters mid-call without the offer/answer overhead of re-INVITE.

**Solution**: **UPDATE** method changes session parameters before or after establishment.

**UPDATE vs re-INVITE**:
- **UPDATE**: Lightweight, no 3-way handshake, can be used before call answered
- **re-INVITE**: Full transaction, requires ACK, only after call established

**Example: Updating SDP Before Answer**:
```
UAC → INVITE (offer: PCMU, PCMA)
UAS → 183 Session Progress
UAC → UPDATE (new offer: add G.722)
UAS → 200 OK (answer: PCMU, G.722)
UAS → 180 Ringing
UAS → 200 OK (to INVITE)
UAC → ACK
```

UPDATE allowed modifying codecs before the call was answered.

**Use Cases**:
- Update SDP during early dialog (before 200 OK to INVITE)
- Modify session without triggering re-INVITE timers
- Preconditions (RFC 3312): ensure QoS before ringing

## RFC 6665: SUBSCRIBE/NOTIFY (Event Notification)

**Problem**: How to monitor state changes (e.g., voicemail waiting, presence) without polling?

**Solution**: **SUBSCRIBE** to events, receive **NOTIFY** when state changes.

**Flow**:
```
UAC → SUBSCRIBE sip:alice@example.com (Event: message-summary)
UAS → 200 OK
UAS → NOTIFY (message-summary: 3 new voicemails)
UAC → 200 OK
[later, new voicemail arrives]
UAS → NOTIFY (message-summary: 4 new voicemails)
UAC → 200 OK
```

**Common Event Packages**:
- `message-summary`: Voicemail waiting indicator (MWI)
- `presence`: User availability (online, busy, away)
- `dialog`: Call state monitoring (for BLF - Busy Lamp Field)
- `reg`: Registration state changes

**Subscription Expiration**:
```sip
SUBSCRIBE sip:alice@example.com SIP/2.0
Event: presence
Expires: 3600
```
Subscriber must refresh before expiration (similar to REGISTER).

**NOTIFY Example**:
```sip
NOTIFY sip:bob@192.0.2.4 SIP/2.0
Event: message-summary
Subscription-State: active;expires=3200
Content-Type: application/simple-message-summary
Content-Length: 50

Messages-Waiting: yes
Message-Account: sip:alice@example.com
Voice-Message: 4/2 (4/1)
```

**Interpreting**: Alice has 4 new + 2 old voicemails (4 new urgent, 1 old urgent).

## WebRTC SIP Interoperability

**WebRTC** (Web Real-Time Communication) enables browser-based voice/video without plugins. SIP is commonly used for WebRTC signaling.

**Key Differences**:
- **Transport**: WebRTC uses WebSocket (ws:// or wss://), not UDP/TCP
- **Media**: WebRTC mandates SRTP (encrypted), SIP often uses unencrypted RTP
- **ICE**: WebRTC requires ICE (STUN/TURN) for NAT traversal
- **Codecs**: WebRTC prefers Opus and VP8/VP9; legacy SIP uses PCMU/PCMA

**WebRTC SIP Gateway Architecture**:
```
Browser (WebRTC) ←WebSocket→ SIP Gateway ←SIP/UDP→ Legacy SIP Phone
                              ↓
                         ICE/STUN/TURN
                         SRTP ↔ RTP transcoding
                         Opus ↔ PCMU transcoding
```

**SDP Differences**:
- **WebRTC SDP**: Includes ICE candidates, fingerprint for DTLS-SRTP
- **Legacy SIP SDP**: Simple c= line, SDES crypto or no encryption

**Example WebRTC SDP Snippet**:
```sdp
m=audio 9 UDP/TLS/RTP/SAVPF 111
a=rtpmap:111 opus/48000/2
a=ice-ufrag:F7gI
a=ice-pwd:x9cml/YzichV2+XlhiMu8g
a=fingerprint:sha-256 49:66:12:...
a=candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host
```

**Integration Tips**:
- Use **SIP.js** or **JsSIP** library for WebRTC SIP signaling in browser
- Deploy **Kamailio, FreeSWITCH, or Asterisk** as WebRTC-capable SIP server
- Transcode codecs (Opus ↔ PCMU/PCMA) for legacy interop
- Terminate TLS/WSS at edge (browsers require secure context)

## 🔍 SIPper Tip

**When to Use Each**:
- **PRACK**: Critical provisional responses (IMS, carrier interconnect)
- **UPDATE**: Modify session before answer or lightweight mid-call changes
- **SUBSCRIBE/NOTIFY**: Event-driven updates (MWI, presence, BLF)
- **WebRTC**: Browser-based calling, click-to-call, WebSDKs

## Telnyx Scenario

**Telnyx & WebRTC**:
- **Telnyx WebRTC Client SDK**: JavaScript library for browser calling
- Uses **WebSocket** (wss://) for SIP signaling
- Handles ICE/STUN automatically
- Transcodes to/from PSTN (Opus ↔ G.711)

**Telnyx MWI Support**:
- Telnyx can send NOTIFY for message-summary (voicemail indicator)
- Configure in Portal: SIP Connection → Features → Message Waiting Indicator

**PRACK Support**:
- Telnyx supports PRACK for IMS interconnect scenarios
- Include `Supported: 100rel` in your INVITE

## ⚠️ Common Mistake

**Assuming all SIP servers support extensions**: Always check `Supported` and `Allow` headers in responses. If a server doesn't support UPDATE, fall back to re-INVITE.

**Use Feature Negotiation**:
```sip
INVITE sip:bob@example.com SIP/2.0
Supported: 100rel, timer, replaces
```
Server responds with what it supports, or `420 Bad Extension` if you `Require` something unsupported.

## Key Takeaways

- **PRACK** (RFC 3262) makes provisional responses (1xx) reliable with RSeq/RAck
- **UPDATE** (RFC 3311) modifies session params without re-INVITE overhead
- **SUBSCRIBE/NOTIFY** (RFC 6665) enables event-driven notifications (MWI, presence, dialog state)
- **WebRTC + SIP**: Use WebSocket transport, SRTP media, ICE NAT traversal, Opus codec
- Always negotiate features via `Supported`/`Require` headers—not all servers support all extensions
- WebRTC ↔ legacy SIP requires transcoding (Opus ↔ PCMU, SRTP ↔ RTP)

## 🔗 RFC Reference

RFC 3262 (PRACK), RFC 3311 (UPDATE), RFC 6665 (SUBSCRIBE/NOTIFY), RFC 3265 (Event Notification), WebRTC specs (W3C)

---

## Section 15: Building Production SIP Systems

### Content (700 words)

# Building Production SIP Systems

Deploying carrier-grade SIP infrastructure requires careful attention to scalability, availability, monitoring, and capacity planning. This section covers production best practices.

## Scalability Patterns

**Horizontal Scaling** (add more servers):
- **Stateless Proxies**: Scale linearly—add servers behind load balancer
- **Registrars**: Shard users by hash (e.g., username hash % N servers)
- **B2BUA/SBC**: Harder to scale (stateful), use clustering with shared state

**Vertical Scaling** (bigger servers):
- More CPU/RAM per server
- Eventually hits limits (cost, single point of failure)

**Recommended**: Horizontal scaling with load balancing.

**Load Balancing Strategies**:
1. **DNS SRV**: Simple, client-side, no single point of failure
   ```
   _sip._udp.example.com. 300 IN SRV 10 50 5060 sip1.example.com.
   _sip._udp.example.com. 300 IN SRV 10 50 5060 sip2.example.com.
   ```
2. **Layer 4 LB** (HAProxy, Nginx): IP hash, least connections
3. **Layer 7 LB** (Kamailio dispatcher): Call-ID consistent hashing

**Database Scaling**:
- **Location Service**: Redis (in-memory, fast lookups), Cassandra (distributed)
- **CDR Storage**: TimescaleDB (time-series), S3 (object storage for long-term)
- **Replication**: Master-slave (read replicas), multi-master (active-active)

## High Availability Design

**Eliminate Single Points of Failure**:
- **2+ SIP servers** in active-active cluster
- **2+ database nodes** with replication
- **Multiple network paths** (redundant ISPs, BGP failover)
- **Geographic redundancy** (multi-region deployment)

**Failover Strategies**:
- **DNS-based**: Clients retry next SRV record if primary fails
- **Load Balancer Health Checks**: Automatically remove failed servers
- **Active-Passive Cluster**: VRRP/keepalived for virtual IP failover

**Example Active-Active Setup**:
```
          ┌─────────────┐
          │   DNS SRV   │
          └──────┬──────┘
                 │
        ┌────────┴────────┐
        │                 │
   ┌────▼────┐      ┌────▼────┐
   │  SIP1   │      │  SIP2   │
   │(Active) │      │(Active) │
   └────┬────┘      └────┬────┘
        │                 │
        └────────┬────────┘
                 │
          ┌──────▼──────┐
          │  Redis HA   │
          │  (Sentinel) │
          └─────────────┘
```

Both SIP servers handle traffic, share state via Redis with Sentinel for automatic failover.

**Health Checks**:
- **SIP OPTIONS ping**: Send OPTIONS to server, expect 200 OK
- **Application-level**: Check registration count, call success rate
- **Failover threshold**: 3 consecutive failures → remove from rotation

## Monitoring & Alerting

**Key Metrics to Monitor**:

**Availability**:
- **SIP response rate**: % of requests receiving responses
- **Call success rate** (CSR): % of INVITEs resulting in 200 OK
- **Registration success rate**: % of REGISTERs succeeding

**Performance**:
- **Post-Dial Delay (PDD)**: Time from INVITE to first ring (180/183)
- **Answer Seizure Ratio (ASR)**: % of calls answered vs attempted
- **Average Call Duration (ACD)**
- **Latency**: SIP transaction round-trip time

**Capacity**:
- **Concurrent calls** (CPS - Calls Per Second sustained)
- **Registrations**: Active bindings
- **CPU/Memory**: Server resource utilization
- **Network bandwidth**: Mbps consumed

**Error Rates**:
- **4xx errors**: Client issues (404, 486, 408)
- **5xx errors**: Server issues (500, 503)
- **REGISTER failures**: Auth failures, timeouts

**Tools**:
- **Prometheus + Grafana**: Time-series metrics and dashboards
- **Homer**: SIP capture and search (like Wireshark for production)
- **Elastic Stack**: Log aggregation and analysis
- **PagerDuty/OpsGenie**: On-call alerting

**Example Alert Rules**:
```
CSR < 95% for 5 minutes → Page on-call engineer
5xx errors > 50/min → Warning
Registration failures > 10% → Critical
```

## Capacity Planning

**Estimate Load**:
1. **User base**: N users
2. **Concurrency ratio**: % of users on calls simultaneously (typically 5-15%)
3. **Call duration**: Average call length (e.g., 3 minutes)
4. **Peak hour**: Busy Hour Call Attempts (BHCA)

**Example**:
- 10,000 users
- 10% concurrency = 1,000 concurrent calls
- Peak BHCA = 5,000 calls/hour = 83 calls/min ≈ 1.4 CPS

**Sizing**:
- **Stateless Proxy**: 10,000+ CPS per server (CPU-bound)
- **Registrar**: 5,000 concurrent registrations per server (memory-bound)
- **B2BUA/SBC**: 500-2,000 CPS per server (varies by features, CPU)
- **Media Gateway**: 1,000-5,000 concurrent transcoded calls per server

**Growth Planning**:
- Design for **3x peak load** (headroom for spikes)
- Plan capacity for **2 years growth**
- **Auto-scaling**: Cloud deployments can add servers dynamically

**Load Testing**:
- **SIPp**: Open-source SIP load generator
- **Simulate registration storms**, **call floods**, **hold time**
- Test failover: kill primary server mid-test, verify graceful failover

**Example SIPp Command**:
```bash
# Generate 100 concurrent calls, 10 CPS rate
sipp -sn uac -s 14155551234 -r 10 -l 100 -m 1000 sip.example.com
```

## 🔍 SIPper Tip

**Plan for Failure**: Your system WILL fail eventually (hardware, network, software bug). Design assumes failure:
- No single point of failure
- Automatic failover (not manual)
- Graceful degradation (shed load, not crash)
- Observability (know what failed and why)

## Telnyx Scenario

**Telnyx Production Practices** (what we do, you can too):
- **Global Anycast**: 30+ regions, automatic routing to nearest edge
- **N+1 Redundancy**: Every component has spare capacity
- **Observability**: Real-time dashboards (CSR, PDD, ASR) per customer
- **Auto-scaling**: Media gateways scale based on call volume
- **SLA**: 99.99% uptime guarantee (4.38 minutes downtime/month)

**For Customers Building on Telnyx**:
- Use **multiple SIP Connection regions** for redundancy
- Monitor **Telnyx webhooks** for call failures (404, 503) → alert
- **Rate limiting**: Implement on your side to prevent self-DoS
- **CDR analysis**: Review daily for anomalies (fraud detection)

## ⚠️ Common Mistake

**Over-engineering early**: Don't build for 1 million users when you have 100. Start simple (2-server HA), scale incrementally based on real metrics.

**Premature optimization** wastes time. Build MVP, measure, optimize bottlenecks.

## Key Takeaways

- **Horizontal scaling** (add servers) beats vertical (bigger servers) for SIP
- **High availability**: 2+ servers, active-active, no single point of failure, health checks
- **Monitor**: CSR, ASR, PDD, error rates, capacity—use Prometheus, Grafana, Homer
- **Capacity planning**: Estimate concurrency, size for 3x peak, load test with SIPp
- **Design for failure**: Assume components will fail, automate failover, observe everything
- Start simple, scale based on real metrics, avoid premature optimization

## 🔗 RFC Reference

RFC 3261 (SIP core), SIPp documentation, Prometheus/Grafana/Homer documentation

---

# Questions for Level 3 (35 total)

## Section 11 Questions (7 total: 5 active + 2 backup)

### q3-1-1 (Active)
**Question**: What port does SIP over TLS typically use?
**Type**: multiple_choice
**Options**:
- 5060
- 5061
- 443
- 8080
**Correct**: 5061
**Explanation**: SIP over TLS (SIPS) uses port 5061 by default. Port 5060 is for unencrypted SIP (UDP/TCP), port 443 is for HTTPS, and 8080 is a common HTTP alternate port. The SIPS URI scheme mandates TLS transport for end-to-end encryption.
**Difficulty**: Easy
**Topic**: TLS

### q3-1-2 (Active)
**Question**: Which protocol encrypts SIP media (RTP)?
**Type**: multiple_choice
**Options**:
- TLS
- SRTP
- HTTPS
- IPsec
**Correct**: SRTP
**Explanation**: SRTP (Secure RTP) encrypts media streams. TLS encrypts SIP signaling, not media. HTTPS is for web traffic, and while IPsec can encrypt IP packets, SRTP is the standard for RTP encryption in VoIP.
**Difficulty**: Easy
**Topic**: Media Encryption

### q3-1-3 (Active)
**Question**: In SDES key exchange, where are SRTP keys transmitted?
**Type**: multiple_choice
**Options**:
- In the SIP headers
- In the SDP crypto attribute
- In a separate HTTPS request
- Via DTLS handshake
**Correct**: In the SDP crypto attribute
**Explanation**: SDES (Security Descriptions) embeds SRTP keys directly in the SDP 'a=crypto' attribute. This requires SIP signaling to be encrypted (TLS) to protect the keys. DTLS-SRTP uses a handshake instead of embedding keys in SDP.
**Difficulty**: Medium
**Topic**: SRTP Key Exchange

### q3-1-4 (Active)
**Question**: What header carries verified caller ID in trusted SIP networks?
**Type**: multiple_choice
**Options**:
- From
- Contact
- P-Asserted-Identity
- Identity
**Correct**: P-Asserted-Identity
**Explanation**: P-Asserted-Identity (PAI, RFC 3325) carries verified caller ID information in trusted networks. The From header is set by the user (not verified), Contact is for routing, and the Identity header (RFC 8224) uses cryptographic signatures (different mechanism).
**Difficulty**: Medium
**Topic**: Security Headers

### q3-1-5 (Active)
**Question**: Which threat involves attackers making unauthorized calls to premium-rate numbers?
**Type**: multiple_choice
**Options**:
- SPIT
- DDoS
- Toll Fraud
- Registration Hijacking
**Correct**: Toll Fraud
**Explanation**: Toll fraud occurs when attackers gain unauthorized access to a SIP system and make calls to expensive destinations (premium-rate, international). SPIT is spam calls, DDoS is denial of service, and registration hijacking redirects inbound calls.
**Difficulty**: Easy
**Topic**: Threat Models

### q3-1-backup-1 (Backup)
**Question**: TLS encrypts both SIP signaling and RTP media.
**Type**: true_false
**Options**:
- True
- False
**Correct**: False
**Explanation**: False. TLS encrypts only SIP signaling. Media (RTP) requires a separate encryption mechanism—SRTP. For end-to-end security, use TLS for signaling AND SRTP for media.
**Difficulty**: Medium
**Topic**: Encryption Scope

### q3-1-backup-2 (Backup)
**Question**: What is the primary defense against SIP toll fraud?
**Type**: multiple_choice
**Options**:
- Disabling TLS
- Strong authentication and IP whitelisting
- Using only UDP transport
- Removing all firewall rules
**Correct**: Strong authentication and IP whitelisting
**Explanation**: Strong authentication (digest with complex passwords) and IP whitelisting prevent unauthorized access, which is the root cause of toll fraud. Disabling security features (TLS, firewalls) makes fraud easier, not harder.
**Difficulty**: Medium
**Topic**: Fraud Prevention

## Section 12 Questions (7 total: 5 active + 2 backup)

### q3-2-1 (Active)
**Question**: How does a B2BUA differ from a stateless proxy?
**Type**: multiple_choice
**Options**:
- B2BUA routes faster
- B2BUA terminates both call legs as an endpoint
- B2BUA can't handle NAT
- B2BUA is more scalable
**Correct**: B2BUA terminates both call legs as an endpoint
**Explanation**: A B2BUA (Back-to-Back User Agent) terminates the call as both UAS and UAC, creating two independent dialogs. This enables call control but reduces scalability compared to stateless proxies that simply route without maintaining state.
**Difficulty**: Medium
**Topic**: B2BUA

### q3-2-2 (Active)
**Question**: What is the primary function of a Session Border Controller (SBC)?
**Type**: multiple_choice
**Options**:
- Store call recordings
- Provide security, NAT traversal, and interoperability at network edges
- Generate billing records
- Host conference bridges
**Correct**: Provide security, NAT traversal, and interoperability at network edges
**Explanation**: SBCs sit at network boundaries to provide security (firewall, DoS protection), NAT traversal (fix SIP/SDP for NAT), and interoperability (protocol translation, codec transcoding). While they may assist with billing/recording, that's not their primary function.
**Difficulty**: Easy
**Topic**: SBC

### q3-2-3 (Active)
**Question**: In DNS SRV load balancing, what does the 'weight' parameter control?
**Type**: multiple_choice
**Options**:
- Maximum call duration
- Proportional traffic distribution among servers
- Packet size limits
- Encryption strength
**Correct**: Proportional traffic distribution among servers
**Explanation**: The weight parameter in DNS SRV records controls proportional load distribution. For example, weights 60/40 send 60% of traffic to one server and 40% to another. Priority determines order of failover.
**Difficulty**: Medium
**Topic**: Load Balancing

### q3-2-4 (Active)
**Question**: What is GeoDNS used for in SIP deployments?
**Type**: multiple_choice
**Options**:
- Encrypting DNS queries
- Routing users to the nearest regional data center based on IP location
- Storing geographic coordinates in SIP headers
- Translating phone numbers to addresses
**Correct**: Routing users to the nearest regional data center based on IP location
**Explanation**: GeoDNS returns different IP addresses based on the client's geographic location (via IP geolocation), routing users to the nearest data center to minimize latency and provide regional redundancy.
**Difficulty**: Medium
**Topic**: Geographic Redundancy

### q3-2-5 (Active)
**Question**: Which topology component provides the BEST scalability for SIP routing?
**Type**: multiple_choice
**Options**:
- B2BUA
- Stateless Proxy
- SBC
- Media Gateway
**Correct**: Stateless Proxy
**Explanation**: Stateless proxies are the most scalable SIP component because they don't maintain transaction state—they simply forward messages based on current request data. B2BUAs and SBCs maintain call state (less scalable), and media gateways handle RTP (not SIP routing).
**Difficulty**: Medium
**Topic**: Scalability

### q3-2-backup-1 (Backup)
**Question**: A B2BUA can perform call recording by forking media to a recording server.
**Type**: true_false
**Options**:
- True
- False
**Correct**: True
**Explanation**: True. Because a B2BUA participates in the call as an endpoint, it can fork (duplicate) media streams to a recording server, enabling call recording. Stateless proxies cannot do this as they don't handle media.
**Difficulty**: Easy
**Topic**: B2BUA Capabilities

### q3-2-backup-2 (Backup)
**Question**: What is the main advantage of active-active clustering over active-passive?
**Type**: multiple_choice
**Options**:
- Simpler configuration
- Better resource utilization (all nodes handle traffic)
- Lower cost
- No need for shared state
**Correct**: Better resource utilization (all nodes handle traffic)
**Explanation**: In active-active clustering, all nodes handle traffic simultaneously, maximizing resource utilization. Active-passive has a standby node that sits idle until failover, wasting capacity. Active-active requires state synchronization (more complex) but uses resources efficiently.
**Difficulty**: Medium
**Topic**: Clustering

## Section 13 Questions (7 total: 5 active + 2 backup)

### q3-3-1 (Active)
**Question**: What Wireshark filter shows only SIP INVITE requests?
**Type**: multiple_choice
**Options**:
- sip.invite
- sip.Method == "INVITE"
- sip.request == INVITE
- invite.sip
**Correct**: sip.Method == "INVITE"
**Explanation**: The correct Wireshark display filter is 'sip.Method == "INVITE"' (case-sensitive). This filters packets where the SIP method field equals INVITE. The other options are not valid Wireshark filter syntax.
**Difficulty**: Medium
**Topic**: Wireshark

### q3-3-2 (Active)
**Question**: A call connects (200 OK received) but there's no audio in either direction. What is the MOST likely cause?
**Type**: multiple_choice
**Options**:
- Wrong SIP password
- SDP c= line contains unreachable IP or firewall blocks RTP ports
- CSeq not incrementing
- Missing To tag
**Correct**: SDP c= line contains unreachable IP or firewall blocks RTP ports
**Explanation**: When SIP signaling succeeds (200 OK) but there's no media, the issue is almost always with RTP, not SIP. Common causes: SDP contains private IP that's unreachable over public internet, or firewall blocks the RTP port range (typically UDP 10000-20000).
**Difficulty**: Medium
**Topic**: No Audio Debugging

### q3-3-3 (Active)
**Question**: What does a 403 Forbidden response typically indicate?
**Type**: multiple_choice
**Options**:
- Request timed out
- Authentication credentials are incorrect
- User not found
- Server is overloaded
**Correct**: Authentication credentials are incorrect
**Explanation**: 403 Forbidden means the server understood the request and credentials were provided, but they are invalid or insufficient. This differs from 401 (please authenticate), 404 (not found), 408 (timeout), and 503 (server unavailable).
**Difficulty**: Easy
**Topic**: Error Codes

### q3-3-4 (Active)
**Question**: What tool is industry-standard for SIP packet capture and analysis?
**Type**: multiple_choice
**Options**:
- Postman
- cURL
- Wireshark
- Netcat
**Correct**: Wireshark
**Explanation**: Wireshark is the standard tool for capturing and analyzing SIP traffic. It can decode SIP messages, follow call flows, analyze SDP, and correlate RTP streams. Postman is for HTTP APIs, cURL for command-line HTTP, and Netcat for raw TCP/UDP.
**Difficulty**: Easy
**Topic**: Troubleshooting Tools

### q3-3-5 (Active)
**Question**: When troubleshooting one-way audio, what should you check in the SDP?
**Type**: multiple_choice
**Options**:
- The From header
- The c= line (connection IP address)
- The CSeq value
- The branch parameter
**Correct**: The c= line (connection IP address)
**Explanation**: For one-way audio issues, first check the SDP c= line. If it contains a private IP (e.g., 192.168.x.x) or wrong interface, the remote side can't send RTP to that address. Also verify the RTP port is reachable (not blocked by firewall).
**Difficulty**: Medium
**Topic**: Media Debugging

### q3-3-backup-1 (Backup)
**Question**: Session timers (RFC 4028) help prevent hung calls that never receive BYE.
**Type**: true_false
**Options**:
- True
- False
**Correct**: True
**Explanation**: True. Session timers implement periodic re-INVITE or UPDATE requests to keep the session alive. If the timer expires without response, the call is automatically terminated, preventing "zombie" calls that consume resources.
**Difficulty**: Medium
**Topic**: Session Timers

### q3-3-backup-2 (Backup)
**Question**: What is the first step when debugging a SIP call failure?
**Type**: multiple_choice
**Options**:
- Restart the server
- Find the Call-ID and search logs/packet captures
- Change the codec
- Update the firmware
**Correct**: Find the Call-ID and search logs/packet captures
**Explanation**: Always start debugging by finding the Call-ID (unique identifier for the call) and searching logs or packet captures for all messages with that Call-ID. This shows the complete SIP message flow and pinpoints where the call failed.
**Difficulty**: Easy
**Topic**: Debugging Process

## Section 14 Questions (7 total: 5 active + 2 backup)

### q3-4-1 (Active)
**Question**: What does PRACK stand for?
**Type**: multiple_choice
**Options**:
- Provisional Response ACKnowledgment
- Protocol Reliability ACK
- Proxy Registration ACK
- Preliminary RACK
**Correct**: Provisional Response ACKnowledgment
**Explanation**: PRACK (Provisional Response ACKnowledgment, RFC 3262) makes provisional responses (1xx) reliable by requiring an acknowledgment. This ensures critical progress notifications (like 183 with early media) are not lost.
**Difficulty**: Easy
**Topic**: PRACK

### q3-4-2 (Active)
**Question**: What header does PRACK use to acknowledge a reliable provisional response?
**Type**: multiple_choice
**Options**:
- CSeq
- RAck
- RSeq
- Ack-ID
**Correct**: RAck
**Explanation**: PRACK requests include an RAck (Reliable Acknowledgment) header that references the RSeq value from the reliable provisional response being acknowledged. RSeq is in the provisional response, RAck is in the PRACK.
**Difficulty**: Medium
**Topic**: PRACK Headers

### q3-4-3 (Active)
**Question**: When can the UPDATE method be used?
**Type**: multiple_choice
**Options**:
- Only after 200 OK to INVITE
- Before or after call establishment to modify session parameters
- Only during registration
- Only for terminating calls
**Correct**: Before or after call establishment to modify session parameters
**Explanation**: UPDATE (RFC 3311) can modify session parameters both before the call is established (early dialog) and after (confirmed dialog). This is lighter weight than re-INVITE and works in scenarios where re-INVITE is not yet allowed.
**Difficulty**: Medium
**Topic**: UPDATE

### q3-4-4 (Active)
**Question**: What event package is used for voicemail waiting indicators (MWI)?
**Type**: multiple_choice
**Options**:
- dialog
- presence
- message-summary
- reg
**Correct**: message-summary
**Explanation**: The 'message-summary' event package (SUBSCRIBE/NOTIFY) is used for voicemail waiting indicators. It notifies subscribers about new/old messages in their mailbox. 'dialog' is for call state, 'presence' for availability, 'reg' for registration state.
**Difficulty**: Medium
**Topic**: SUBSCRIBE/NOTIFY

### q3-4-5 (Active)
**Question**: Which transport does WebRTC SIP signaling typically use?
**Type**: multiple_choice
**Options**:
- UDP
- TCP
- WebSocket
- SCTP
**Correct**: WebSocket
**Explanation**: WebRTC SIP signaling uses WebSocket (ws:// or secure wss://) because browsers have native WebSocket support but not raw UDP/TCP socket access. WebSocket provides bidirectional communication over HTTP/HTTPS ports (80/443), which are firewall-friendly.
**Difficulty**: Easy
**Topic**: WebRTC

### q3-4-backup-1 (Backup)
**Question**: WebRTC mandates SRTP for media encryption, while legacy SIP often uses unencrypted RTP.
**Type**: true_false
**Options**:
- True
- False
**Correct**: True
**Explanation**: True. WebRTC requires SRTP (encrypted media) as part of its security model. Legacy SIP deployments often use unencrypted RTP, though SRTP is increasingly adopted for security-conscious applications.
**Difficulty**: Easy
**Topic**: WebRTC Security

### q3-4-backup-2 (Backup)
**Question**: What is the primary benefit of PRACK over unreliable provisional responses?
**Type**: multiple_choice
**Options**:
- Faster call setup
- Guaranteed delivery of critical progress information
- Lower bandwidth usage
- Simpler implementation
**Correct**: Guaranteed delivery of critical progress information
**Explanation**: PRACK's main benefit is reliability—it ensures provisional responses (like 183 with early media SDP) are received. Unreliable provisionals (normal 1xx) can be lost over UDP, causing call setup issues. PRACK adds complexity and slight delay but guarantees delivery.
**Difficulty**: Medium
**Topic**: PRACK Benefits

## Section 15 Questions (7 total: 5 active + 2 backup)

### q3-5-1 (Active)
**Question**: What is horizontal scaling in SIP systems?
**Type**: multiple_choice
**Options**:
- Increasing CPU/RAM on existing servers
- Adding more servers to distribute load
- Using faster network links
- Compressing SIP messages
**Correct**: Adding more servers to distribute load
**Explanation**: Horizontal scaling means adding more servers (scale out) rather than making existing servers bigger (vertical scaling / scale up). SIP stateless proxies scale horizontally very well—just add more servers behind a load balancer.
**Difficulty**: Easy
**Topic**: Scalability

### q3-5-2 (Active)
**Question**: What does CSR stand for in SIP monitoring?
**Type**: multiple_choice
**Options**:
- Call Security Ratio
- Call Success Rate
- Customer Service Request
- Codec Selection Ratio
**Correct**: Call Success Rate
**Explanation**: CSR (Call Success Rate) is the percentage of INVITE requests that result in 200 OK (successful call establishment). It's a key metric for monitoring SIP system health. A typical target is >95%.
**Difficulty**: Easy
**Topic**: Monitoring

### q3-5-3 (Active)
**Question**: What is Post-Dial Delay (PDD)?
**Type**: multiple_choice
**Options**:
- Time from ACK to BYE
- Time from INVITE to first provisional response (180/183)
- Time from registration to first call
- Time from 200 OK to media start
**Correct**: Time from INVITE to first provisional response (180/183)
**Explanation**: PDD (Post-Dial Delay) measures time from sending INVITE to receiving first ring indication (180 Ringing or 183 Session Progress). Lower PDD means faster perceived call setup. Typical target: <3 seconds.
**Difficulty**: Medium
**Topic**: Performance Metrics

### q3-5-4 (Active)
**Question**: What does N+1 redundancy mean?
**Type**: multiple_choice
**Options**:
- N servers plus 1 backup that can handle the load if any server fails
- N+1 network connections
- N users plus 1 admin
- N calls plus 1 conference
**Correct**: N servers plus 1 backup that can handle the load if any server fails
**Explanation**: N+1 redundancy means you have enough capacity that if any one component fails, the remaining N components can handle the full load. For example, if you need 3 servers for capacity, deploy 4—if one fails, the other 3 still handle traffic.
**Difficulty**: Medium
**Topic**: High Availability

### q3-5-5 (Active)
**Question**: Which tool is commonly used for SIP load testing?
**Type**: multiple_choice
**Options**:
- Apache JMeter
- SIPp
- Selenium
- k6
**Correct**: SIPp
**Explanation**: SIPp is the industry-standard open-source tool for SIP load testing. It can simulate thousands of concurrent calls, measure performance metrics, and test failover scenarios. JMeter is for HTTP, Selenium for web browsers, k6 for general load testing.
**Difficulty**: Easy
**Topic**: Load Testing

### q3-5-backup-1 (Backup)
**Question**: Designing for 3x peak load provides headroom for traffic spikes and growth.
**Type**: true_false
**Options**:
- True
- False
**Correct**: True
**Explanation**: True. Capacity planning best practice is to design for 3x your expected peak load. This provides headroom for unexpected spikes (marketing campaigns, viral growth, DDoS) and gives you time to scale before hitting limits.
**Difficulty**: Easy
**Topic**: Capacity Planning

### q3-5-backup-2 (Backup)
**Question**: What is the primary goal of monitoring in production SIP systems?
**Type**: multiple_choice
**Options**:
- Reduce costs
- Detect and respond to failures before users are impacted
- Increase call duration
- Eliminate all errors
**Correct**: Detect and respond to failures before users are impacted
**Explanation**: Monitoring's main goal is proactive failure detection—knowing about problems before (or as soon as) users notice them, enabling fast response. Good monitoring tracks CSR, ASR, PDD, error rates, and alerts when thresholds are breached.
**Difficulty**: Easy
**Topic**: Monitoring Goals
