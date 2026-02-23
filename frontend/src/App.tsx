import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import MessageAnalyzer from './components/MessageAnalyzer';
import MessageHistory from './components/MessageHistory';

interface SystemStatus {
  agents: {
    threatDetection: string;
    privacyShield: string;
    compliance: string;
  };
  messagesProcessed: number;
  threatsDetected: number;
  privacyScore: number;
  uptime: number;
}

interface ProcessingResult {
  messageId: string;
  threat: any;
  privacy: any;
  compliance: any;
  timestamp: string;
}

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [connected, setConnected] = useState(false);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Fetch initial status
    fetchStatus();

    // Connect WebSocket
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'status':
          setStatus(message.data);
          break;
        case 'message-processed':
          setResults(prev => [message.data, ...prev].slice(0, 50));
          fetchStatus(); // Update stats
          break;
        case 'threat-alert':
          console.log('Threat alert:', message.data);
          break;
        case 'compliance-violation':
          console.log('Compliance violation:', message.data);
          break;
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      // Reconnect after 3 seconds
      setTimeout(connectWebSocket, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;
  };

  const handleAnalyze = (result: ProcessingResult) => {
    setResults(prev => [result, ...prev].slice(0, 50));
  };

  return (
    <div className="app">
      <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '● Connected' : '● Disconnected'}
      </div>

      <div className="header">
        <h1>🛡️ ShieldAgent</h1>
        <p>Privacy-Preserving Multi-Agent System for Secure Communications</p>
      </div>

      <div className="container">
        {status && <Dashboard status={status} />}
        <MessageAnalyzer onAnalyze={handleAnalyze} />
        <MessageHistory results={results} />
      </div>
    </div>
  );
};

export default App;
