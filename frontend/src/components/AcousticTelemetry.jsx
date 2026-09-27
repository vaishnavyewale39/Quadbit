import React from 'react';

const AcousticTelemetry = ({ 
  acousticDb = 0.0, 
  distressScore = 0, 
  thresholdSensitivity = 60, 
  setThresholdSensitivity 
}) => {
  // Normalize dB (e.g. 0 to 100 dB) to percentage for bar
  const dbPercent = Math.min(100, Math.max(0, (acousticDb / 90) * 100));

  return (
    <div 
      className="cyber-card"
      style={{
        padding: '18px 20px',
        borderRadius: '2px',
        marginBottom: '16px',
        border: '1px solid rgba(0, 240, 255, 0.22)'
      }}
    >
      {/* 1. Acoustic Pressure */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '12px',
            color: '#00f0ff',
            letterSpacing: '1px',
            fontWeight: 600
          }}>
            ACOUSTIC PRESSURE
          </span>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '13px',
            color: '#00f0ff',
            fontWeight: 700,
            textShadow: '0 0 6px rgba(0, 240, 255, 0.6)'
          }}>
            {acousticDb.toFixed(1)} dB
          </span>
        </div>
        {/* Progress Bar Container */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'rgba(0, 240, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 240, 255, 0.2)'
        }}>
          <div style={{
            height: '100%',
            width: `${dbPercent}%`,
            backgroundColor: dbPercent > 70 ? '#ff1a53' : '#00f0ff',
            boxShadow: dbPercent > 70 ? '0 0 10px #ff1a53' : '0 0 8px #00f0ff',
            transition: 'width 0.1s ease-out'
          }} />
        </div>
      </div>

      {/* 2. Distress Score */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '12px',
            color: '#00f0ff',
            letterSpacing: '1px',
            fontWeight: 600
          }}>
            Distress Score
          </span>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '13px',
            color: distressScore > 50 ? '#ff1a53' : '#00f0ff',
            fontWeight: 700,
            textShadow: distressScore > 50 ? '0 0 8px rgba(255, 26, 83, 0.8)' : '0 0 6px rgba(0, 240, 255, 0.6)'
          }}>
            {Math.round(distressScore)}%
          </span>
        </div>
        {/* Distress Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'rgba(0, 240, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          border: '1px solid rgba(0, 240, 255, 0.2)'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(100, Math.max(0, distressScore))}%`,
            background: distressScore > 70 
              ? 'linear-gradient(90deg, #ff9900, #ff1a53)' 
              : distressScore > 40 
              ? 'linear-gradient(90deg, #00f0ff, #ff9900)' 
              : '#00f0ff',
            boxShadow: distressScore > 50 ? '0 0 10px #ff1a53' : '0 0 8px #00f0ff',
            transition: 'width 0.15s ease-out'
          }} />
        </div>
      </div>

      {/* 3. Threshold Sensitivity Slider */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '12px',
            color: '#00f0ff',
            letterSpacing: '1px',
            fontWeight: 600
          }}>
            Threshold Sensitivity
          </span>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '13px',
            color: '#00f0ff',
            fontWeight: 700,
            textShadow: '0 0 6px rgba(0, 240, 255, 0.6)'
          }}>
            {thresholdSensitivity}%
          </span>
        </div>

        {/* Custom Range Slider */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min="10"
            max="95"
            value={thresholdSensitivity}
            onChange={(e) => setThresholdSensitivity(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#00f0ff',
              cursor: 'pointer',
              height: '4px',
              backgroundColor: 'rgba(0, 240, 255, 0.2)',
              borderRadius: '2px',
              outline: 'none'
            }}
          />
        </div>

        {/* Slider Labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px',
          color: '#5e8ca0',
          letterSpacing: '0.5px'
        }}>
          <span>High sensitivity</span>
          <span>Heavy shouting</span>
        </div>
      </div>
    </div>
  );
};

export default AcousticTelemetry;
