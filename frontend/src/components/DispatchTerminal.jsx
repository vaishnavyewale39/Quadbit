import React, { useRef, useEffect } from 'react';

const DispatchTerminal = ({ logs, eventCount }) => {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div 
      className="cyber-card"
      style={{
        padding: '18px 20px',
        borderRadius: '2px',
        border: '1px solid rgba(0, 240, 255, 0.22)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '12px',
          color: '#00f0ff',
          fontWeight: 700,
          letterSpacing: '1px'
        }}>
          DISPATCH TERMINAL
        </span>

        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px',
          padding: '2px 8px',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: '3px',
          color: eventCount > 0 ? '#ff1a53' : '#5e8ca0',
          backgroundColor: 'rgba(0, 240, 255, 0.05)',
          letterSpacing: '1px'
        }}>
          {eventCount} {eventCount === 1 ? 'EVENT' : 'EVENTS'}
        </span>
      </div>

      {/* Terminal Output */}
      <div style={{
        width: '100%',
        height: '180px',
        backgroundColor: 'rgba(2, 6, 12, 0.9)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '2px',
        padding: '12px',
        overflowY: 'auto',
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '11px',
        lineHeight: '1.6'
      }}>
        {logs.map((log, index) => {
          let color = '#81b2c4';
          if (log.type === 'error' || log.text.includes('CRITICAL') || log.text.includes('🚨')) {
            color = '#ff4d6d';
          } else if (log.type === 'warning' || log.text.includes('check the oven')) {
            color = '#ffd15c';
          } else if (log.type === 'highlight' || log.text.includes('Pipeline Ready')) {
            color = '#00f0ff';
          } else if (log.type === 'success' || log.text.includes('dispatched successfully')) {
            color = '#00ff88';
          }

          return (
            <div key={index} style={{ color, marginBottom: '4px' }}>
              <span style={{ color: '#4ae3ff', opacity: 0.65, marginRight: '6px' }}>
                [{log.timestamp}]
              </span>
              <span>{log.text}</span>
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
};

export default DispatchTerminal;
