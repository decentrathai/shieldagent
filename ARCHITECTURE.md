# ShieldAgent Architecture

## System Overview

ShieldAgent is a privacy-preserving multi-agent system built using the Microsoft Agent Framework pattern. It provides real-time threat detection, privacy protection, and compliance monitoring for communications.

## Architecture Diagram

```
                    ┌─────────────────────────────────────────┐
                    │         External Clients                │
                    │  (Web Browser, Mobile App, API Client) │
                    └────────────┬────────────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Load Balancer        │
                    │   (Azure Front Door)    │
                    └────────────┬────────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        │                        │                        │
┌───────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
│   REST API     │     │   WebSocket     │     │  Static Files   │
│  (Express.js)  │     │   Server (ws)   │     │   (React SPA)   │
└───────┬────────┘     └────────┬────────┘     └─────────────────┘
        │                       │
        └───────────┬───────────┘
                    │
            ┌───────▼────────┐
            │  Orchestrator  │◄──────────────┐
            │   (MCP Router) │               │
            └───────┬────────┘               │
                    │                        │
        ┌───────────┼───────────┐            │
        │           │           │            │
┌───────▼──────┐ ┌─▼──────────┐ ┌─▼─────────────┐
│   Threat     │ │  Privacy   │ │  Compliance   │
│  Detection   │ │   Shield   │ │    Agent      │
│    Agent     │ │   Agent    │ │               │
└──────┬───────┘ └─────┬──────┘ └──────┬────────┘
       │               │                │
       │   Inter-Agent Communication    │
       │   (Event-based Messaging)      │
       └───────────────┼────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
│ Pattern DB   │ │  ZK Proof │ │ Compliance │
│ (Threat)     │ │  Engine   │ │  Rules DB  │
└──────────────┘ └───────────┘ └────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
│   Azure AI   │ │  Storage  │ │Application │
│   Services   │ │  Account  │ │  Insights  │
└──────────────┘ └───────────┘ └────────────┘
```

## Component Details

### 1. Frontend Layer

**React Single-Page Application**
- **Components**: Dashboard, MessageAnalyzer, MessageHistory
- **State Management**: React Hooks (useState, useEffect)
- **Communication**: REST API + WebSocket for real-time updates
- **Deployment**: Static files served by Express or Azure App Service

**Technologies**:
- React 18
- TypeScript
- Recharts (for data visualization)
- WebSocket API

### 2. API Layer

**Express.js REST API**
- **Endpoints**: `/api/health`, `/api/status`, `/api/message/*`, `/api/history`, `/api/stats`
- **Middleware**: CORS, JSON parsing, error handling
- **Authentication**: Ready for JWT (not implemented in MVP)

**WebSocket Server**
- **Library**: `ws` (WebSocket library)
- **Events**: `message-processed`, `threat-alert`, `compliance-violation`, `agent-status`
- **Broadcasting**: Sends updates to all connected clients

### 3. Orchestration Layer

**Agent Orchestrator**
- **Pattern**: Microsoft Model Context Protocol (MCP) inspired
- **Responsibilities**:
  - Agent lifecycle management (start/stop)
  - Message routing between agents
  - Result aggregation
  - Event emission for real-time updates
  - Statistics tracking
- **Concurrency**: Parallel agent execution using Promise.all()

**Message Flow**:
```
1. Message arrives via API/WebSocket
2. Orchestrator creates Message object
3. Orchestrator sends to all 3 agents in parallel
4. Agents process independently
5. Results aggregated by orchestrator
6. Response sent to client
7. WebSocket broadcast to all connected clients
8. History and stats updated
```

### 4. Agent Layer

**Base Agent Class**
- Abstract base providing:
  - Event emission
  - Status management
  - Inter-agent messaging
  - Logging
- All agents extend BaseAgent

**Threat Detection Agent**
- **Inputs**: Message content + metadata
- **Outputs**: ThreatAssessment (level + details)
- **Detection Methods**:
  - Pattern matching (regex)
  - Keyword analysis
  - URL reputation
  - Metadata inspection
  - ML models (ready for integration)
