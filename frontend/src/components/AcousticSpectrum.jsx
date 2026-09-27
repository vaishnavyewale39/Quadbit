import React, { useRef, useEffect } from 'react';

const AcousticSpectrum = ({ analyserNode, isDistress, isCallActive }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const dataArray = analyserNode 
      ? new Uint8Array(analyserNode.frequencyBinCount) 
      : new Uint8Array(64);

    let phase = 0;

    const render = () => {
      animationId = requestAnimationFrame(render);
      phase += 0.05;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw faint background grid lines inside canvas
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let y = 10; y < height; y += 15) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      const numBars = 48;
      const barWidth = Math.max(2, (width / numBars) - 2);

      if (analyserNode && isCallActive) {
        analyserNode.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < numBars; i++) {
        let val = 0;
        if (analyserNode && isCallActive) {
          // Map to frequency range
          const binIndex = Math.floor((i / numBars) * (dataArray.length / 2));
          val = dataArray[binIndex] || 0;
        } else {
          // Subtle idle ambient baseline
          const wave1 = Math.sin(phase + i * 0.25) * 8;
          const wave2 = Math.cos(phase * 0.7 + i * 0.15) * 6;
          val = Math.max(3, 12 + wave1 + wave2 + (Math.random() * 4));
        }

        const barHeight = Math.max(2, (val / 255) * (height - 6));
        const x = i * (barWidth + 2) + 2;
        const y = height - barHeight;

        // Gradient
        const grad = ctx.createLinearGradient(0, y, 0, height);
        if (isDistress) {
          grad.addColorStop(0, '#ff1a53');
          grad.addColorStop(1, 'rgba(160, 0, 40, 0.2)');
        } else {
          grad.addColorStop(0, '#00f0ff');
          grad.addColorStop(0.7, '#0088cc');
          grad.addColorStop(1, 'rgba(0, 50, 100, 0.15)');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Cap highlight
        ctx.fillStyle = isDistress ? '#ff85a0' : '#88f7ff';
        ctx.fillRect(x, y, barWidth, 1.5);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyserNode, isDistress, isCallActive]);

  return (
    <div 
      className="cyber-card"
      style={{
        padding: '16px 20px',
        borderRadius: '2px',
        border: '1px solid rgba(0, 240, 255, 0.22)'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '12px',
          color: '#00f0ff',
          letterSpacing: '1px',
          fontWeight: 600
        }}>
          ACOUSTIC SPECTRUM
        </span>
        <span style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '11px',
          color: '#4ae3ff',
          opacity: 0.8
        }}>
          FFT 64 Ch
        </span>
      </div>

      <div style={{
        width: '100%',
        height: '110px',
        backgroundColor: 'rgba(2, 6, 12, 0.85)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '2px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <canvas 
          ref={canvasRef} 
          width={320} 
          height={110} 
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
};

export default AcousticSpectrum;
