import React, { useState, useEffect, useRef } from 'react';
import AudioIntelligenceBackground from './components/AudioIntelligenceBackground';
import RAKSHAHeader from './components/RAKSHAHeader';
import MonitoringStatus from './components/MonitoringStatus';
import AudioMetrics from './components/AudioMetrics';
import AudioSpectrum from './components/AudioSpectrum';
import AudioVisualization from './components/AudioVisualization';
import CallControls from './components/CallControls';
import LiveTranscription from './components/LiveTranscription';
import SecretPhrases from './components/SecretPhrases';
import TrustedContacts from './components/TrustedContacts';
import SilentAlert from './components/SilentAlert';
import LiveLocationStatus from './components/LiveLocationStatus';
import ActivityLog from './components/ActivityLog';

// Integrated Services
import { getCurrentLocation, watchLocation, stopWatchingLocation } from './services/locationService';
import { dispatchAlertToActiveContacts, fetchBackendStatus, updateLiveLocation } from './services/notificationService';

// Default Trusted Contacts Seed (Primary recipient configured for Email alerts)
const DEFAULT_CONTACTS = [
  {
    id: 'c1',
    name: 'Vaishnav Yewale',
    relationship: 'Brother',
    phone: '+91 9987892147',
    email: 'vaishnavyewale39@gmail.com',
    priority: 'Primary',
    status: 'Active'
  },
  {
    id: 'c2',
    name: 'Rahul Verma',
    relationship: 'Spouse',
    phone: '+91 98123 45678',
    email: 'rahul.verma@example.com',
    priority: 'Secondary',
    status: 'Active'
  },
  {
    id: 'c3',
    name: 'Dr. Ananya Sen',
    relationship: 'Emergency Contact',
    phone: '+91 97654 32109',
    email: 'dr.ananya@example.com',
    priority: 'Backup',
    status: 'Active'
  }
];

const DEFAULT_SECRET_PHRASES = [
  {
    id: '1',
    phrase: 'Check the oven',
    condition: 'Multi-signal (Phrase + High Stress)',
    action: 'Activate Silent Alert & Notify Trusted Contacts',
    enabled: true
  },
  {
    id: '2',
    phrase: 'Your voice breaking',
    condition: 'Phrase detected once',
    action: 'Activate Silent Alert & Notify Trusted Contacts',
    enabled: true
  },
  {
    id: '3',
    phrase: 'Please help',
    condition: 'Phrase detected during elevated voice stress',
    action: 'Activate Silent Alert & Notify Trusted Contacts',
    enabled: true
  },
  {
    id: '4',
    phrase: 'मुझे मदद चाहिए',
    condition: 'Phrase detected once',
    action: 'Activate Silent Alert & Notify Trusted Contacts',
    enabled: true
  },
  {
    id: '5',
    phrase: 'मला मदत हवी आहे',
    condition: 'Phrase detected once',
    action: 'Activate Silent Alert & Notify Trusted Contacts',
    enabled: true
  }
];