- **Threat Types**: Phishing, metadata leaks, privacy breaches, malicious content, suspicious patterns

**Privacy Shield Agent**
- **Inputs**: Message object
- **Outputs**: PrivacyAnalysis (score + leaks) | Encrypted message
- **Protection Methods**:
  - PII detection
  - Location data stripping
  - Metadata anonymization
  - Zero-knowledge encryption
  - ZK proof generation/verification
- **Privacy Score**: 0-100 (higher = better privacy)

**Compliance Agent**
- **Inputs**: Message object
- **Outputs**: ComplianceCheck (compliant + violations)
- **Regulations**:
  - **GDPR**: Articles 5, 6, 17, 25, 32
  - **CCPA**: Sections 1798.100, 1798.120
  - **HIPAA**: 45 CFR 164.312, 164.508
  - **SOC2**: Trust Service Criteria
- **Checks**: Data minimization, consent, encryption, access controls, audit trails

### 5. Azure Infrastructure

**Deployment Options**:

**Option A: Azure Functions (Serverless)**
```
┌─────────────────────┐
│  Function App       │
│  - Node.js 18       │
│  - Consumption Plan │
│  - Auto-scaling     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Storage Account    │
│  - State            │
│  - Logs             │
└─────────────────────┘
```

**Option B: App Service (Always-on)**
```
┌─────────────────────┐
│  App Service        │
│  - Linux            │
│  - Node.js 18       │
│  - Always On        │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Application        │
│  Insights           │
│  - Monitoring       │
│  - Alerts           │
└─────────────────────┘
```

**Shared Resources**:
- **Azure Container Registry**: Docker images
- **Application Insights**: Telemetry, logging, alerts
- **Azure AI Services**: Enhanced ML detection (optional)
- **Azure Storage**: Persistent data (optional)
- **Azure Front Door**: CDN + Load balancing (production)

## Data Flow

### Message Analysis Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ POST /api/message/analyze
     │ { content: "...", metadata: {...} }
     │
┌────▼────────────┐
│  API Server     │
│  (Express)      │
└────┬────────────┘
     │ Create Message object
     │
┌────▼────────────┐
│  Orchestrator   │
└────┬─────┬─────┬┘
     │     │     │
     │     │     └─────────────────┐
     │     │                       │
┌────▼────┐  ┌────▼────┐  ┌───────▼───────┐
│ Threat  │  │ Privacy │  │  Compliance   │
│ Agent   │  │ Agent   │  │  Agent        │
└────┬────┘  └────┬────┘  └───────┬───────┘
     │            │                │
     │ ThreatAssessment            │
     │            │ PrivacyAnalysis│
     │            │                │ ComplianceCheck
     └────────────┼────────────────┘
                  │
         ┌────────▼────────┐
         │ Aggregate       │
         │ Results         │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │ Update Stats    │
         │ & History       │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │ Emit WS Event   │
         │ (broadcast)     │
         └────────┬────────┘
                  │
         ┌────────▼────────┐
         │ Return Result   │
         │ to Client       │
         └─────────────────┘
```

### Real-Time Update Flow

```
┌─────────┐          ┌─────────┐          ┌─────────┐
│Client 1 │          │Client 2 │          │Client 3 │
└────┬────┘          └────┬────┘          └────┬────┘
     │                    │                    │
     │ WebSocket          │ WebSocket          │ WebSocket
     │ Connection         │ Connection         │ Connection
     │                    │                    │
     └────────────────────┼────────────────────┘
                          │
                  ┌───────▼────────┐
                  │  WS Server     │
                  │  (ws library)  │
                  └───────┬────────┘
                          │
                          │ on('message-processed')
                          │ on('threat-alert')
                          │ on('compliance-violation')
                          │
                  ┌───────▼────────┐
                  │  Orchestrator  │
                  │  (EventEmitter)│
                  └───────┬────────┘
                          │
                ┌─────────┼─────────┐
                │         │         │
         ┌──────▼──┐  ┌───▼───┐  ┌─▼──────┐
         │ Threat  │  │Privacy│  │Complian│
         │ Agent   │  │Agent  │  │ce Agent│
         └─────────┘  └───────┘  └────────┘
