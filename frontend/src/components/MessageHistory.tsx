import React from 'react';

interface ProcessingResult {
  messageId: string;
  threat: any;
  privacy: any;
  compliance: any;
  timestamp: string;
}

interface MessageHistoryProps {
  results: ProcessingResult[];
}

const MessageHistory: React.FC<MessageHistoryProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="card">
        <h2>Message History</h2>
        <p style={{ color: '#6b7280', textAlign: 'center', padding: '40px 0' }}>
          No messages analyzed yet. Use the analyzer above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Message History</h2>
      <p style={{ color: '#6b7280', marginBottom: '16px' }}>
        Last {results.length} analyzed messages
      </p>

      <div>
        {results.map((result) => (
          <div key={result.messageId} className="history-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                {result.messageId}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {new Date(result.timestamp).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span className={`threat-level threat-${result.threat.threatLevel}`}>
                Threat: {result.threat.threatLevel.toUpperCase()}
              </span>
              
              <span style={{ 
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                background: result.privacy.privacyScore > 70 ? '#d1fae5' : result.privacy.privacyScore > 40 ? '#fef3c7' : '#fee2e2',
                color: result.privacy.privacyScore > 70 ? '#065f46' : result.privacy.privacyScore > 40 ? '#92400e' : '#991b1b'
              }}>
                Privacy: {result.privacy.privacyScore}
              </span>

              <span style={{ 
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                background: result.compliance.compliant ? '#d1fae5' : '#fee2e2',
                color: result.compliance.compliant ? '#065f46' : '#991b1b'
              }}>
                Compliance: {result.compliance.compliant ? '✓' : '✗'}
              </span>

              {result.threat.threats.length > 0 && (
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {result.threat.threats.length} threat(s)
                </span>
              )}

              {result.privacy.leaks.length > 0 && (
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {result.privacy.leaks.length} leak(s)
                </span>
              )}

              {result.compliance.violations.length > 0 && (
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {result.compliance.violations.length} violation(s)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageHistory;
