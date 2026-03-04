/**
 * SIP Client - Async Socket Communication
 * Handles UDP/TCP socket communication with SIP endpoints
 */

import dgram from 'dgram';
import net from 'net';
import { EventEmitter } from 'events';
import { SIPParser } from './sip-parser.js';

export class SIPClient extends EventEmitter {
  constructor(config = {}) {
    super();
    this.localIP = config.localIP || '0.0.0.0';
    this.localPort = config.localPort || 5060;
    this.transport = config.transport || 'UDP';
    this.timeout = config.timeout || 5000; // 5 seconds
    this.socket = null;
    this.listening = false;
    this.pendingTransactions = new Map();
    this.messageLog = [];
  }

  /**
   * Start listening for incoming messages
   */
  async listen() {
    return new Promise((resolve, reject) => {
      if (this.listening) {
        return resolve();
      }

      if (this.transport === 'UDP') {
        this.socket = dgram.createSocket('udp4');
        
        this.socket.on('message', (msg, rinfo) => {
          this.handleIncomingMessage(msg.toString(), rinfo);
        });

        this.socket.on('error', (err) => {
          this.emit('error', err);
          reject(err);
        });

        this.socket.bind(this.localPort, this.localIP, () => {
          this.listening = true;
          this.emit('listening', { ip: this.localIP, port: this.localPort });
          resolve();
        });
      } else if (this.transport === 'TCP') {
        // TCP implementation (for future)
        reject(new Error('TCP transport not yet implemented'));
      } else {
        reject(new Error(`Unsupported transport: ${this.transport}`));
      }
    });
  }

  /**
   * Stop listening and close socket
   */
  async close() {
    return new Promise((resolve) => {
      if (!this.socket) {
        return resolve();
      }

      if (this.transport === 'UDP') {
        this.socket.close(() => {
          this.listening = false;
          this.socket = null;
          resolve();
        });
      }
    });
  }

  /**
   * Send a SIP message
   */
  async send(message, host, port = 5060) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket not initialized. Call listen() first.'));
      }

      const buffer = Buffer.from(message);
      const timestamp = Date.now();

      // Log outgoing message
      this.messageLog.push({
        direction: 'out',
        timestamp,
        host,
        port,
        message
      });

      this.emit('message:sent', { message, host, port, timestamp });

      if (this.transport === 'UDP') {
        this.socket.send(buffer, 0, buffer.length, port, host, (err) => {
          if (err) {
            this.emit('error', err);
            reject(err);
          } else {
            resolve({ sent: true, timestamp });
          }
        });
      }
    });
  }

  /**
   * Send a SIP message and wait for response
   */
  async sendAndWait(message, host, port = 5060, options = {}) {
    const timeoutMs = options.timeout || this.timeout;
    const transactionId = this.generateTransactionId();

    return new Promise(async (resolve, reject) => {
      // Set up timeout
      const timeoutHandle = setTimeout(() => {
        this.pendingTransactions.delete(transactionId);
        reject(new Error(`Transaction timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      // Register transaction
      this.pendingTransactions.set(transactionId, {
        resolve: (response) => {
          clearTimeout(timeoutHandle);
          this.pendingTransactions.delete(transactionId);
          resolve(response);
        },
        reject: (error) => {
          clearTimeout(timeoutHandle);
          this.pendingTransactions.delete(transactionId);
          reject(error);
        },
        sentAt: Date.now()
      });

      // Send message
      try {
        await this.send(message, host, port);
      } catch (err) {
        clearTimeout(timeoutHandle);
        this.pendingTransactions.delete(transactionId);
        reject(err);
      }
    });
  }

  /**
   * Handle incoming message
   */
  handleIncomingMessage(rawMessage, rinfo) {
    const timestamp = Date.now();
    
    // Log incoming message
    this.messageLog.push({
      direction: 'in',
      timestamp,
      host: rinfo.address,
      port: rinfo.port,
      message: rawMessage
    });

    // Parse message
    const parsed = SIPParser.parse(rawMessage);
    
    this.emit('message:received', {
      raw: rawMessage,
      parsed,
      rinfo,
      timestamp
    });

    // Match to pending transaction
    if (parsed.valid) {
      this.matchTransaction(parsed, timestamp);
    }
  }

  /**
   * Match response to pending transaction
   */
  matchTransaction(parsed, timestamp) {
    // For now, just resolve the oldest pending transaction
    // In a real implementation, match by Call-ID + CSeq + branch
    const transactions = Array.from(this.pendingTransactions.values());
    
    if (transactions.length > 0) {
      const transaction = transactions[0];
      const responseTime = timestamp - transaction.sentAt;
      
      transaction.resolve({
        parsed,
        responseTime,
        timestamp
      });
    }
  }

  /**
   * Generate transaction ID
   */
  generateTransactionId() {
    return `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get message log
   */
  getMessageLog() {
    return [...this.messageLog];
  }

  /**
   * Clear message log
   */
  clearMessageLog() {
    this.messageLog = [];
  }
}
