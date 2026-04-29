import React, { useEffect, useRef } from 'react';

interface VoiceOrbProps {
  isActive: boolean;
  transcript?: string;
}

function VoiceOrb({ isActive, transcript }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = Math.min(width, height) / 3;

      ctx.clearRect(0, 0, width, height);

      const colors = ['#6366f1', '#a855f7', '#8b5cf6'];
      const layers = 3;

      for (let i = 0; i < layers; i++) {
        const offset = (i / layers) * Math.PI * 2;
        const radius = baseRadius + Math.sin(phase + offset) * 10;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3 + (i / layers) * 0.4;
        ctx.stroke();
      }

      if (isActive) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.globalAlpha = 0.5 + Math.sin(phase * 2) * 0.3;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      phase += 0.05;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isActive]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          style={{
            display: 'block',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #1a1a1a 0%, #0f0f0f 100%)',
            boxShadow: isActive
              ? '0 0 40px rgba(99, 102, 241, 0.4)'
              : '0 0 20px rgba(0, 0, 0, 0.3)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              marginBottom: '0.25rem',
            }}
          >
            {isActive ? '🎤' : '🔇'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1a1' }}>
            {isActive ? 'Listening...' : 'Idle'}
          </div>
        </div>
      </div>

      {transcript && (
        <div
          style={{
            maxWidth: '400px',
            padding: '1rem',
            background: '#1a1a1a',
            borderRadius: '0.75rem',
            border: '1px solid #333',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: '#a1a1a1',
          }}
        >
          {transcript}
        </div>
      )}
    </div>
  );
}

export default VoiceOrb;
