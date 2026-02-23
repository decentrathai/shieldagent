import React, { useState } from 'react';

interface MessageAnalyzerProps {
  onAnalyze: (result: any) => void;
}

const MessageAnalyzer: React.FC<MessageAnalyzerProps> = ({ onAnalyze }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/message/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          metadata: {
            sender: 'user',
            timestamp: new Date().toISOString(),
          },
        }),
      });

      const data = await response.json();
      setResult(data);
      onAnalyze(data);
    } catch (error) {
      console.error('Failed to analyze message:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatColor = (level: string): string => {
    const colors: Record<string, string> = {
      none: '#10b981',
      low: '#3b82f6',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#7c3aed',
    };
    return colors[level] || '#6b7280';
  };

  return (
    <div className="card">
      <h2>Message Analyzer</h2>
      <p style={{ color: '#6b7280', marginBottom: '16px' }}>
        Enter a message to analyze for threats, privacy leaks, and compliance violations.
      </p>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter message to analyze..."
        style={{ marginBottom: '16px' }}
      />

      <button onClick={handleAnalyze} disabled={loading || !message.trim()}>
        {loading ? 'Analyzing...' : 'Analyze Message'}
      </button>

      {result && (
        <div style={{ marginTop: '24px' }}>
          <h3>Analysis Results</h3>
          
          <div className="grid" style={{ marginTop: '16px' }}>
            {/* Threat Analysis */}
            <div style={{ 
              padding: '16px', 
              borderLeft: `4px solid ${getThreatColor(result.threat.threatLevel)}`,
              background: '#f9fafb',
              borderRadius: '4px'
            }}>
              <h4>Threat Detection</h4>
              <div style={{ marginTop: '12px' }}>
                <span className={`threat-level threat-${result.threat.threatLevel}`}>
                  {result.threat.threatLevel.toUpperCase()}
                </span>
                <div style={{ marginTop: '12px', fontSize: '14px', color: '#6b7280' }}>
                  {result.threat.threats.length} threat(s) detected
                </div>
                {result.threat.threats.length > 0 && (
                  <ul style={{ marginTop: '8px', fontSize: '13px', color: '#374151' }}>
                    {result.threat.threats.slice(0, 3).map((threat: any, i: number) => (
                      <li key={i}>{threat.description}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Privacy Analysis */}
            <div style={{ 
              padding: '16px', 
              borderLeft: `4px solid ${result.privacy.privacyScore > 70 ? '#10b981' : result.privacy.privacyScore > 40 ? '#f59e0b' : '#ef4444'}`,
              background: '#f9fafb',
              borderRadius: '4px'
            }}>
              <h4>Privacy Shield</h4>
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#667eea' }}>
                  {result.privacy.privacyScore}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  Privacy Score (0-100)
                </div>
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#374151' }}>
                  {result.privacy.leaks.length} leak(s) detected
                </div>
                {result.privacy.encrypted && (
                  <div style={{ marginTop: '8px', color: '#10b981', fontSize: '13px' }}>
                    ✓ Encrypted
                  </div>
                )}
              </div>
            </div>

            {/* Compliance Analysis */}
            <div style={{ 
              padding: '16px', 
              borderLeft: `4px solid ${result.compliance.compliant ? '#10b981' : '#ef4444'}`,
              background: '#f9fafb',
              borderRadius: '4px'
            }}>
              <h4>Compliance</h4>
              <div style={{ marginTop: '12px' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: '600',
                  color: result.compliance.compliant ? '#10b981' : '#ef4444'
                }}>
                  {result.compliance.compliant ? '✓ Compliant' : '✗ Violations Found'}
                </div>
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#374151' }}>
                  {result.compliance.regulations.map((reg: any) => (
                    <div key={reg.name} style={{ marginBottom: '4px' }}>
                      <span style={{ 
                        color: reg.compliant ? '#10b981' : '#ef4444',
                        fontWeight: '600'
                      }}>
                        {reg.name}
                      </span>
                      {' '}
                      {reg.compliant ? '✓' : '✗'}
                    </div>
                  ))}
                </div>
                {result.compliance.violations.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#ef4444' }}>
                    {result.compliance.violations.length} violation(s)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Threats */}
          {result.threat.threats.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4>Threat Details</h4>
              {result.threat.threats.map((threat: any, i: number) => (
                <div key={i} style={{ 
                  marginTop: '12px',
                  padding: '12px',
                  background: '#fef2f2',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  <div style={{ fontWeight: '600', color: '#991b1b' }}>
                    {threat.type.toUpperCase()} (Severity: {threat.severity}/10)
                  </div>
                  <div style={{ marginTop: '4px', color: '#374151' }}>
                    {threat.description}
                  </div>
                  {threat.mitigation && (
                    <div style={{ marginTop: '8px', color: '#059669', fontSize: '12px' }}>
                      💡 {threat.mitigation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Privacy Leaks */}
          {result.privacy.leaks.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4>Privacy Leaks</h4>
              {result.privacy.leaks.map((leak: any, i: number) => (
                <div key={i} style={{ 
                  marginTop: '12px',
                  padding: '12px',
                  background: '#fffbeb',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  <div style={{ fontWeight: '600', color: '#92400e' }}>
                    {leak.type.toUpperCase()} (Severity: {leak.severity}/10)
                  </div>
                  <div style={{ marginTop: '4px', color: '#374151' }}>
                    {leak.data}
                  </div>
                  <div style={{ marginTop: '8px', color: '#059669', fontSize: '12px' }}>
                    💡 {leak.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compliance Violations */}
          {result.compliance.violations.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h4>Compliance Violations</h4>
              {result.compliance.violations.map((violation: any, i: number) => (
                <div key={i} style={{ 
                  marginTop: '12px',
                  padding: '12px',
                  background: '#fef2f2',
                  borderRadius: '6px',
                  fontSize: '13px'
                }}>
                  <div style={{ fontWeight: '600', color: '#991b1b' }}>
                    {violation.regulation} - {violation.article}
                  </div>
                  <div style={{ marginTop: '4px', color: '#374151' }}>
                    {violation.description}
                  </div>
                  <div style={{ marginTop: '8px', color: '#059669', fontSize: '12px' }}>
                    💡 {violation.remediation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageAnalyzer;
