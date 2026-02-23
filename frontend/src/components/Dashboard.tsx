import React from 'react';

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

interface DashboardProps {
  status: SystemStatus;
}

const Dashboard: React.FC<DashboardProps> = ({ status }) => {
  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="card">
      <h2>System Dashboard</h2>
      
      <div style={{ marginBottom: '24px' }}>
        <h3>Agent Status</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div>
            <span>Threat Detection: </span>
            <span className={`status-badge status-${status.agents.threatDetection}`}>
              {status.agents.threatDetection}
            </span>
          </div>
          <div>
            <span>Privacy Shield: </span>
            <span className={`status-badge status-${status.agents.privacyShield}`}>
              {status.agents.privacyShield}
            </span>
          </div>
          <div>
            <span>Compliance: </span>
            <span className={`status-badge status-${status.agents.compliance}`}>
              {status.agents.compliance}
            </span>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="metric">
          <div className="metric-value">{status.messagesProcessed}</div>
          <div className="metric-label">Messages Processed</div>
        </div>
        <div className="metric">
          <div className="metric-value">{status.threatsDetected}</div>
          <div className="metric-label">Threats Detected</div>
        </div>
        <div className="metric">
          <div className="metric-value">{status.privacyScore}</div>
          <div className="metric-label">Privacy Score</div>
        </div>
        <div className="metric">
          <div className="metric-value">{formatUptime(status.uptime)}</div>
          <div className="metric-label">Uptime</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
