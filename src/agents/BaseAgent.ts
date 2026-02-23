// Base Agent class using Microsoft Agents pattern

import { EventEmitter } from 'events';
import { AgentMessage } from '../types';

export abstract class BaseAgent extends EventEmitter {
  protected agentId: string;
  protected status: 'online' | 'offline' | 'error' = 'offline';
  protected messageQueue: AgentMessage[] = [];

  constructor(agentId: string) {
    super();
    this.agentId = agentId;
  }

  abstract initialize(): Promise<void>;
  abstract processMessage(message: any): Promise<any>;
  abstract shutdown(): Promise<void>;

  async start(): Promise<void> {
    try {
      await this.initialize();
      this.status = 'online';
      this.emit('status', { agentId: this.agentId, status: 'online' });
      console.log(`[${this.agentId}] Agent started successfully`);
    } catch (error) {
      this.status = 'error';
      this.emit('error', { agentId: this.agentId, error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.shutdown();
      this.status = 'offline';
      this.emit('status', { agentId: this.agentId, status: 'offline' });
      console.log(`[${this.agentId}] Agent stopped successfully`);
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  getStatus(): string {
    return this.status;
  }

  async sendToAgent(targetAgent: string, payload: any): Promise<void> {
    const message: AgentMessage = {
      agentId: this.agentId,
      type: 'request',
      payload,
      timestamp: new Date(),
    };
    this.emit('agent-message', { target: targetAgent, message });
  }

  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${this.agentId}] [${level.toUpperCase()}] ${message}`);
  }
}
