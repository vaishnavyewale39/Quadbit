import React from 'react';

const MonitoringStatus = ({ isDistress, distressScore, isCallActive }) => {
  const getStatusDetails = () => {
    if (isDistress) {
      return {
        title: 'ALERT ACTIVE',
        dotClass: 'status-dot-danger',
        textColor: '#C95C5C',
        bgColor: 'rgba(201, 92, 92, 0.12)',
        borderColor: 'rgba(201, 92, 92, 0.35)',
        description: 'Distress condition confirmed. Silent emergency alert dispatched to trusted contacts with live location.'
      };
    }
    if (distressScore > 50) {
      return {
        title: 'ELEVATED RISK',
        dotClass: 'status-dot-elevated',
        textColor: '#C9A45C',
        bgColor: 'rgba(201, 164, 92, 0.12)',
        borderColor: 'rgba(201, 164, 92, 0.3)',
        description: 'Acoustic anomaly detected. Monitoring for secondary confirmation or secret phrase.'
      };
    }
    if (isCallActive) {
      return {
        title: 'MONITORING — SAFE',
        dotClass: 'status-dot-safe',
        textColor: '#70B48A',
        bgColor: 'rgba(112, 180, 138, 0.12)',
        borderColor: 'rgba(112, 180, 138, 0.3)',
        description: 'RAKSHA is actively listening for your configured distress signals in real time.'
      };
    }
    return {
      title: 'STANDBY — SAFE',
      dotClass: 'status-dot-safe',
      textColor: '#8D9A91',
      bgColor: 'var(--bg-elevated)',
      borderColor: 'var(--border-subtle)',
      description: 'Microphone is currently idle. Start monitoring to begin active acoustic protection.'
    };
  };

  const status = getStatusDetails();

  return (
    <div 
      className={`raksha-card ${isDistress ? 'raksha-card-danger' : ''}`}
      style={{
        padding: '22px'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px'
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '1px',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase'
        }}>
          PROTECTION STATUS
        </span>

        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: isCallActive ? 'var(--primary-accent)' : 'var(--text-secondary)'
        }}>
          {isCallActive ? 'Mic Online' : 'Standby'}
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: status.bgColor,
        border: `1px solid ${status.borderColor}`,
        marginBottom: '14px',
        transition: 'all 0.3s ease'
      }}>
        <span className={`status-dot ${status.dotClass}`} />
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '0.4px',
          color: status.textColor
        }}>
          {status.title}
        </span>
      </div>

      <p style={{
        fontSize: '13px',
        lineHeight: '1.6',
        color: 'var(--text-secondary)',
        margin: 0
      }}>
        {status.description}
      </p>
    </div>
  );
};

export default MonitoringStatus;