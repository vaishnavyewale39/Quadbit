import React, { useRef, useEffect } from 'react';

/**
 * AudioIntelligenceBackground
 * Renders an ambient live audio waveform flowing subtly behind the RAKSHA interface.
 * Palette 2: Primary #7BAE8C, Secondary #93C6A3, Background #2A3730, Alert #C95C5C.
 * Connects to live Web Audio AnalyserNode when active, smoothly idling when standby.
 */
const AudioIntelligenceBackground = ({ isDistress, isCallActive, analyserNode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Audio data buffer
    const dataArray = analyserNode 
      ? new Uint8Array(analyserNode.frequencyBinCount) 
      : new Uint8Array(64);

    // Ambient floating particles/nodes
    const numParticles = 26;
    const particles = Array.from({ length: numParticles }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.2,
      radius: Math.random() * 1.5 + 0.8,
      baseAlpha: Math.random() * 0.12 + 0.06,
      waveOffset: Math.random() * Math.PI * 2
    }));

    const render = () => {
      animationId = requestAnimationFrame(render);
      time += 0.007;

      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      // Real-time audio amplitude factor
      let audioFactor = 0;
      if (analyserNode && isCallActive) {
        analyserNode.getByteTimeDomainData(dataArray);
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const norm = (dataArray[i] - 128) / 128;
          sumSquares += norm * norm;
        }
        audioFactor = Math.min(1.0, Math.sqrt(sumSquares / dataArray.length) * 3.5);
      } else {
        // Idle gentle breathing modulation
        audioFactor = Math.sin(time * 1.2) * 0.04 + 0.06;
      }

      // Colors based on distress state
      // Alert: #C95C5C (201, 92, 92)
      // Normal: Primary #7BAE8C (123, 174, 140), Secondary #93C6A3 (147, 198, 163), Sub: #2A3730 (42, 55, 48)
      const primaryRgb = isDistress ? '201, 92, 92' : '123, 174, 140';
      const secondaryRgb = isDistress ? '220, 110, 110' : '147, 198, 163';
      const baseRgb = isDistress ? '70, 30, 30' : '42, 55, 48';

      // Waveform baseline vertically centered slightly towards lower third
      const centerY = height * 0.58;

      // 1. Very subtle deep background waveform (#2A3730)
      ctx.beginPath();
      ctx.strokeStyle = `rgba(${baseRgb}, ${isDistress ? 0.25 : 0.18})`;
      ctx.lineWidth = 1.2;
      const step = 8;
      for (let x = 0; x <= width; x += step) {
        const nx = x / width;
        const wave = Math.sin(nx * 4 + time * 1.4) * 25 
                   + Math.cos(nx * 2 - time * 0.8) * 15;
        const y = centerY + 40 + wave * (1 + audioFactor * 1.2);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Primary ambient live audio waveform (#7BAE8C)
      ctx.beginPath();
      const primaryAlpha = isDistress ? 0.35 : (0.14 + audioFactor * 0.16);
      ctx.strokeStyle = `rgba(${primaryRgb}, ${primaryAlpha})`;
      ctx.lineWidth = 1.6;
      for (let x = 0; x <= width; x += step) {
        const nx = x / width;
        let audioPerturb = 0;
        if (analyserNode && isCallActive) {
          const bin = Math.floor(nx * (dataArray.length - 1));
          audioPerturb = ((dataArray[bin] - 128) / 128) * 45;
        }
        const wave = Math.sin(nx * 6 + time * 2.2) * 30
                   + Math.sin(nx * 12 + time * 1.5) * 12
                   + audioPerturb;
        const y = centerY + wave * (1 + audioFactor * 1.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 3. Secondary harmonic waveform (#93C6A3) with phase offset
      ctx.beginPath();
      const secAlpha = isDistress ? 0.26 : (0.10 + audioFactor * 0.12);
      ctx.strokeStyle = `rgba(${secondaryRgb}, ${secAlpha})`;
      ctx.lineWidth = 1.2;
      for (let x = 0; x <= width; x += step) {
        const nx = x / width;
        const wave = Math.cos(nx * 5 - time * 1.8) * 22
                   + Math.sin(nx * 9 + time * 2.8) * 10;
        const y = centerY - 25 + wave * (1 + audioFactor * 1.3);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 4. Subtle flowing audio nodes/particles along signal field
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Gentle pulse
        const alpha = p.baseAlpha + Math.sin(time * 2 + p.waveOffset) * 0.04;
        ctx.fillStyle = `rgba(${primaryRgb}, ${Math.max(0.04, alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Connect closely adjacent nodes with very faint hairline thread
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.06;
            ctx.strokeStyle = `rgba(${primaryRgb}, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDistress, isCallActive, analyserNode]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 0,
      overflow: 'hidden'
    }}>
      {/* Subtle radial ambient gradients - Palette 2 (deep graphite atmosphere) */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '20%',
        width: '650px',
        height: '650px',
        borderRadius: '50%',
        background: isDistress 
          ? 'radial-gradient(circle, rgba(201, 92, 92, 0.08) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(123, 174, 140, 0.045) 0%, transparent 70%)',
        filter: 'blur(70px)',
        transition: 'background 0.8s ease'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '-12%',
        right: '15%',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: isDistress 
          ? 'radial-gradient(circle, rgba(201, 92, 92, 0.06) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(42, 55, 48, 0.08) 0%, transparent 70%)',
        filter: 'blur(60px)',
        transition: 'background 0.8s ease'
      }} />

      {/* Waveform Canvas */}
      <canvas 
        ref={canvasRef} 
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block'
        }} 
      />
    </div>
  );
};

export default AudioIntelligenceBackground;