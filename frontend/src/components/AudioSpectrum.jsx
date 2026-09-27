import React, { useRef, useEffect } from 'react';

const AudioSpectrum = ({ analyserNode, isDistress, isCallActive }) => {
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
      phase += 0.03;

      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const numBars = 36;
      const spacing = 3;
      const barWidth = Math.max(3, (width - (numBars - 1) * spacing) / numBars);

      if (analyserNode && isCallActive) {
        analyserNode.getByteFrequencyData(dataArray);
      }

      for (let i = 0; i < numBars; i++) {
        let val = 0;
        if (analyserNode && isCallActive) {
          const binIndex = Math.floor((i / numBars) * (dataArray.length / 2));
          val = dataArray[binIndex] || 0;
        } else {
          // Soft idle harmonic oscillation using Palette 2 idle floor
          const wave1 = Math.sin(phase + i * 0.22) * 6;
          const wave2 = Math.cos(phase * 0.7 + i * 0.18) * 4;
          val = Math.max(4, 12 + wave1 + wave2);
        }

        const barHeight = Math.max(3, (val / 255) * (height - 8));
        const x = i * (barWidth + spacing);
        const y = height - barHeight;

        // Palette 2 Gradients
        const grad = ctx.createLinearGradient(0, y, 0, height);
        if (isDistress) {
          // Alert: #C95C5C
          grad.addColorStop(0, '#C95C5C');
          grad.addColorStop(1, 'rgba(201, 92, 92, 0.2)');
        } else if (!isCallActive) {
          // Idle bars: #2A3730
          grad.addColorStop(0, 'rgba(123, 174, 140, 0.35)');
          grad.addColorStop(1, '#2A3730');
        } else {
          // Active: Primary #7BAE8C with brighter peaks #93C6A3
          if (barHeight > height * 0.6) {
            grad.addColorStop(0, '#93C6A3');
            grad.addColorStop(0.3, '#7BAE8C');
            grad.addColorStop(1, 'rgba(123, 174, 140, 0.2)');
          } else {
            grad.addColorStop(0, '#7BAE8C');
            grad.addColorStop(1, 'rgba(123, 174, 140, 0.2)');
          }
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyserNode, isDistress, isCallActive]);

  return (
    <div 
      className="raksha-card"
      style={{
        padding: '20px 22px'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px'
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '1px',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase'
        }}>
          AUDIO SPECTRUM
        </span>

        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: isCallActive ? 'var(--primary-accent)' : 'var(--text-secondary)'
        }}>
          {isCallActive ? 'Live Analysis' : 'Idle'}
        </span>
      </div>

      <div style={{
        width: '100%',
        height: '92px',
        backgroundColor: 'var(--bg-base)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <canvas 
          ref={canvasRef} 
          width={280} 
          height={80} 
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
};

export default AudioSpectrum;