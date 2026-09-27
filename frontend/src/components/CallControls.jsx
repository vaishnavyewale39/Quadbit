import React from 'react';

const CallControls = ({ 
  isCallActive, 
  onToggleCall, 
  onSimulateSOS, 
  onResetSystem 
}) => {
  return (
    <div style={{
      display: 'flex',
      gap: '14px',
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      {/* 1. Primary Action: START / STOP MONITORING */}
      <button
        onClick={onToggleCall}
        style={{
          flex: '2',
          minWidth: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '13px 24px',
          backgroundColor: isCallActive ? 'var(--bg-elevated)' : 'var(--primary-accent)',
          color: isCallActive ? 'var(--text-primary)' : '#0B0F0D',
          fontFamily: 'var(--font-serif)',
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '0.4px',
          borderRadius: 'var(--radius-md)',
          border: isCallActive ? '1px solid var(--primary-accent)' : '1px solid var(--primary-accent)',
          cursor: 'pointer',
          boxShadow: isCallActive 
            ? 'none' 
            : '0 2px 10px rgba(123, 174, 140, 0.25)',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          if (!isCallActive) {
            e.currentTarget.style.backgroundColor = 'var(--bright-accent)';
          } else {
            e.currentTarget.style.backgroundColor = 'rgba(123, 174, 140, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.backgroundColor = isCallActive ? 'var(--bg-elevated)' : 'var(--primary-accent)';
        }}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {isCallActive ? (
            <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
          ) : (
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
          )}
        </svg>
        <span>{isCallActive ? 'STOP MONITORING' : 'START MONITORING'}</span>
      </button>

      {/* 2. Secondary Testing Action: SIMULATE SOS */}
      <button
        onClick={onSimulateSOS}
        style={{
          flex: '1',
          minWidth: '150px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '13px 18px',
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--alert-red)',
          fontFamily: 'var(--font-serif)',
          fontSize: '12px',
          fontWeight: 700,
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(201, 92, 92, 0.35)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(201, 92, 92, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(201, 92, 92, 0.6)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
          e.currentTarget.style.borderColor = 'rgba(201, 92, 92, 0.35)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: 'var(--alert-red)',
          display: 'inline-block'
        }} />
        <span>Simulate SOS (Demo)</span>
      </button>

      {/* 3. Subtle Reset Action */}
      <button
        onClick={onResetSystem}
        style={{
          padding: '13px 18px',
          backgroundColor: 'var(--bg-elevated)',
          color: 'var(--text-secondary)',
          fontFamily: 'var(--font-serif)',
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--text-secondary)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        Reset System
      </button>
    </div>
  );
};

export default CallControls;