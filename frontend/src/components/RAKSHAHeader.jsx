import React from 'react';

const RAKSHAHeader = ({ callDuration, isCallActive, isDistress, distressScore }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatus = () => {
    if (isDistress) {
      return {
        label: 'ALERT ACTIVE',
        className: 'status-dot-danger',
        color: '#C95C5C',
        bg: 'rgba(201, 92, 92, 0.12)',
        border: 'rgba(201, 92, 92, 0.35)'
      };
    }
    if (distressScore > 50) {
      return {
        label: 'ELEVATED RISK',
        className: 'status-dot-elevated',
        color: '#C9A45C',
        bg: 'rgba(201, 164, 92, 0.12)',
        border: 'rgba(201, 164, 92, 0.3)'
      };
    }
    if (isCallActive) {
      return {
        label: 'PROTECTION ACTIVE',
        className: 'status-dot-safe',
        color: '#70B48A',
        bg: 'rgba(112, 180, 138, 0.12)',
        border: 'rgba(112, 180, 138, 0.3)'
      };
    }
    return {
      label: 'MONITORING READY',
      className: 'status-dot-safe',
      color: '#8D9A91',
      bg: '#19221D',
      border: '#2A3730'
    };
  };

  const status = getStatus();

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 32px',
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(11, 15, 13, 0.92)',
      backdropFilter: 'blur(16px)',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Protection Shield Icon */}
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          backgroundColor: isDistress ? 'rgba(201, 92, 92, 0.14)' : 'var(--bg-elevated)',
          border: isDistress ? '1px solid rgba(201, 92, 92, 0.4)' : '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDistress ? '0 0 14px rgba(201, 92, 92, 0.25)' : 'none',
          transition: 'all 0.3s ease'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M12 2L4 5V11.09C4 16.14 7.41 20.85 12 22C16.59 20.85 20 16.14 20 11.09V5L12 2Z" 
              stroke={isDistress ? '#C95C5C' : '#7BAE8C'} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill={isDistress ? 'rgba(201, 92, 92, 0.15)' : 'rgba(123, 174, 140, 0.12)'}
            />
            <path 
              d="M12 8V13M12 16H12.01" 
              stroke={isDistress ? '#C95C5C' : '#7BAE8C'} 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '0.8px',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              RAKSHA
            </h1>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)'
            }}>
              v2.0
            </span>
          </div>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            margin: 0,
            marginTop: '2px',
            fontWeight: 400
          }}>
            Silent Protection. Smarter Safety.
          </p>
        </div>
      </div>

      {/* Right Controls / Telemetry */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Call Duration (When active) */}
        {isCallActive && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: "var(--font-mono)",
            fontSize: '13px',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-elevated)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
              Active:
            </span>
            <span style={{ color: 'var(--primary-accent)', fontWeight: 600 }}>
              {formatTime(callDuration)}
            </span>
          </div>
        )}

        {/* System Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: status.bg,
          border: `1px solid ${status.border}`
        }}>
          <span className={`status-dot ${status.className}`} />
          <span style={{
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            color: status.color
          }}>
            {status.label}
          </span>
        </div>
      </div>
    </header>
  );
};

export default RAKSHAHeader;