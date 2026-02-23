// Core types for ShieldAgent system

export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  encrypted?: boolean;
}

export interface ThreatAssessment {
  messageId: string;
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  threats: ThreatDetail[];
  timestamp: Date;
}

export interface ThreatDetail {
  type: 'phishing' | 'metadata-leak' | 'privacy-breach' | 'malicious-content' | 'suspicious-pattern';
  severity: number;
  description: string;
  evidence: string[];
  mitigation?: string;
}

export interface PrivacyAnalysis {
  messageId: string;
  privacyScore: number; // 0-100
  leaks: PrivacyLeak[];
  encrypted: boolean;
  zkProofValid?: boolean;
  timestamp: Date;
}

export interface PrivacyLeak {
  type: 'pii' | 'location' | 'metadata' | 'tracking' | 'fingerprint';
  severity: number;
  data: string;
  recommendation: string;
}

export interface ComplianceCheck {
  messageId: string;
  compliant: boolean;
  regulations: RegulationStatus[];
  violations: ComplianceViolation[];
  timestamp: Date;
}

export interface RegulationStatus {
  name: 'GDPR' | 'CCPA' | 'HIPAA' | 'SOC2';
  compliant: boolean;
  details: string;
}

export interface ComplianceViolation {
  regulation: string;
  article: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  remediation: string;
}

export interface AgentMessage {
  agentId: string;
  type: 'request' | 'response' | 'alert' | 'status';
  payload: any;
  timestamp: Date;
}

export interface SystemStatus {
  agents: {
    threatDetection: 'online' | 'offline' | 'error';
    privacyShield: 'online' | 'offline' | 'error';
    compliance: 'online' | 'offline' | 'error';
  };
  messagesProcessed: number;
  threatsDetected: number;
  privacyScore: number;
  uptime: number;
}