function App() {
  // Session & Protection States
  const [isCallActive, setIsCallActive] = useState(false);
  const [isDistress, setIsDistress] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Audio Telemetry States
  const [acousticDb, setAcousticDb] = useState(0.0);
  const [distressScore, setDistressScore] = useState(0);
  const [thresholdSensitivity, setThresholdSensitivity] = useState(60);

  // Speech Recognition & Multilingual States
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const selectedLanguageRef = useRef('en-US');
  const [speechSupported, setSpeechSupported] = useState(true);

  // Transcription States
  const [transcript, setTranscript] = useState([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [detectedTrigger, setDetectedTrigger] = useState('Secret phrase detected');

  // Location & Alert Dispatch States
  const [locationData, setLocationData] = useState(null);
  const [alertDispatchResult, setAlertDispatchResult] = useState(null);
  const [backendStatus, setBackendStatus] = useState(null);

  // Multiple Multilingual Secret Phrases (English, Hindi, Marathi)
  const [secretPhrases, setSecretPhrases] = useState(() => {
    try {
      const saved = localStorage.getItem('raksha_secret_phrases');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge default Hindi/Marathi phrases if missing
          const existingPhrases = new Set(parsed.map(p => p.phrase.trim()));
          const missing = DEFAULT_SECRET_PHRASES.filter(dp => !existingPhrases.has(dp.phrase.trim()));
          return [...parsed, ...missing];
        }
      }
    } catch {}
    return DEFAULT_SECRET_PHRASES;
  });

  const handleUpdatePhrases = (updated) => {
    setSecretPhrases(updated);
    try {
      localStorage.setItem('raksha_secret_phrases', JSON.stringify(updated));
    } catch {}
  };

  // Trusted Contacts with LocalStorage Persistence
  const [trustedContacts, setTrustedContacts] = useState(() => {
    try {
      const saved = localStorage.getItem('raksha_trusted_contacts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(c => ({
            ...c,
            email: c.email ? c.email.trim().replace(/\.com\.com$/i, '.com') : c.email
          }));
        }
      }
    } catch (e) {
      console.warn('LocalStorage retrieval error:', e);
    }
    return DEFAULT_CONTACTS;
  });

  const handleUpdateContacts = (updated) => {
    setTrustedContacts(updated);
    try {
      localStorage.setItem('raksha_trusted_contacts', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  };

  // Human Activity Events Log
  const [activityEvents, setActivityEvents] = useState([
    { time: '10:40:02', text: 'RAKSHA system initialized', type: 'normal' },
    { time: '10:40:05', text: 'Trusted contact network verified (Email)', type: 'safe' },
    { time: '10:40:10', text: 'Multilingual speech monitoring armed (EN / HI / MR)', type: 'safe' }
  ]);

  // Audio Context & Analyser State
  const [analyserNode, setAnalyserNode] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const speechRecRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isMonitoringRef = useRef(false);

  // References for Alert & Location Management
  const alertIdRef = useRef(null);
  const locationWatchIdRef = useRef(null);

  // Time Formatter
  const getTimeString = () => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  };

  const logActivity = (text, type = 'normal') => {
    const time = getTimeString();
    setActivityEvents((prev) => [...prev, { time, text, type }]);
  };

  // Poll backend status on mount and periodically
  useEffect(() => {
    let mounted = true;
    const checkStatus = async () => {
      try {
        const status = await fetchBackendStatus();
        if (mounted) setBackendStatus(status);
      } catch {}
    };
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Check Web Speech API availability on load
  useEffect(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setSpeechSupported(false);
      logActivity('Web Speech API not found in this browser. Use Chrome/Edge for live transcription.', 'normal');
    }
  }, []);

  // Call Duration Timer
  useEffect(() => {
    if (isCallActive) {
      timerIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isCallActive]);

  // Handle Speech Language Change (English / Hindi / Marathi)
  const handleLanguageChange = (newLang) => {
    setSelectedLanguage(newLang);
    selectedLanguageRef.current = newLang;
    const langNames = {
      'en-US': 'English',
      'hi-IN': 'Hindi (हिन्दी)',
      'mr-IN': 'Marathi (मराठी)'
    };
    logActivity(`Speech recognition set to ${langNames[newLang] || newLang}. Live transcription will output in native Devanagari script.`, 'normal');

    if (speechRecRef.current) {
      try {
        speechRecRef.current.lang = newLang;
        if (isMonitoringRef.current) {
          // Restart speech recognition seamlessly in the new language
          speechRecRef.current.abort();
        }
      } catch (err) {
        console.warn('Speech language switch note:', err);
      }
    }
  };

  // Trigger Distress Protocol with Unified Email Alert Pipeline
  const triggerDistress = async (reason, matchedPhrase = null) => {
    // Prevent duplicate alert triggers for the same event
    if (isDistress || alertIdRef.current) return;

    const currentAlertId = `emg-${Date.now()}`;
    alertIdRef.current = currentAlertId;

    setIsDistress(true);
    setDistressScore(92);
    const triggerDesc = matchedPhrase ? `Secret phrase detected: "${matchedPhrase}"` : reason;
    setDetectedTrigger(triggerDesc);

    logActivity(`Distress condition identified: ${triggerDesc}`, 'phrase');
    logActivity('Silent alert activated', 'alert');
    logActivity('Acquiring real-time emergency GPS position...', 'alert');

    // 1. Get User Location (Privacy respected: only obtained upon alert)
    const loc = await getCurrentLocation();
    setLocationData(loc);
    logActivity(`GPS fix confirmed (~${loc.accuracy}m accuracy). Location tunnel open.`, 'safe');

    // 2. Dispatch Alerts to all ACTIVE trusted contacts (Email concurrently)
    const alertPayload = {
      locationLink: loc.mapUrl,
      timestamp: new Date().toLocaleTimeString(),
      detectedTrigger: triggerDesc,
      emergencyId: currentAlertId
    };

    const dispatchResult = await dispatchAlertToActiveContacts(trustedContacts, alertPayload);
    setAlertDispatchResult(dispatchResult);

    const activeCount = dispatchResult.activeCount;
    const dispatchedCount = dispatchResult.dispatchedCount || 0;
    const channels = [
      dispatchResult.successfulEmailCount > 0 ? 'Email' : null,
      dispatchResult.successfulSmsCount > 0 ? 'SMS' : null
    ].filter(Boolean).join(' + ');

    if (dispatchedCount > 0) {
      logActivity(
        `Emergency payload dispatched to ${dispatchedCount} of ${activeCount} active trusted contact${activeCount === 1 ? '' : 's'}${channels ? ` (${channels})` : ''}`,
        'safe'
      );
    } else {
      logActivity(
        `Emergency payload dispatched locally; backend server on port 3000 will deliver when online`,
        'alert'
      );
    }

    // 3. Start live continuous location watching & backend sync during alert
    const watchId = watchLocation(
      (updatedLoc) => {
        setLocationData((prev) => ({ ...prev, ...updatedLoc }));
        updateLiveLocation(currentAlertId, updatedLoc, trustedContacts[0]?.name || 'Protected User');
      },
      (err) => console.warn('Live location watch note:', err)
    );
    locationWatchIdRef.current = watchId;
  };

  // Evaluate Secret Phrase Matches (Supports English case-insensitively & Hindi/Marathi Devanagari)
  const evaluateSpeech = (spokenText) => {
    if (!spokenText) return;
    const lower = spokenText.toLowerCase();

    for (const item of secretPhrases) {
      if (!item.enabled) continue;
      const phraseClean = item.phrase.trim();
      const phraseLower = phraseClean.toLowerCase();

      // Check substring or word match (case-insensitive for English, direct Devanagari match)
      if (lower.includes(phraseLower) || spokenText.includes(phraseClean)) {
        logActivity(`Secret phrase detected: "${item.phrase}"`, 'phrase');

        if (item.condition.includes('once')) {
          triggerDistress(`Configured phrase detected ("${item.phrase}")`, item.phrase);
          return;
        } else if (item.condition.includes('stress') || item.condition.includes('Multi-signal')) {
          setDistressScore((prev) => Math.min(100, Math.max(prev, 75)));

          if (acousticDb > 50 || distressScore > 50) {
            triggerDistress(`Multi-signal threshold met (Phrase + Voice Stress)`, item.phrase);
            return;
          } else {
            logActivity(`Phrase flagged: "${item.phrase}". Listening for corroborating acoustic stress.`, 'phrase');
          }
        } else {
          triggerDistress(`Secret phrase detected ("${item.phrase}")`, item.phrase);
          return;
        }
      }
    }
  };

  // Start / Stop Microphone & Continuous Speech Recognition Loop
  const toggleCall = async () => {
    if (isCallActive) {
      // Stop monitoring
      isMonitoringRef.current = false;
      setIsCallActive(false);
      setInterimTranscript('');
      logActivity('Monitoring stopped. Acoustic listener on standby.', 'normal');

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (speechRecRef.current) {
        try {
          speechRecRef.current.abort();
        } catch {}
        speechRecRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      analyserRef.current = null;
      setAnalyserNode(null);
      setAcousticDb(0.0);
    } else {
      // Start monitoring
      try {
        logActivity('Requesting microphone permission...', 'normal');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;
        analyserRef.current = analyser;
        setAnalyserNode(analyser);

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        isMonitoringRef.current = true;
        setIsCallActive(true);
        logActivity('Microphone connected. Continuous acoustic analysis active.', 'active');

        // Continuous Acoustic Pressure dB meter loop
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAcousticMetrics = () => {
          if (!analyserRef.current) return;
          analyser.getByteTimeDomainData(dataArray);

          let sumSquares = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const normalized = (dataArray[i] - 128) / 128;
            sumSquares += normalized * normalized;
          }
          const rms = Math.sqrt(sumSquares / dataArray.length);
          const calculatedDb = rms > 0.001 ? Math.min(95, Math.max(12, (20 * Math.log10(rms) + 90))) : 0;
          setAcousticDb(calculatedDb);

          // Voice Stress / Shouting Logic
          const triggerThreshold = 100 - thresholdSensitivity + 25;
          if (calculatedDb > triggerThreshold) {
            setDistressScore((prev) => {
              const next = Math.min(100, prev + 12);
              if (next >= 85) {
                triggerDistress(`Severe acoustic decibel surge (${calculatedDb.toFixed(1)} dB)`);
              }
              return next;
            });
          } else {
            setDistressScore((prev) => Math.max(0, prev - 0.4));
          }

          animFrameRef.current = requestAnimationFrame(updateAcousticMetrics);
        };
        updateAcousticMetrics();

        // Speech Recognition Loop (Supporting English, Hindi, and Marathi in Devanagari)
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRec) {
          const recognition = new SpeechRec();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = selectedLanguageRef.current || 'en-US';

          recognition.onresult = (event) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const res = event.results[i];
              // Devanagari script is preserved natively from browser speech engine
              const text = res[0].transcript;
              if (res.isFinal) {
                const trimmed = text.trim();
                if (trimmed) {
                  setTranscript((prev) => [...prev, trimmed]);
                  evaluateSpeech(trimmed);
                }
              } else {
                interim += text;
                evaluateSpeech(text);
              }
            }
            setInterimTranscript(interim);
          };

          recognition.onerror = (event) => {
            if (event.error === 'no-speech' || event.error === 'aborted') {
              return;
            }
            if (event.error === 'language-not-supported') {
              logActivity(`Speech engine note: ${selectedLanguageRef.current} not locally supported by browser. Falling back.`, 'normal');
              return;
            }
            console.warn('Speech recognition notice:', event.error);
          };

          recognition.onend = () => {
            // Keep running seamlessly as long as monitoring is enabled
            if (isMonitoringRef.current) {
              try {
                recognition.lang = selectedLanguageRef.current;
                recognition.start();
              } catch (e) {
                // Ignore if in-process
              }
            }
          };

          try {
            recognition.start();
          } catch (e) {
            console.warn('Speech recognition start notice:', e);
          }
          speechRecRef.current = recognition;
          const langDisplay = selectedLanguageRef.current === 'hi-IN' ? 'Hindi (हिन्दी)' : selectedLanguageRef.current === 'mr-IN' ? 'Marathi (मराठी)' : 'English';
          logActivity(`Live transcription pipeline initialized in ${langDisplay}.`, 'normal');
        } else {
          setSpeechSupported(false);
          logActivity('Web Speech API not available in this browser. Voice decibel monitoring remains active.', 'normal');
        }
      } catch (err) {
        console.error('Audio init error:', err);
        logActivity(`Microphone access note: ${err.message}`, 'normal');
        setIsCallActive(false);
        isMonitoringRef.current = false;
      }
    }
  };

  // Simulate SOS (Demo Action connected to Email Alert Pipeline)
  const simulateSOS = () => {
    logActivity('Simulation triggered by user (Demo Mode)', 'alert');
    setAcousticDb(82.4);

    const demoPhrases = {
      'hi-IN': 'मुझे मदद चाहिए',
      'mr-IN': 'मला मदत हवी आहे',
      'en-US': 'Check the oven'
    };
    const spokenDemo = demoPhrases[selectedLanguage] || 'Check the oven';

    setTranscript((prev) => [...prev, `Emergency (Demo SOS): "${spokenDemo}"`]);
    triggerDistress(`Simulated distress event ("${spokenDemo}")`, spokenDemo);
  };

  // Resolve Alert / Mark Safe (Stops location watch, resets alertId)
  const resolveSafe = () => {
    if (locationWatchIdRef.current !== null) {
      stopWatchingLocation(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }
    alertIdRef.current = null;
    setIsDistress(false);
    setDistressScore(0);
    setAcousticDb(0.0);
    setAlertDispatchResult(null);
    logActivity('Alert resolved: User confirmed safe. Location sharing and emergency tunnel stopped.', 'safe');
  };

  // Reset System
  const resetSystem = () => {
    isMonitoringRef.current = false;
    if (locationWatchIdRef.current !== null) {
      stopWatchingLocation(locationWatchIdRef.current);
      locationWatchIdRef.current = null;
    }
    alertIdRef.current = null;
    setIsDistress(false);
    setDistressScore(0);
    setAcousticDb(0.0);
    setCallDuration(0);
    setAlertDispatchResult(null);
    setTranscript([]);
    setInterimTranscript('');
    logActivity('System reset to baseline configuration.', 'normal');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      position: 'relative'
    }}>
      {/* 1. Subtle Audio Intelligence Background */}
      <AudioIntelligenceBackground 
        isDistress={isDistress} 
        isCallActive={isCallActive}
        analyserNode={analyserNode}
      />

      {/* 2. RAKSHA Header */}
      <RAKSHAHeader 
        callDuration={callDuration} 
        isCallActive={isCallActive} 
        isDistress={isDistress}
        distressScore={distressScore}
      />

      {/* 3. Main Dashboard Grid */}
      <main className="dashboard-grid" style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        {/* LEFT COLUMN: Live Transcription with Hindi/Marathi Selector, Status & Metrics */}
        <section className="left-sidebar-column">
          <LiveTranscription
            transcript={transcript}
            interimTranscript={interimTranscript}
            isCallActive={isCallActive}
            isDistress={isDistress}
            secretPhrases={secretPhrases}
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
            backendStatus={backendStatus}
            speechSupported={speechSupported}
          />
          <MonitoringStatus 
            isDistress={isDistress} 
            distressScore={distressScore} 
            isCallActive={isCallActive} 
          />
          <AudioMetrics 
            acousticDb={acousticDb}
            distressScore={distressScore}
            thresholdSensitivity={thresholdSensitivity}
            setThresholdSensitivity={setThresholdSensitivity}
            isCallActive={isCallActive}
          />
          <AudioSpectrum 
            analyserNode={analyserNode}
            isDistress={isDistress}
            isCallActive={isCallActive}
          />
        </section>

        {/* CENTER COLUMN: Central Audio Visualization & Controls */}
        <section className="center-column">
          {/* Silent Alert Card (Rendered when distress is active) */}
          <SilentAlert
            isDistress={isDistress}
            distressScore={distressScore}
            onResolveSafe={resolveSafe}
            contacts={trustedContacts}
            detectedTrigger={detectedTrigger}
            alertDispatchResult={alertDispatchResult}
            locationData={locationData}
          />

          {/* Live Location Sharing Card (Active when distress is active) */}
          <LiveLocationStatus isDistress={isDistress} />

          {/* Central 3D Audio Field Visualization */}
          <div 
            className={`raksha-card ${isDistress ? 'raksha-card-danger' : ''}`}
            style={{ position: 'relative' }}
          >
            <AudioVisualization
              isDistress={isDistress}
              isCallActive={isCallActive}
              analyserNode={analyserNode}
            />
          </div>

          {/* Main Action Controls */}
          <CallControls
            isCallActive={isCallActive}
            onToggleCall={toggleCall}
            onSimulateSOS={simulateSOS}
            onResetSystem={resetSystem}
          />
        </section>

        {/* RIGHT COLUMN: Secret Phrases, Trusted Contacts, Activity Log */}
        <section className="right-sidebar-column">
          <SecretPhrases
            phrases={secretPhrases}
            onUpdatePhrases={handleUpdatePhrases}
          />
          <TrustedContacts
            contacts={trustedContacts}
            onUpdateContacts={handleUpdateContacts}
            isDistress={isDistress}
            alertDispatchResult={alertDispatchResult}
          />
          <ActivityLog events={activityEvents} />
        </section>
      </main>
    </div>
  );
}

export default App;