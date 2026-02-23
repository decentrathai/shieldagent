# ShieldAgent - Quick Start Guide

Get ShieldAgent running in under 5 minutes!

## Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/decentrathai/shieldagent.git
cd shieldagent
```

### 2. Install Dependencies

```bash
npm install
```

This will install all backend dependencies (~439 packages).

### 3. Build the Application

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### 4. Start the Server

```bash
npm start
```

You should see:
```
============================================================
ShieldAgent - Privacy-Preserving Multi-Agent System
============================================================
[Orchestrator] Initializing all agents...
[threat-detection-agent] Agent started successfully
[privacy-shield-agent] Agent started successfully
[compliance-agent] Agent started successfully

✓ Server running on port 3000
✓ REST API: http://localhost:3000/api
✓ WebSocket: ws://localhost:3000
✓ Frontend: http://localhost:3000
```

## Test the API

### Health Check

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-23T..."}
```

### System Status

```bash
curl http://localhost:3000/api/status
```

Expected response:
```json
{
  "agents": {
    "threatDetection": "online",
    "privacyShield": "online",
    "compliance": "online"
  },
  "messagesProcessed": 0,
  "threatsDetected": 0,
  "privacyScore": 100,
  "uptime": 5
}
```

### Analyze a Message

**Example 1: Phishing Detection**

```bash
curl -X POST http://localhost:3000/api/message/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your account has been suspended! Click here immediately: http://phish.xyz",
    "metadata": {"sender": "suspicious@example.com"}
  }'
```

**Example 2: Privacy Leak Detection**

```bash
curl -X POST http://localhost:3000/api/message/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "My SSN is 123-45-6789 and email is john@example.com",
    "metadata": {"sender": "user@example.com"}
  }'
```

**Example 3: Clean Message**

```bash
curl -X POST http://localhost:3000/api/message/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hello, how are you today?",
    "metadata": {"sender": "friend@example.com"}
  }'
```

## Using the Frontend (Optional)

### Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Start Frontend Development Server

```bash
npm start
```

This will open http://localhost:3001 in your browser (if 3000 is already used by backend).

### Or Build and Serve Static Files

```bash
npm run build
cd ..
# Backend will serve frontend/build/ automatically
```

## WebSocket Example

Create a file `test-ws.js`:

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000');

ws.on('open', () => {
  console.log('Connected to ShieldAgent');
  
  // Analyze a message via WebSocket
  ws.send(JSON.stringify({
    type: 'analyze',
    content: 'Test message with email: test@example.com',
    metadata: { sender: 'test' }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message.type);
  console.log(JSON.stringify(message.data, null, 2));
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

Run it:
```bash
node test-ws.js
```

## Common Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm run dev` | Start development server (auto-reload) |
| `npm test` | Run tests |

## Environment Variables (Optional)

Create a `.env` file for custom configuration:

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
NODE_ENV=development

# Optional: Azure AI Services for enhanced detection
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-api-key
```

## Troubleshooting

### Port 3000 Already in Use

**Solution 1**: Change port in `.env`
```env
PORT=3001
```

**Solution 2**: Kill the process using port 3000
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### TypeScript Compilation Errors

Make sure you have the latest TypeScript:
```bash
npm install -D typescript@latest
npm run build
```

### Missing Dependencies

Clean install:
```bash
rm -rf node_modules package-lock.json
npm install
```

### WebSocket Connection Fails

- Check that server is running on correct port
- Use `ws://localhost:3000` (not `wss://` for local)
- Check firewall settings

## Next Steps

1. **Read the Documentation**: Check out [README.md](README.md) for detailed info
2. **Explore the API**: See all endpoints and examples
3. **Review Architecture**: Read [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Run Tests**: Execute `npm test` to see all tests pass
5. **Deploy to Azure**: Follow [azure-deploy/deploy.sh](azure-deploy/deploy.sh)

## Example Use Cases

### 1. Email Scanner

Integrate ShieldAgent into your email system to scan for:
- Phishing attempts
- Data leaks
- Compliance violations

### 2. Chat Application

Add real-time privacy protection to your chat app:
- Warn users about sensitive data
- Offer encryption for private conversations
- Ensure GDPR/CCPA compliance

### 3. API Gateway

Use ShieldAgent as a security layer:
- Scan all API requests/responses
- Detect malicious payloads
- Log compliance violations

### 4. Data Loss Prevention (DLP)

Implement enterprise DLP:
- Prevent PII leaks
- Enforce data handling policies
- Audit data access

## API Reference Quick Guide

### REST Endpoints

- `GET /api/health` - Health check
- `GET /api/status` - System status
- `POST /api/message/analyze` - Analyze message
- `POST /api/message/encrypt` - Encrypt message
- `GET /api/history?limit=50` - Message history
- `GET /api/stats` - Statistics

### WebSocket Events

**Client → Server:**
- `analyze` - Request message analysis

**Server → Client:**
- `status` - System status update
- `message-processed` - New analysis complete
- `threat-alert` - High threat detected
- `compliance-violation` - Compliance issue found
- `agent-status` - Agent status changed

## Performance Tips

1. **Use WebSocket**: Lower latency than REST for real-time apps
2. **Batch Requests**: Analyze multiple messages in parallel
3. **Cache Results**: Store analysis for identical messages
4. **Deploy to Azure**: Auto-scaling handles traffic spikes

## Support

- **Issues**: https://github.com/decentrathai/shieldagent/issues
- **Email**: team@decentrai.com
- **Discord**: [Join our community](https://discord.gg/decentrai)

## License

MIT License - see [LICENSE](LICENSE)

---

**Happy Hacking! 🛡️**

Built with ❤️ for the Microsoft AI Dev Days Hackathon 2026
