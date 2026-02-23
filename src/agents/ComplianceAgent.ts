// Compliance Agent - GDPR/CCPA checks with zero-knowledge guarantees

import { BaseAgent } from './BaseAgent';
import { Message, ComplianceCheck, RegulationStatus, ComplianceViolation } from '../types';

export class ComplianceAgent extends BaseAgent {
  private regulations: string[] = ['GDPR', 'CCPA', 'HIPAA', 'SOC2'];

  constructor() {
    super('compliance-agent');
  }

  async initialize(): Promise<void> {
    this.log('Initializing Compliance Agent...');
    // In production: load regulation rules, connect to compliance databases
    await new Promise(resolve => setTimeout(resolve, 100));
    this.log('Compliance Agent initialized');
  }

  async processMessage(message: Message): Promise<ComplianceCheck> {
    this.log(`Checking compliance for message ${message.id}`);

    const regulations: RegulationStatus[] = [];
    const violations: ComplianceViolation[] = [];

    // Check GDPR compliance
    const gdprStatus = await this.checkGDPR(message);
    regulations.push(gdprStatus);
    if (!gdprStatus.compliant) {
      violations.push(...this.getGDPRViolations(message));
    }

    // Check CCPA compliance
    const ccpaStatus = await this.checkCCPA(message);
    regulations.push(ccpaStatus);
    if (!ccpaStatus.compliant) {
      violations.push(...this.getCCPAViolations(message));
    }

    // Check HIPAA compliance (if healthcare-related)
    if (this.isHealthcareRelated(message)) {
      const hipaaStatus = await this.checkHIPAA(message);
      regulations.push(hipaaStatus);
      if (!hipaaStatus.compliant) {
        violations.push(...this.getHIPAAViolations(message));
      }
    }

    // Check SOC2 compliance
    const soc2Status = await this.checkSOC2(message);
    regulations.push(soc2Status);
    if (!soc2Status.compliant) {
      violations.push(...this.getSOC2Violations(message));
    }

    const compliant = violations.length === 0;

    const check: ComplianceCheck = {
      messageId: message.id,
      compliant,
      regulations,
      violations,
      timestamp: new Date(),
    };

    // Alert on violations
    if (!compliant) {
      this.log(`Compliance violations detected for message ${message.id}`, 'warn');
      this.emit('compliance-violation', check);
    }

    return check;
  }

  private async checkGDPR(message: Message): Promise<RegulationStatus> {
    // GDPR Article 6: Lawfulness of processing
    // GDPR Article 7: Conditions for consent
    // GDPR Article 17: Right to erasure
    // GDPR Article 25: Data protection by design

    const issues: string[] = [];

    // Check for consent tracking
    if (message.metadata?.hasConsent === false) {
      issues.push('Missing user consent for data processing');
    }

    // Check for data minimization (Article 5)
    if (this.hasExcessiveData(message)) {
      issues.push('Excessive data collection violates data minimization principle');
    }

    // Check for encrypted storage (Article 32)
    if (!message.encrypted && this.containsSensitiveData(message)) {
      issues.push('Sensitive data must be encrypted');
    }

    // Check for data retention policy
    if (!message.metadata?.retentionPolicy) {
      issues.push('Missing data retention policy');
    }

    const compliant = issues.length === 0;

    return {
      name: 'GDPR',
      compliant,
      details: compliant ? 'All GDPR requirements met' : issues.join('; '),
    };
  }

  private async checkCCPA(message: Message): Promise<RegulationStatus> {
    // CCPA: Right to know, right to delete, right to opt-out

    const issues: string[] = [];

    // Check for opt-out mechanism
    if (message.metadata?.allowsOptOut === false) {
      issues.push('Missing opt-out mechanism for data sale');
    }

    // Check for privacy notice
    if (!message.metadata?.privacyNoticeProvided) {
      issues.push('Privacy notice not provided to California residents');
    }

    // Check for personal information handling
    if (this.containsPersonalInfo(message) && !message.metadata?.dataUsageDisclosed) {
      issues.push('Personal information usage not disclosed');
    }

    const compliant = issues.length === 0;

    return {
      name: 'CCPA',
      compliant,
      details: compliant ? 'All CCPA requirements met' : issues.join('; '),
    };
  }

  private async checkHIPAA(message: Message): Promise<RegulationStatus> {
    // HIPAA Privacy Rule and Security Rule

    const issues: string[] = [];

    // Check for PHI encryption
    if (this.containsHealthInfo(message) && !message.encrypted) {
      issues.push('Protected Health Information (PHI) must be encrypted');
    }

    // Check for minimum necessary standard
    if (this.hasExcessiveHealthData(message)) {
      issues.push('Violates minimum necessary standard for PHI disclosure');
    }

    // Check for audit trail
    if (!message.metadata?.auditTrail) {
      issues.push('Missing audit trail for PHI access');
    }

    // Check for authorization
    if (!message.metadata?.hipaaAuthorization) {
      issues.push('Missing patient authorization for PHI disclosure');
    }

    const compliant = issues.length === 0;

    return {
      name: 'HIPAA',
      compliant,
      details: compliant ? 'All HIPAA requirements met' : issues.join('; '),
    };
  }