```

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────┐
│  Layer 1: Transport Security            │
│  - HTTPS/TLS 1.2+                       │
│  - WebSocket Secure (wss://)            │
└─────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────┐
│  Layer 2: Authentication & Authorization│
│  - JWT tokens (ready)                   │
│  - API key validation                   │
│  - Rate limiting                        │
└─────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────┐
│  Layer 3: Input Validation              │
│  - JSON schema validation               │
│  - Content sanitization                 │
│  - Size limits                          │
└─────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────┐
│  Layer 4: Processing Security           │
│  - Zero-knowledge encryption            │
│  - No data retention (default)          │
│  - Audit logging                        │
└─────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────┐
│  Layer 5: Infrastructure Security       │
│  - Azure managed services               │
│  - Network isolation                    │
│  - Secret management (Key Vault)        │
└─────────────────────────────────────────┘
```

## Scalability

### Horizontal Scaling

```
                ┌─────────────┐
                │Azure Front  │
                │Door (CDN +  │
                │Load Balancer│
                └──────┬──────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
│  Instance 1  │ │Instance 2 │ │Instance 3 │
│  (EU West)   │ │(US East)  │ │(Asia SE)  │
└──────────────┘ └───────────┘ └───────────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
                ┌──────▼──────┐
                │ Shared State│
                │(Redis/CosmosDB)
                └─────────────┘
```

**Auto-scaling Triggers**:
- CPU > 70%
- Memory > 80%
- Request queue > 100
- Response time > 500ms

### Performance Optimizations

1. **Parallel Processing**: All 3 agents run concurrently
2. **Caching**: Pattern databases cached in memory
3. **Connection Pooling**: Database connections reused
4. **WebSocket**: Reduces HTTP overhead for real-time updates
5. **CDN**: Static assets served from edge locations

## Monitoring & Observability

### Application Insights Integration

```
┌─────────────────────────────────────────┐
│  Application Insights Dashboard         │
├─────────────────────────────────────────┤
│  - Request rates & latencies            │
│  - Agent performance metrics            │
│  - Error rates & exceptions             │
│  - Custom events (threats, violations)  │
│  - Live metrics stream                  │
└─────────────────────────────────────────┘
         ▲
         │ Telemetry
         │
┌────────┴────────┐
│  ShieldAgent    │
│  Application    │
└─────────────────┘
```

**Key Metrics**:
- Messages processed per second
- Average processing time per agent
- Threat detection rate
- Privacy score trends
- Compliance violation rate
- WebSocket connection count
- Error rate

### Alerting

- High threat detection rate (> 50%)
- Low average privacy score (< 40)
- High error rate (> 5%)
- Agent offline
- Response time degradation (> 1s)

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18 + TypeScript | User interface |
| API | Express.js | REST endpoints |
| WebSocket | ws library | Real-time updates |
| Orchestration | Custom MCP-inspired | Agent coordination |
| Agents | TypeScript classes | Core logic |
| Runtime | Node.js 18+ | Execution environment |
| Database | In-memory (MVP) → Azure Cosmos DB | Data persistence |
| Cache | In-memory (MVP) → Azure Redis | Performance |
| Hosting | Azure Functions / App Service | Serverless / PaaS |
| Monitoring | Application Insights | Observability |
| CI/CD | GitHub Actions (ready) | Automation |
| IaC | Bicep | Infrastructure as code |

## Future Enhancements

1. **Machine Learning**: Replace pattern matching with trained models
2. **Distributed Tracing**: OpenTelemetry integration
3. **Message Queue**: Azure Service Bus for reliable processing
4. **Graph Database**: Neo4j for relationship analysis
5. **Blockchain**: Immutable audit trail on-chain
6. **Federation**: Multi-organization agent networks
7. **Edge Deployment**: Run agents on edge devices
8. **Mobile SDK**: Native iOS/Android clients

---

**Architecture Version**: 1.0  
**Last Updated**: February 23, 2026  
**Author**: DecentrAI Team
