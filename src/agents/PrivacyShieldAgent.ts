// Privacy Shield Agent - Manages encrypted communications and privacy

import { BaseAgent } from './BaseAgent';
import { Message, PrivacyAnalysis, PrivacyLeak } from '../types';
import { createHash, randomBytes } from 'crypto';

export class PrivacyShieldAgent extends BaseAgent {
  private encryptionEnabled: boolean = true;
  private zkProofEnabled: boolean = true;

  constructor() {
    super('privacy-shield-agent');
  }

  async initialize(): Promise<void> {
    this.log('Initializing Privacy Shield Agent...');
    // In production: initialize encryption keys, ZK proof systems
    await new Promise(resolve => setTimeout(resolve, 100));
    this.log('Privacy Shield Agent initialized with ZK protocols');
  }

  async processMessage(message: Message): Promise<PrivacyAnalysis> {
    this.log(`Analyzing privacy for message ${message.id}`);

    const leaks: PrivacyLeak[] = [];

    // Check for PII leaks
    const piiLeaks = this.detectPII(message.content);
    leaks.push(...piiLeaks);

    // Check for location data
    const locationLeaks = this.detectLocationData(message);
    leaks.push(...locationLeaks);

    // Check for metadata leaks
    const metadataLeaks = this.detectMetadata(message);
    leaks.push(...metadataLeaks);

    // Check for tracking elements
    const trackingLeaks = this.detectTracking(message.content);
    leaks.push(...trackingLeaks);

    // Check for fingerprinting
    const fingerprintLeaks = this.detectFingerprinting(message);
    leaks.push(...fingerprintLeaks);

    // Calculate privacy score (0-100)
    const privacyScore = this.calculatePrivacyScore(leaks, message);

    // Verify ZK proof if present
    const zkProofValid = message.encrypted ? await this.verifyZKProof(message) : undefined;

    const analysis: PrivacyAnalysis = {
      messageId: message.id,
      privacyScore,
      leaks,
      encrypted: message.encrypted || false,
      zkProofValid,
      timestamp: new Date(),
    };

    // If privacy score is low, offer encryption
    if (privacyScore < 60) {
      this.log(`Low privacy score (${privacyScore}) for message ${message.id}`, 'warn');
      await this.sendToAgent('compliance-agent', {
        action: 'check-privacy-compliance',
        analysis,
      });
    }

    return analysis;
  }

  private detectPII(content: string): PrivacyLeak[] {
    const leaks: PrivacyLeak[] = [];

    // Email detection
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = content.match(emailPattern);
    if (emails) {
      leaks.push({
        type: 'pii',
        severity: 6,
        data: `Found ${emails.length} email address(es)`,
        recommendation: 'Mask email addresses or use encrypted channel',
      });
    }

    // Phone number detection
    const phonePattern = /\b(\+?1?[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})\b/g;
    const phones = content.match(phonePattern);
    if (phones) {
      leaks.push({
        type: 'pii',
        severity: 7,
        data: `Found ${phones.length} phone number(s)`,
        recommendation: 'Remove phone numbers or use secure messaging',
      });
    }

    // SSN detection
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/g;
    const ssns = content.match(ssnPattern);
    if (ssns) {
      leaks.push({
        type: 'pii',
        severity: 10,
        data: 'Found Social Security Number pattern',
        recommendation: 'IMMEDIATELY remove SSN and use encrypted channel',
      });
    }

    // Credit card detection
    const ccPattern = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;
    const creditCards = content.match(ccPattern);
    if (creditCards) {
      leaks.push({
        type: 'pii',
        severity: 10,
        data: 'Found credit card number pattern',
        recommendation: 'IMMEDIATELY remove credit card data',
      });
    }

    // Name detection (simple heuristic)
    const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
    const names = content.match(namePattern);
    if (names && names.length > 2) {
      leaks.push({
        type: 'pii',
        severity: 4,
        data: `Found ${names.length} potential name(s)`,
        recommendation: 'Consider using pseudonyms for privacy',
      });
    }

    return leaks;
  }