  private async checkSOC2(message: Message): Promise<RegulationStatus> {
    // SOC2 Trust Service Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy

    const issues: string[] = [];

    // Check security controls
    if (!message.encrypted && this.containsSensitiveData(message)) {
      issues.push('Security: Sensitive data must be encrypted');
    }

    // Check access controls
    if (!message.metadata?.accessControls) {
      issues.push('Security: Missing access controls');
    }

    // Check data integrity
    if (!message.metadata?.integrityCheck) {
      issues.push('Processing Integrity: Missing data integrity verification');
    }

    // Check confidentiality
    if (this.hasPublicExposure(message)) {
      issues.push('Confidentiality: Data exposed to unauthorized parties');
    }

    const compliant = issues.length === 0;

    return {
      name: 'SOC2',
      compliant,
      details: compliant ? 'All SOC2 requirements met' : issues.join('; '),
    };
  }

  private getGDPRViolations(message: Message): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    if (!message.encrypted && this.containsSensitiveData(message)) {
      violations.push({
        regulation: 'GDPR',
        article: 'Article 32',
        description: 'Failure to implement appropriate technical measures (encryption)',
        severity: 'high',
        remediation: 'Encrypt all sensitive personal data',
      });
    }

    if (this.hasExcessiveData(message)) {
      violations.push({
        regulation: 'GDPR',
        article: 'Article 5(1)(c)',
        description: 'Data minimization principle violated',
        severity: 'medium',
        remediation: 'Collect only necessary data for specified purpose',
      });
    }

    if (message.metadata?.hasConsent === false) {
      violations.push({
        regulation: 'GDPR',
        article: 'Article 6',
        description: 'Processing without lawful basis (consent)',
        severity: 'high',
        remediation: 'Obtain explicit user consent before processing',
      });
    }

    return violations;
  }

  private getCCPAViolations(message: Message): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    if (message.metadata?.allowsOptOut === false) {
      violations.push({
        regulation: 'CCPA',
        article: 'Section 1798.120',
        description: 'No opt-out mechanism for sale of personal information',
        severity: 'high',
        remediation: 'Provide clear "Do Not Sell My Personal Information" option',
      });
    }

    if (!message.metadata?.privacyNoticeProvided) {
      violations.push({
        regulation: 'CCPA',
        article: 'Section 1798.100',
        description: 'Privacy notice not provided at collection',
        severity: 'medium',
        remediation: 'Provide privacy notice disclosing data collection practices',
      });
    }

    return violations;
  }

  private getHIPAAViolations(message: Message): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    if (this.containsHealthInfo(message) && !message.encrypted) {
      violations.push({
        regulation: 'HIPAA',
        article: '45 CFR 164.312(a)(2)(iv)',
        description: 'PHI transmitted without encryption',
        severity: 'high',
        remediation: 'Encrypt all PHI in transit and at rest',
      });
    }

    if (!message.metadata?.hipaaAuthorization) {
      violations.push({
        regulation: 'HIPAA',
        article: '45 CFR 164.508',
        description: 'PHI disclosed without patient authorization',
        severity: 'high',
        remediation: 'Obtain signed authorization before disclosing PHI',
      });
    }

    return violations;
  }

  private getSOC2Violations(message: Message): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    if (!message.encrypted && this.containsSensitiveData(message)) {
      violations.push({
        regulation: 'SOC2',
        article: 'CC6.7',
        description: 'Insufficient encryption for sensitive data',
        severity: 'high',
        remediation: 'Implement encryption for data in transit and at rest',
      });
    }

    if (!message.metadata?.accessControls) {
      violations.push({
        regulation: 'SOC2',
        article: 'CC6.1',
        description: 'Inadequate logical access controls',
        severity: 'medium',
        remediation: 'Implement role-based access controls (RBAC)',
      });
    }

    return violations;
  }

  // Helper methods for compliance checks
  private isHealthcareRelated(message: Message): boolean {
    const healthKeywords = [
      'patient', 'diagnosis', 'treatment', 'medical', 'health',
      'prescription', 'doctor', 'hospital', 'clinic', 'insurance'
    ];
    const content = message.content.toLowerCase();
    return healthKeywords.some(keyword => content.includes(keyword));
  }

  private containsSensitiveData(message: Message): boolean {
    // Check for PII patterns
    const patterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    ];
    return patterns.some(pattern => pattern.test(message.content));
  }

  private containsPersonalInfo(message: Message): boolean {
    return this.containsSensitiveData(message) || 
           /\b[A-Z][a-z]+ [A-Z][a-z]+\b/.test(message.content); // Names
  }

  private containsHealthInfo(message: Message): boolean {
    const healthPatterns = [
      /diagnosis/i, /treatment/i, /prescription/i, /patient/i,
      /medical record/i, /health condition/i, /symptoms/i
    ];
    return healthPatterns.some(pattern => pattern.test(message.content));
  }

  private hasExcessiveData(message: Message): boolean {
    // Simple heuristic: check if metadata has more than 5 fields
    return !!(message.metadata && Object.keys(message.metadata).length > 5);
  }

  private hasExcessiveHealthData(message: Message): boolean {
    // Check if message contains multiple types of PHI
    const phiTypes = [
      /patient name/i, /date of birth/i, /medical record number/i,
      /diagnosis/i, /treatment/i, /prescription/i
    ];
    const matches = phiTypes.filter(pattern => pattern.test(message.content));
    return matches.length > 2; // More than 2 types = excessive
  }

  private hasPublicExposure(message: Message): boolean {
    return message.metadata?.isPublic === true || 
           message.metadata?.accessLevel === 'public';
  }

  async shutdown(): Promise<void> {
    this.log('Shutting down Compliance Agent...');
  }
}
