import React from 'react';

const ActionBar = ({ 
  isCallActive, 
  onToggleCall, 
  onSimulateSOS, 
  onResetSystem 
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px 20px',
      backgroundColor: 'rgba(3, 10, 18, 0.95)',
      border: '1px solid rgba(0, 240, 255, 0.22)',
      borderRadius: '2px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
    }}>
      {/* 1. START / END CALL BUTTON */}
      <button
        onClick={onToggleCall}
        style={{
          flex: '1.2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '12px 20px',
          background: isCallActive 
            ? 'linear-gradient(135deg, #106b8c 0%, #0099cc 100%)' 
            : 'linear-gradient(135deg, #0088cc 0%, #00b4d8 100%)',
          color: '#ffffff',
          fontFamily: "'Orbitron', 'Chakra Petch', sans-serif",
          fontSize: '13px',
          fontWeight: 700,
          letterSpacing: '1.5px',
          border: '1px solid #00f0ff',
          borderRadius: '4px',
          cursor: 'pointer',
          boxShadow: isCallActive 
            ? '0 0 16px rgba(0, 240, 255, 0.6)' 
            : '0 0 12px rgba(0, 180, 216, 0.4)',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.8)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = isCallActive ? '0 0 16px rgba(0, 240, 255, 0.6)' : '0 0 12px rgba(0, 180, 216, 0.4)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{ fontSize: '15px' }}>📞</span>
        <span>{isCallActive ? 'END CALL' : 'START CALL'}</span>
      </button>

      {/* 2. SIMULATE SOS BUTTON */}
      <button
        onClick={onSimulateSOS}
        style={{
          flex: '1.1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px 18px',
          backgroundColor: 'rgba(40, 6, 14, 0.85)',
          color: '#ff3366',
          fontFamily: "'Orbitron', 'Chakra Petch', sans-serif",
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '1.5px',
          border: '1px solid rgba(255, 26, 83, 0.6)',
          borderRadius: '4px',
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(255, 26, 83, 0.25)',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 18px rgba(255, 26, 83, 0.6)';
          e.currentTarget.style.backgroundColor = 'rgba(70, 10, 24, 0.95)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 26, 83, 0.25)';
          e.currentTarget.style.backgroundColor = 'rgba(40, 6, 14, 0.85)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: '#ff1a53',
          boxShadow: '0 0 8px #ff1a53',
          display: 'inline-block'
        }} />
        <span>SIMULATE SOS</span>
      </button>

      {/* 3. RESET SYSTEM BUTTON */}
      <button
        onClick={onResetSystem}
        style={{
          flex: '0.9',
          padding: '12px 16px',
          backgroundColor: 'rgba(10, 20, 32, 0.6)',
          color: '#79a8bc',
          fontFamily: "'Orbitron', 'Chakra Petch', sans-serif",
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '1px',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#00f0ff';
          e.currentTarget.style.color = '#00f0ff';
          e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.3)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.25)';
          e.currentTarget.style.color = '#79a8bc';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        RESET SYSTEM
      </button>
    </div>
  );
};

export default ActionBar;
