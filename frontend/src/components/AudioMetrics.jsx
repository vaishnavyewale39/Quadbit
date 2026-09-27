import React from 'react';

const AudioMetrics = ({ 
  acousticDb = 0.0, 
  distressScore = 0, 
  thresholdSensitivity = 60, 
  setThresholdSensitivity,
  isCallActive 
}) => {
  // Normalize dB (0 to 85 dB) to percentage
  const dbPercent = Math.min(100, Math.max(0, (acousticDb / 85) * 100));

  const getDbColor = () => {
    if (acousticDb > 75) return 'var(--alert-red)';
    if (acousticDb > 55) return 'var(--warning-amber)';
    return 'var(--primary-accent)';
  };

  const getRiskColor = () => {
    if (distressScore > 70) return 'var(--alert-red)';
    if (distressScore > 40) return 'var(--warning-amber)';
    return 'var(--safe-green)';
  };

  return (
    <div 
      className="raksha-card"
      style={{
        padding: '22px'
      }}
    >
      <div style={{
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '1px',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        marginBottom: '16px'
      }}>
        AUDIO METRICS
      </div>

      {/* 1. Acoustic Level */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Acoustic Level
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: '12px',
            fontWeight: 600,
            color: getDbColor()
          }}>
            {isCallActive ? `${acousticDb.toFixed(1)} dB` : '0.0 dB'}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: '9999px',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            height: '100%',
            width: isCallActive ? `${dbPercent}%` : '0%',
            backgroundColor: getDbColor(),
            borderRadius: '9999px',
            transition: 'width 0.1s ease-out'
          }} />
        </div>
      </div>

      {/* 2. Distress Risk */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Distress Risk
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: '12px',
            fontWeight: 700,
            color: getRiskColor()
          }}>
            {Math.round(distressScore)}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: '9999px',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, distressScore))}%`,
            background: distressScore > 70 
              ? 'linear-gradient(90deg, var(--warning-amber), var(--alert-red))' 
              : distressScore > 40 
              ? 'linear-gradient(90deg, var(--safe-green), var(--warning-amber))' 
              : 'var(--safe-green)',
            borderRadius: '9999px',
            transition: 'width 0.2s ease-out'
          }} />
        </div>
      </div>

      {/* 3. Detection Sensitivity */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Detection Sensitivity
          </span>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--primary-accent)'
          }}>
            {thresholdSensitivity}%
          </span>
        </div>

        <input
          type="range"
          min="15"
          max="90"
          value={thresholdSensitivity}
          onChange={(e) => setThresholdSensitivity(Number(e.target.value))}
          style={{
            width: '100%',
            cursor: 'pointer',
            height: '6px',
            marginBottom: '8px',
            display: 'block'
          }}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-secondary)'
        }}>
          <span>High sensitivity</span>
          <span>Heavy shouting</span>
        </div>
      </div>
    </div>
  );
};

export default AudioMetrics;