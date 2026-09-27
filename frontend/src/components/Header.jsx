import React from 'react';

const Header = ({ callDuration, isCallActive }) => {
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: '1px solid rgba(0, 240, 255, 0.18)',
      backgroundColor: 'rgba(2, 8, 16, 0.95)',
      backdropFilter: 'blur(10px)',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Left: Branding & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* HUD Target Icon */}
        <div style={{
          width: '36px',
          height: '36px',
          border: '1.5px solid #00f0ff',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          boxShadow: '0 0 10px rgba(0, 240, 255, 0.35)',
          background: 'rgba(0, 240, 255, 0.05)'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            backgroundColor: '#00f0ff',
            borderRadius: '50%',
            boxShadow: '0 0 8px #00f0ff'
          }} />
          <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '6px', height: '6px', borderTop: '2px solid #00f0ff', borderLeft: '2px solid #00f0ff' }} />
          <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '6px', height: '6px', borderBottom: '2px solid #00f0ff', borderRight: '2px solid #00f0ff' }} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '2px',
              color: '#00f0ff',
              textShadow: '0 0 10px rgba(0, 240, 255, 0.6)',
              margin: 0
            }}>
              AEGIS // DISTRESS ENGINE
            </h1>
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: '11px',
              padding: '2px 8px',
              border: '1px solid #00f0ff',
              borderRadius: '12px',
              color: '#00f0ff',
              backgroundColor: 'rgba(0, 240, 255, 0.1)',
              letterSpacing: '1px'
            }}>
              PoC v2.4
            </span>
          </div>
          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '12px',
            color: '#5e8ca0',
            letterSpacing: '1px',
            marginTop: '3px',
            margin: 0
          }}>
            Autonomous Non-Verbal Acoustic & Linguistic Surveillance
          </p>
        </div>
      </div>

      {/* Right: Telemetry Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {/* Call Duration */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '11px',
            color: '#4ae3ff',
            letterSpacing: '1.5px',
            opacity: 0.8
          }}>
            CALL DURATION
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '18px',
            fontWeight: 700,
            color: isCallActive ? '#00f0ff' : '#00f0ff',
            textShadow: '0 0 8px rgba(0, 240, 255, 0.5)',
            letterSpacing: '2px'
          }}>
            {formatTime(callDuration)}
          </div>
        </div>

        {/* Acoustic Model */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '11px',
            color: '#4ae3ff',
            letterSpacing: '1.5px',
            opacity: 0.8
          }}>
            ACOUSTIC MODEL
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '15px',
            fontWeight: 600,
            color: '#00f0ff',
            letterSpacing: '1px'
          }}>
            FFT 256-BIN REALTIME
          </div>
        </div>

        {/* Secret Passphrase */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '11px',
            color: '#4ae3ff',
            letterSpacing: '1.5px',
            opacity: 0.8
          }}>
            SECRET PASSPHRASE
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '16px',
            fontWeight: 700,
            color: '#ffd15c',
            textShadow: '0 0 10px rgba(255, 209, 92, 0.5)',
            letterSpacing: '1px'
          }}>
            "check the oven"
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
