import React, { useRef, useEffect } from 'react';

const LANGUAGE_CONFIGS = [
  { code: 'en-US', label: 'English', native: 'English', placeholder: 'e.g. "I need help"' },
  { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी', placeholder: 'उदा. "मुझे मदद चाहिए"' },
  { code: 'mr-IN', label: 'Marathi', native: 'मराठी', placeholder: 'उदा. "मला मदत हवी आहे"' }
];

const LiveTranscription = ({ 
  transcript = [], 
  interimTranscript = '', 
  isCallActive = false, 
  isDistress = false,
  secretPhrases = [],
  selectedLanguage = 'en-US',
  onLanguageChange = () => {},
  backendStatus = null,
  speechSupported = true
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  const hasContent = transcript.length > 0 || Boolean(interimTranscript);

  // Check if a line matches any active secret phrase (supports English & Devanagari)
  const checkPhraseMatch = (line) => {
    if (!line) return false;
    const lower = line.toLowerCase();
    return secretPhrases.some((sp) => {
      if (!sp.enabled || !sp.phrase) return false;
      const targetLower = sp.phrase.toLowerCase().trim();
      return lower.includes(targetLower) || line.includes(sp.phrase.trim());
    });
  };

  const currentLangObj = LANGUAGE_CONFIGS.find((l) => l.code === selectedLanguage) || LANGUAGE_CONFIGS[0];

  const emailConnected = Boolean(backendStatus?.email?.connected);

  return (
    <div 
      className="raksha-card"
      style={{
        padding: '20px 22px'
      }}
    >
      {/* 1. Card Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            className={`status-dot ${isCallActive ? (isDistress ? 'status-dot-danger' : 'status-dot-safe') : ''}`} 
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

      {/* 2. Language Selector & Alert Channel Connectivity Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '12px',
        padding: '8px 12px',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Language Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label 
            htmlFor="speech-lang-select"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              whiteSpace: 'nowrap'
            }}
          >
            Language:
          </label>
          <select
            id="speech-lang-select"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-base)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          >
            <option value="en-US">English (en-US)</option>
            <option value="hi-IN">हिन्दी (Hindi - hi-IN)</option>
            <option value="mr-IN">मराठी (Marathi - mr-IN)</option>
          </select>
        </div>

        {/* Real-time Notification Dispatch Channel Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {/* Email Alert Status */}
          <span 
            title={backendStatus?.email?.detail || 'Email status'}
            style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: emailConnected ? 'rgba(112, 180, 138, 0.15)' : 'rgba(141, 154, 145, 0.12)',
              color: emailConnected ? 'var(--safe-green)' : 'var(--text-secondary)',
              border: `1px solid ${emailConnected ? 'rgba(112, 180, 138, 0.35)' : 'var(--border-subtle)'}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ 
              width: '5px', 
              height: '5px', 
              borderRadius: '50%', 
              backgroundColor: emailConnected ? 'var(--safe-green)' : 'var(--text-muted)' 
            }} />
            Email Alert: {emailConnected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>

      {/* 3. Live Devanagari & English Transcript Output Box */}
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
          lineHeight: '1.7',
          color: 'var(--text-primary)',
          fontFamily: '"Noto Sans Devanagari", "Libre Baskerville", -apple-system, sans-serif',
          transition: 'border-color 0.2s ease',
          boxShadow: isCallActive && interimTranscript ? '0 0 10px rgba(123, 174, 140, 0.15)' : 'none'
        }}
      >
        {!speechSupported ? (
          <div style={{ color: 'var(--warning-amber)', fontStyle: 'italic', paddingTop: '8px' }}>
            ⚠️ Web Speech API is not natively supported in this browser. Please use Google Chrome or Microsoft Edge for Hindi, Marathi, and English live transcription. Acoustic dB surge monitoring remains fully functional.
          </div>
        ) : !isCallActive && !hasContent ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', paddingTop: '8px' }}>
            Select language (<strong style={{ color: 'var(--primary-accent)' }}>{currentLangObj.native}</strong>) and click{' '}
            <strong style={{ color: 'var(--primary-accent)' }}>START MONITORING</strong> to activate speech recognition. Spoken words will appear here instantly in native Devanagari/English script ({currentLangObj.placeholder}).
          </div>
        ) : !hasContent ? (
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot status-dot-safe" style={{ width: '6px', height: '6px' }} />
            Listening for {currentLangObj.label} speech ({currentLangObj.native})... Speak into microphone now.
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
                    padding: matched ? '4px 10px' : '0',
                    backgroundColor: matched ? 'rgba(201, 164, 92, 0.12)' : 'transparent',
                    border: matched ? '1px solid rgba(201, 164, 92, 0.25)' : 'none',
                    borderRadius: 'var(--radius-sm)',
                    wordBreak: 'break-word',
                    fontFamily: '"Noto Sans Devanagari", inherit'
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
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                borderLeft: '3px solid var(--primary-accent)',
                fontStyle: 'normal',
                fontWeight: 500,
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                wordBreak: 'break-word',
                fontFamily: '"Noto Sans Devanagari", inherit'
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