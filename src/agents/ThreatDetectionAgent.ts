// Threat Detection Agent - Monitors for security threats

import { BaseAgent } from './BaseAgent';
import { Message, ThreatAssessment, ThreatDetail } from '../types';
import { nanoid } from 'nanoid';

export class ThreatDetectionAgent extends BaseAgent {
  private phishingPatterns: RegExp[];
  private suspiciousKeywords: string[];
  private metadataLeakPatterns: RegExp[];

  constructor() {
    super('threat-detection-agent');
    
    // Phishing patterns
    this.phishingPatterns = [
      /verify\s+your\s+account/i,
      /urgent\s+action\s+required/i,
      /click\s+here\s+immediately/i,
      /suspended\s+account/i,
      /confirm\s+your\s+identity/i,
      /unusual\s+activity\s+detected/i,
      /prize\s+winner/i,
      /claim\s+your\s+reward/i,
    ];

    // Suspicious keywords
    this.suspiciousKeywords = [
      'password', 'ssn', 'credit card', 'social security',
      'bank account', 'routing number', 'pin code', 'cvv'
    ];

    // Metadata leak patterns
    this.metadataLeakPatterns = [
      /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, // IP addresses
      /\b[A-Fa-f0-9]{2}(:[A-Fa-f0-9]{2}){5}\b/, // MAC addresses
      /EXIF|GPS|Geolocation/i, // Metadata tags
    ];
  }

  async initialize(): Promise<void> {
    this.log('Initializing Threat Detection Agent...');
    // In production: load ML models, connect to Azure AI Services
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate initialization
    this.log('Threat Detection Agent initialized');
  }

  async processMessage(message: Message): Promise<ThreatAssessment> {
    this.log(`Processing message ${message.id} for threats`);

    const threats: ThreatDetail[] = [];

    // Check for phishing
    const phishingThreats = this.detectPhishing(message.content);
    threats.push(...phishingThreats);

    // Check for metadata leaks
    const metadataThreats = this.detectMetadataLeaks(message);
    threats.push(...metadataThreats);

    // Check for privacy breaches
    const privacyThreats = this.detectPrivacyBreaches(message.content);
    threats.push(...privacyThreats);

    // Check for malicious content
    const maliciousThreats = this.detectMaliciousContent(message.content);
    threats.push(...maliciousThreats);

    // Calculate overall threat level
    const threatLevel = this.calculateThreatLevel(threats);

    const assessment: ThreatAssessment = {
      messageId: message.id,
      threatLevel,
      threats,
      timestamp: new Date(),
    };

    // Alert if high threat
    if (threatLevel === 'high' || threatLevel === 'critical') {
      this.emit('threat-alert', assessment);
      await this.sendToAgent('privacy-shield-agent', {
        action: 'enhance-protection',
        assessment,
      });
    }

    return assessment;
  }

  private detectPhishing(content: string): ThreatDetail[] {
    const threats: ThreatDetail[] = [];

    for (const pattern of this.phishingPatterns) {
      if (pattern.test(content)) {
        threats.push({
          type: 'phishing',
          severity: 8,
          description: 'Potential phishing attempt detected',
          evidence: [`Pattern match: ${pattern.source}`],
          mitigation: 'Do not click links or provide personal information',
        });
      }
    }

    return threats;
  }

  private detectMetadataLeaks(message: Message): ThreatDetail[] {
    const threats: ThreatDetail[] = [];
    const content = JSON.stringify(message);

    for (const pattern of this.metadataLeakPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        threats.push({
          type: 'metadata-leak',
          severity: 6,
          description: 'Potential metadata leak detected',
          evidence: [`Found: ${matches[0]}`],
          mitigation: 'Strip metadata before sending',
        });
      }
    }

    // Check message metadata
    if (message.metadata) {
      const sensitiveFields = ['location', 'ip', 'device', 'user-agent'];
      for (const field of sensitiveFields) {
        if (message.metadata[field]) {
          threats.push({
            type: 'metadata-leak',
            severity: 7,
            description: `Sensitive metadata field: ${field}`,
            evidence: [`Field: ${field}`],
            mitigation: 'Remove sensitive metadata fields',
          });
        }
      }
    }

    return threats;
  }

  private detectPrivacyBreaches(content: string): ThreatDetail[] {
    const threats: ThreatDetail[] = [];

    for (const keyword of this.suspiciousKeywords) {
      if (content.toLowerCase().includes(keyword)) {
        threats.push({
          type: 'privacy-breach',
          severity: 7,
          description: `Sensitive information detected: ${keyword}`,
          evidence: [`Keyword: ${keyword}`],
          mitigation: 'Encrypt message or remove sensitive data',
        });
      }
    }

    // Check for PII patterns
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
    const ssnPattern = /\b\d{3}-\d{2}-\d{4}\b/;

    if (emailPattern.test(content)) {
      threats.push({
        type: 'privacy-breach',
        severity: 5,
        description: 'Email address detected in message',
        evidence: ['Email pattern match'],
        mitigation: 'Consider masking email addresses',
      });
    }

    if (phonePattern.test(content) || ssnPattern.test(content)) {
      threats.push({
        type: 'privacy-breach',
        severity: 9,
        description: 'Personal identifiable information (PII) detected',
        evidence: ['Phone/SSN pattern match'],
        mitigation: 'Remove PII or use encrypted channel',
      });
    }

    return threats;
  }

  private detectMaliciousContent(content: string): ThreatDetail[] {
    const threats: ThreatDetail[] = [];

    // Check for suspicious URLs
    const urlPattern = /https?:\/\/[^\s]+/g;
    const urls = content.match(urlPattern);
    
    if (urls) {
      for (const url of urls) {
        // Check for suspicious TLDs or patterns
        if (url.match(/\.(xyz|tk|ml|ga|cf|gq)($|\/|\?)/i)) {
          threats.push({
            type: 'malicious-content',
            severity: 7,
            description: 'Suspicious URL detected',
            evidence: [`URL: ${url}`],
            mitigation: 'Verify URL before clicking',
          });
        }

        // Check for URL shorteners (could hide destination)
        if (url.match(/bit\.ly|tinyurl|goo\.gl/i)) {
          threats.push({
            type: 'suspicious-pattern',
            severity: 5,
            description: 'URL shortener detected',
            evidence: [`URL: ${url}`],
            mitigation: 'Expand URL to verify destination',
          });
        }
      }
    }

    // Check for base64 encoded content (could hide payload)
    if (content.match(/[A-Za-z0-9+\/]{40,}={0,2}/)) {
      threats.push({
        type: 'suspicious-pattern',
        severity: 6,
        description: 'Base64 encoded content detected',
        evidence: ['Base64 pattern match'],
        mitigation: 'Decode and inspect content',
      });
    }

    return threats;
  }

  private calculateThreatLevel(threats: ThreatDetail[]): 'none' | 'low' | 'medium' | 'high' | 'critical' {
    if (threats.length === 0) return 'none';

    const maxSeverity = Math.max(...threats.map(t => t.severity));
    const avgSeverity = threats.reduce((sum, t) => sum + t.severity, 0) / threats.length;

    if (maxSeverity >= 9 || avgSeverity >= 8) return 'critical';
    if (maxSeverity >= 7 || avgSeverity >= 6) return 'high';
    if (maxSeverity >= 5 || avgSeverity >= 4) return 'medium';
    return 'low';
  }

  async shutdown(): Promise<void> {
    this.log('Shutting down Threat Detection Agent...');
    // Cleanup resources
  }
}
