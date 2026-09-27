import React from 'react';

const DefenseSentinel = ({ isDistress }) => {
  return (
    <div 
      className={`cyber-card ${isDistress ? 'cyber-card-danger' : ''}`}
      style={{
        padding: '18px 20px',
        borderRadius: '2px',
        marginBottom: '16px',
        transition: 'all 0.3s ease',
        border: isDistress ? '1px solid rgba(255, 26, 83, 0.4)' : '1px solid rgba(0, 240, 255, 0.22)',
        boxShadow: isDistress 
          ? '0 0 25px rgba(255, 26, 83, 0.25), inset 0 0 15px rgba(255, 26, 83, 0.1)' 
          : '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(0, 240, 255, 0.03)'
      }}
    >
      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '11px',
        color: isDistress ? '#ff6685' : '#4ae3ff',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        marginBottom: '10px',
        opacity: 0.85
      }}>
        DEFENSE SENTINEL STATE
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px'
      }}>
        <div 
          className={isDistress ? 'pulse-beacon-red' : 'pulse-beacon-green'}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isDistress ? '#ff1a53' : '#00ff88',
            flexShrink: 0
          }}
        />
        <span style={{
          fontFamily: "'Orbitron', 'Chakra Petch', sans-serif",
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '1.5px',
          color: isDistress ? '#ff1a53' : '#00ff88',
          textShadow: isDistress ? '0 0 10px rgba(255, 26, 83, 0.8)' : '0 0 10px rgba(0, 255, 136, 0.8)'
        }}>
          {isDistress ? 'DISTRESS DETECTED - SOS' : 'MONITORING - SAFE'}
        </span>
      </div>

      <p style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: '12px',
        lineHeight: '1.5',
        color: isDistress ? '#ffa8b8' : '#79a8bc',
        letterSpacing: '0.4px',
        margin: 0
      }}>
        {isDistress 
          ? 'EMERGENCY PROTOCOL ENGAGED. Passphrase identified or severe decibel shock captured. Real-time telemetry dispatch active.'
          : 'Passive microphone listener active. Real-time acoustic frequency profiling running without anomalies.'
        }
      </p>
    </div>
  );
};

export default DefenseSentinel;
