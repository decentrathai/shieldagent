// Agent Orchestrator - Coordinates all agents

import { EventEmitter } from 'events';
import { ThreatDetectionAgent } from '../agents/ThreatDetectionAgent';
import { PrivacyShieldAgent } from '../agents/PrivacyShieldAgent';
import { ComplianceAgent } from '../agents/ComplianceAgent';
import { BaseAgent } from '../agents/BaseAgent';
import { Message, SystemStatus, ThreatAssessment, PrivacyAnalysis, ComplianceCheck } from '../types';
import { nanoid } from 'nanoid';

export interface ProcessingResult {
  messageId: string;
  threat: ThreatAssessment;
  privacy: PrivacyAnalysis;
  compliance: ComplianceCheck;
  timestamp: Date;
}

export class AgentOrchestrator extends EventEmitter {
  private threatAgent: ThreatDetectionAgent;
  private privacyAgent: PrivacyShieldAgent;
  private complianceAgent: ComplianceAgent;
  
  private agents: Map<string, BaseAgent> = new Map();
  private messageHistory: ProcessingResult[] = [];
  private startTime: Date;
  
  private stats = {
    messagesProcessed: 0,
    threatsDetected: 0,
    privacyViolations: 0,
    complianceViolations: 0,
  };

  constructor() {
    super();
    this.threatAgent = new ThreatDetectionAgent();
    this.privacyAgent = new PrivacyShieldAgent();
    this.complianceAgent = new ComplianceAgent();
    
    this.agents.set('threat-detection-agent', this.threatAgent);
    this.agents.set('privacy-shield-agent', this.privacyAgent);
    this.agents.set('compliance-agent', this.complianceAgent);
    
    this.startTime = new Date();
    this.setupAgentCommunication();
  }

  private setupAgentCommunication(): void {
    // Setup inter-agent communication
    for (const [id, agent] of this.agents) {
      agent.on('agent-message', ({ target, message }) => {
        const targetAgent = this.agents.get(target);
        if (targetAgent) {
          console.log(`[Orchestrator] Routing message from ${id} to ${target}`);
          // In production: proper message queue/routing
        }
      });

      agent.on('status', (status) => {
        this.emit('agent-status', status);
      });

      agent.on('error', (error) => {
        console.error(`[Orchestrator] Agent error:`, error);
        this.emit('agent-error', error);
      });
    }

    // Threat alerts
    this.threatAgent.on('threat-alert', (assessment: ThreatAssessment) => {
      this.stats.threatsDetected++;
      this.emit('threat-alert', assessment);
    });

    // Compliance violations
    this.complianceAgent.on('compliance-violation', (check: ComplianceCheck) => {
      this.stats.complianceViolations++;
      this.emit('compliance-violation', check);
    });
  }

  async initialize(): Promise<void> {
    console.log('[Orchestrator] Initializing all agents...');
    
    const initPromises = Array.from(this.agents.values()).map(agent => agent.start());
    await Promise.all(initPromises);
    
    console.log('[Orchestrator] All agents initialized successfully');
    this.emit('system-ready');
  }

  async processMessage(content: string, metadata?: Record<string, any>): Promise<ProcessingResult> {
    const message: Message = {
      id: nanoid(),
      content,
      sender: metadata?.sender || 'unknown',
      timestamp: new Date(),
      metadata,
      encrypted: metadata?.encrypted || false,
    };

    console.log(`[Orchestrator] Processing message ${message.id}`);
    
    try {
      // Run all agents in parallel
      const [threat, privacy, compliance] = await Promise.all([
        this.threatAgent.processMessage(message),
        this.privacyAgent.processMessage(message),
        this.complianceAgent.processMessage(message),
      ]);

      const result: ProcessingResult = {
        messageId: message.id,
        threat,
        privacy,
        compliance,
        timestamp: new Date(),
      };

      // Update stats
      this.stats.messagesProcessed++;
      if (threat.threatLevel !== 'none') {
        this.stats.threatsDetected++;
      }
      if (privacy.privacyScore < 60) {
        this.stats.privacyViolations++;
      }

      // Store in history (keep last 100)
      this.messageHistory.push(result);
      if (this.messageHistory.length > 100) {
        this.messageHistory.shift();
      }

      // Emit result
      this.emit('message-processed', result);

      return result;
    } catch (error) {
      console.error(`[Orchestrator] Error processing message ${message.id}:`, error);
      throw error;
    }
  }

  async encryptMessage(content: string, metadata?: Record<string, any>): Promise<Message> {
    const message: Message = {
      id: nanoid(),
      content,
      sender: metadata?.sender || 'system',
      timestamp: new Date(),
      metadata,
      encrypted: false,
    };

    return await this.privacyAgent.encryptMessage(message);
  }

  getSystemStatus(): SystemStatus {
    const uptime = Date.now() - this.startTime.getTime();
    
    // Calculate average privacy score from recent messages
    const recentMessages = this.messageHistory.slice(-20);
    const avgPrivacyScore = recentMessages.length > 0
      ? recentMessages.reduce((sum, m) => sum + m.privacy.privacyScore, 0) / recentMessages.length
      : 100;

    return {
      agents: {
        threatDetection: this.threatAgent.getStatus() as any,
        privacyShield: this.privacyAgent.getStatus() as any,
        compliance: this.complianceAgent.getStatus() as any,
      },
      messagesProcessed: this.stats.messagesProcessed,
      threatsDetected: this.stats.threatsDetected,
      privacyScore: Math.round(avgPrivacyScore),
      uptime: Math.round(uptime / 1000), // seconds
    };
  }

  getMessageHistory(): ProcessingResult[] {
    return [...this.messageHistory];
  }

  getStats() {
    return { ...this.stats };
  }

  async shutdown(): Promise<void> {
    console.log('[Orchestrator] Shutting down all agents...');
    
    const shutdownPromises = Array.from(this.agents.values()).map(agent => agent.stop());
    await Promise.all(shutdownPromises);
    
    console.log('[Orchestrator] All agents shut down successfully');
    this.emit('system-shutdown');
  }
}
