// ShieldAgent Main Server

import express, { Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { AgentOrchestrator } from './services/AgentOrchestrator';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend/build'));

// Initialize orchestrator
const orchestrator = new AgentOrchestrator();

// WebSocket clients
const clients: Set<WebSocket> = new Set();

// Setup event listeners
orchestrator.on('message-processed', (result) => {
  broadcast({ type: 'message-processed', data: result });
});

orchestrator.on('threat-alert', (assessment) => {
  broadcast({ type: 'threat-alert', data: assessment });
});

orchestrator.on('compliance-violation', (check) => {
  broadcast({ type: 'compliance-violation', data: check });
});

orchestrator.on('agent-status', (status) => {
  broadcast({ type: 'agent-status', data: status });
});

function broadcast(message: any): void {
  const payload = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// REST API Routes

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/status', (req: Request, res: Response) => {
  const status = orchestrator.getSystemStatus();
  res.json(status);
});

app.post('/api/message/analyze', async (req: Request, res: Response) => {
  try {
    const { content, metadata } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const result = await orchestrator.processMessage(content, metadata);
    res.json(result);
  } catch (error: any) {
    console.error('Error analyzing message:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/message/encrypt', async (req: Request, res: Response) => {
  try {
    const { content, metadata } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const encrypted = await orchestrator.encryptMessage(content, metadata);
    res.json(encrypted);
  } catch (error: any) {
    console.error('Error encrypting message:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/history', (req: Request, res: Response) => {
  const history = orchestrator.getMessageHistory();
  const limit = parseInt(req.query.limit as string) || 50;
  res.json(history.slice(-limit));
});

app.get('/api/stats', (req: Request, res: Response) => {
  const stats = orchestrator.getStats();
  res.json(stats);
});

// WebSocket handling
wss.on('connection', (ws: WebSocket) => {
  console.log('[WS] Client connected');
  clients.add(ws);

  // Send current status on connection
  ws.send(JSON.stringify({
    type: 'status',
    data: orchestrator.getSystemStatus(),
  }));

  ws.on('message', async (data: Buffer) => {
    try {
      const message = JSON.parse(data.toString());
      
      if (message.type === 'analyze') {
        const result = await orchestrator.processMessage(
          message.content,
          message.metadata
        );
        ws.send(JSON.stringify({
          type: 'analysis-result',
          data: result,
        }));
      }
    } catch (error: any) {
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message,
      }));
    }
  });

  ws.on('close', () => {
    console.log('[WS] Client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('[WS] Error:', error);
    clients.delete(ws);
  });
});

// Initialize and start server
async function start() {
  try {
    console.log('='.repeat(60));
    console.log('ShieldAgent - Privacy-Preserving Multi-Agent System');
    console.log('='.repeat(60));
    
    await orchestrator.initialize();
    
    server.listen(PORT, () => {
      console.log(`\n✓ Server running on port ${PORT}`);
      console.log(`✓ REST API: http://localhost:${PORT}/api`);
      console.log(`✓ WebSocket: ws://localhost:${PORT}`);
      console.log(`✓ Frontend: http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  await orchestrator.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  await orchestrator.shutdown();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

start();