  private detectLocationData(message: Message): PrivacyLeak[] {
    const leaks: PrivacyLeak[] = [];

    // Check metadata for location
    if (message.metadata?.location || message.metadata?.gps || message.metadata?.coordinates) {
      leaks.push({
        type: 'location',
        severity: 8,
        data: 'Location data found in message metadata',
        recommendation: 'Remove location metadata before sending',
      });
    }

    // Check content for addresses
    const addressPattern = /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct)\b/gi;
    const addresses = message.content.match(addressPattern);
    if (addresses) {
      leaks.push({
        type: 'location',
        severity: 7,
        data: `Found ${addresses.length} physical address(es)`,
        recommendation: 'Mask addresses or use general location descriptions',
      });
    }

    // Check for coordinates
    const coordPattern = /[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)/g;
    const coords = message.content.match(coordPattern);
    if (coords) {
      leaks.push({
        type: 'location',
        severity: 9,
        data: 'GPS coordinates found in message',
        recommendation: 'Remove exact coordinates',
      });
    }

    return leaks;
  }

  private detectMetadata(message: Message): PrivacyLeak[] {
    const leaks: PrivacyLeak[] = [];

    if (!message.metadata) return leaks;

    const sensitiveFields = [
      'user-agent', 'device-id', 'ip-address', 'mac-address',
      'browser', 'os', 'screen-resolution', 'timezone'
    ];

    for (const field of sensitiveFields) {
      if (message.metadata[field]) {
        leaks.push({
          type: 'metadata',
          severity: 6,
          data: `Metadata field: ${field}`,
          recommendation: 'Strip non-essential metadata',
        });
      }
    }

    return leaks;
  }

  private detectTracking(content: string): PrivacyLeak[] {
    const leaks: PrivacyLeak[] = [];

    // Check for tracking pixels
    const pixelPattern = /<img[^>]*src=["'][^"']*\?[^"']*track[^"']*["'][^>]*>/gi;
    if (pixelPattern.test(content)) {
      leaks.push({
        type: 'tracking',
        severity: 7,
        data: 'Tracking pixel detected',
        recommendation: 'Block tracking pixels',
      });
    }

    // Check for tracking parameters in URLs
    const trackingParams = ['utm_source', 'utm_campaign', 'fbclid', 'gclid', 'mc_eid'];
    for (const param of trackingParams) {
      if (content.includes(param)) {
        leaks.push({
          type: 'tracking',
          severity: 5,
          data: `Tracking parameter: ${param}`,
          recommendation: 'Remove tracking parameters from URLs',
        });
      }
    }

    return leaks;
  }

  private detectFingerprinting(message: Message): PrivacyLeak[] {
    const leaks: PrivacyLeak[] = [];

    // Check for browser fingerprinting data
    if (message.metadata) {
      const fingerprintFields = ['canvas-hash', 'webgl-hash', 'font-list', 'plugin-list'];
      for (const field of fingerprintFields) {
        if (message.metadata[field]) {
          leaks.push({
            type: 'fingerprint',
            severity: 8,
            data: `Fingerprinting data: ${field}`,
            recommendation: 'Use privacy-preserving browser settings',
          });
        }
      }
    }

    return leaks;
  }

  private calculatePrivacyScore(leaks: PrivacyLeak[], message: Message): number {
    let score = 100;

    // Deduct points for each leak based on severity
    for (const leak of leaks) {
      score -= leak.severity;
    }

    // Bonus for encryption
    if (message.encrypted) {
      score += 20;
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  private async verifyZKProof(message: Message): Promise<boolean> {
    // Simulate zero-knowledge proof verification
    // In production: implement actual ZK proof verification (zk-SNARKs, etc.)
    this.log(`Verifying ZK proof for message ${message.id}`);
    
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // For demo: return true if message has encrypted flag
    return message.encrypted === true;
  }

  async encryptMessage(message: Message): Promise<Message> {
    this.log(`Encrypting message ${message.id}`);

    // Simulate encryption (in production: use proper encryption)
    const encrypted: Message = {
      ...message,
      content: this.simpleEncrypt(message.content),
      encrypted: true,
      metadata: {
        ...message.metadata,
        'zk-proof': await this.generateZKProof(message),
      },
    };

    return encrypted;
  }

  private simpleEncrypt(content: string): string {
    // Simple base64 encoding for demo (use real encryption in production)
    return Buffer.from(content).toString('base64');
  }

  private async generateZKProof(message: Message): Promise<string> {
    // Simulate ZK proof generation
    const hash = createHash('sha256').update(message.content).digest('hex');
    return `zkp_${hash.substring(0, 16)}`;
  }

  async shutdown(): Promise<void> {
    this.log('Shutting down Privacy Shield Agent...');
  }
}
