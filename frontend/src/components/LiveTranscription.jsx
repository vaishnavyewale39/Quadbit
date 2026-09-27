import React, { useRef, useEffect } from 'react';

const LiveTranscription = ({ 
  transcript, 
  interimTranscript, 
  isCallActive, 
  isDistress,
  secretPhrases = []
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  const hasContent = transcript.length > 0 || Boolean(interimTranscript);

  // Check if a line contains any active secret phrase
  const checkPhraseMatch = (line) => {
    const lower = line.toLowerCase();
    return secretPhrases.some(sp => sp.enabled && lower.includes(sp.phrase.toLowerCase()));
  };

  return (
    <div 
      className="raksha-card"
      style={{
        padding: '22px'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`status-dot ${isCallActive ? (isDistress ? 'status-dot-danger' : 'status-dot-safe') : ''}`} 
            style={{ backgroundColor: !isCallActive ? 'var(--text-secondary)' : undefined }}
          />
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase'
          }}>
            SPEECH TO TEXT (LIVE)
          </span>
        </div>

        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '3px 10px',
          borderRadius: '9999px',
          backgroundColor: isCallActive ? 'rgba(123, 174, 140, 0.15)' : 'var(--bg-elevated)',
          color: isDistress ? 'var(--alert-red)' : isCallActive ? 'var(--primary-accent)' : 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)'
        }}>
          {isDistress ? 'Distress Flagged' : isCallActive ? (interimTranscript ? '🎙️ Speaking...' : '● Listening') : 'Standby'}
        </span>
      </div>

      {/* Transcript Box */}
      <div 
        ref={containerRef}
        style={{
          width: '100%',
          height: '140px',
          backgroundColor: 'var(--bg-base)',
          borderRadius: 'var(--radius-sm)',
          border: isCallActive && interimTranscript 
            ? '1px solid var(--primary-accent)' 
            : '1px solid var(--border-subtle)',
          padding: '12px 14px',
          overflowY: 'auto',
          fontSize: '13px',
          lineHeight: '1.6',
          color: 'var(--text-primary)',
          transition: 'border-color 0.2s ease',
          boxShadow: isCallActive && interimTranscript ? '0 0 10px rgba(123, 174, 140, 0.15)' : 'none'
        }}
      >
        {!isCallActive && !hasContent ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', paddingTop: '8px' }}>
            Click <strong style={{ color: 'var(--primary-accent)' }}>START MONITORING</strong> to activate real-time speech-to-text. Spoken words will appear here instantly as you speak.
          </div>
        ) : !hasContent ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot status-dot-safe" style={{ width: '6px', height: '6px' }} />
            Listening to room audio... Speak now to see real-time transcription.
          </div>
        ) : (
          <div>
            {transcript.map((line, idx) => {
              const matched = checkPhraseMatch(line);
              return (
                <div 
                  key={idx} 
                  style={{ 
                    marginBottom: '6px',
                    color: matched ? 'var(--warning-amber)' : 'var(--text-primary)',
                    fontWeight: matched ? 600 : 400,
                    padding: matched ? '3px 8px' : '0',
                    backgroundColor: matched ? 'rgba(201, 164, 92, 0.12)' : 'transparent',
                    border: matched ? '1px solid rgba(201, 164, 92, 0.25)' : 'none',
                    borderRadius: 'var(--radius-sm)',
                    wordBreak: 'break-word'
                  }}
                >
                  {matched ? '⚠️ ' : ''}{line}
                </div>
              );
            })}
            {interimTranscript && (
              <div style={{
                color: 'var(--bright-accent)',
                backgroundColor: 'rgba(123, 174, 140, 0.1)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--primary-accent)',
                fontStyle: 'normal',
                fontWeight: 500,
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                wordBreak: 'break-word'
              }}>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>🎙️</span>
                <span>{interimTranscript}</span>
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '14px',
                  backgroundColor: 'var(--primary-accent)',
                  animation: 'pulseSafe 1s infinite'
                }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveTranscription;