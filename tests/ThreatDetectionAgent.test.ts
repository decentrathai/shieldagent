// Test suite for Threat Detection Agent

import { ThreatDetectionAgent } from '../src/agents/ThreatDetectionAgent';
import { Message } from '../src/types';
import { nanoid } from 'nanoid';

describe('ThreatDetectionAgent', () => {
  let agent: ThreatDetectionAgent;

  beforeAll(async () => {
    agent = new ThreatDetectionAgent();
    await agent.start();
  });

  afterAll(async () => {
    await agent.stop();
  });

  test('should initialize successfully', () => {
    expect(agent.getStatus()).toBe('online');
  });

  test('should detect phishing attempts', async () => {
    const message: Message = {
      id: nanoid(),
      content: 'Your account has been suspended. Click here to verify immediately!',
      sender: 'suspicious@example.com',
      timestamp: new Date(),
    };

    const result = await agent.processMessage(message);

    expect(result.threatLevel).toBe('high');
    expect(result.threats.length).toBeGreaterThan(0);
    expect(result.threats[0].type).toBe('phishing');
  });

  test('should detect PII in messages', async () => {
    const message: Message = {
      id: nanoid(),
      content: 'My SSN is 123-45-6789 and credit card is 4532-1234-5678-9010',
      sender: 'user@example.com',
      timestamp: new Date(),
    };

    const result = await agent.processMessage(message);

    expect(result.threatLevel).not.toBe('none');
    const privacyThreats = result.threats.filter(t => t.type === 'privacy-breach');
    expect(privacyThreats.length).toBeGreaterThan(0);
  });

  test('should detect suspicious URLs', async () => {
    const message: Message = {
      id: nanoid(),
      content: 'Check out this link: http://malicious-site.tk/payload',
      sender: 'user@example.com',
      timestamp: new Date(),
    };

    const result = await agent.processMessage(message);

    const maliciousThreats = result.threats.filter(t => t.type === 'malicious-content');
    expect(maliciousThreats.length).toBeGreaterThan(0);
  });

  test('should detect metadata leaks', async () => {
    const message: Message = {
      id: nanoid(),
      content: 'Test message',
      sender: 'user@example.com',
      timestamp: new Date(),
      metadata: {
        ip: '192.168.1.1',
        location: 'GPS:37.7749,-122.4194',
        device: 'iPhone 12',
      },
    };

    const result = await agent.processMessage(message);

    const metadataThreats = result.threats.filter(t => t.type === 'metadata-leak');
    expect(metadataThreats.length).toBeGreaterThan(0);
  });

  test('should return no threats for clean message', async () => {
    const message: Message = {
      id: nanoid(),
      content: 'Hello, how are you today?',
      sender: 'user@example.com',
      timestamp: new Date(),
    };

    const result = await agent.processMessage(message);

    expect(result.threatLevel).toBe('none');
    expect(result.threats.length).toBe(0);
  });

  test('should calculate correct threat levels', async () => {
    const testCases = [
      {
        content: 'SSN: 123-45-6789',
        expectedLevel: 'critical',
      },
      {
        content: 'Click here immediately to verify!',
        expectedLevel: 'high',
      },
      {
        content: 'Email me at test@example.com',
        expectedLevel: 'medium',
      },
      {
        content: 'Hello world',
        expectedLevel: 'none',
      },
    ];

    for (const testCase of testCases) {
      const message: Message = {
        id: nanoid(),
        content: testCase.content,
        sender: 'test@example.com',
        timestamp: new Date(),
      };

      const result = await agent.processMessage(message);
      expect(result.threatLevel).toBe(testCase.expectedLevel);
    }
  });
});
