import { useEffect, useRef, useState, useCallback } from 'react';

interface VoiceOrbProps {
  sessionId?: string;
}

type VoiceStatus = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';

function VoiceOrb({ sessionId }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<Blob[]>([]);
  const isPlayingRef = useRef(false);

  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Animated orb with WebGL-style gradients
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let phase = 0;
    let particles: Array<{ angle: number; radius: number; speed: number; size: number }> = [];

    // Init particles
    for (let i = 0; i < 12; i++) {
      particles.push({
        angle: (i / 12) * Math.PI * 2,
        radius: 60 + Math.random() * 30,
        speed: 0.005 + Math.random() * 0.01,
        size: 2 + Math.random() * 3,
      });
    }

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const isActive = status === 'listening' || status === 'speaking' || status === 'thinking';

      ctx.clearRect(0, 0, width, height);

      // Outer glow rings
      const rings = 4;
      for (let i = 0; i < rings; i++) {
        const offset = (i / rings) * Math.PI * 2;
        const baseR = 70 + i * 15;
        const pulse = isActive ? Math.sin(phase * 2 + offset) * 8 : Math.sin(phase + offset) * 3;
        const radius = baseR + pulse;

        const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius);
        if (status === 'listening') {
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0)');
          gradient.addColorStop(0.5, `rgba(99, 102, 241, ${0.15 - i * 0.03})`);
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        } else if (status === 'speaking') {
          gradient.addColorStop(0, 'rgba(34, 211, 238, 0)');
          gradient.addColorStop(0.5, `rgba(34, 211, 238, ${0.15 - i * 0.03})`);
          gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(168, 85, 247, 0)');
          gradient.addColorStop(0.5, `rgba(168, 85, 247, ${0.1 - i * 0.02})`);
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        }

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Core orb
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
      if (status === 'listening') {
        coreGradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
        coreGradient.addColorStop(0.6, 'rgba(99, 102, 241, 0.3)');
        coreGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      } else if (status === 'speaking') {
        coreGradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)');
        coreGradient.addColorStop(0.6, 'rgba(34, 211, 238, 0.3)');
        coreGradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
      } else if (status === 'error') {
        coreGradient.addColorStop(0, 'rgba(248, 113, 113, 0.6)');
        coreGradient.addColorStop(0.6, 'rgba(248, 113, 113, 0.2)');
        coreGradient.addColorStop(1, 'rgba(248, 113, 113, 0)');
      } else {
        coreGradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
        coreGradient.addColorStop(0.6, 'rgba(168, 85, 247, 0.15)');
        coreGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, isActive ? 45 + Math.sin(phase * 3) * 5 : 40, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Particles
      if (isActive) {
        particles.forEach((p) => {
          p.angle += p.speed;
          const x = centerX + Math.cos(p.angle) * p.radius;
          const y = centerY + Math.sin(p.angle) * p.radius;

          const pg = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2);
          pg.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          pg.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = pg;
          ctx.fill();
        });
      }

      phase += 0.04;
      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, [status]);

  // Audio playback
  const playNextAudio = useCallback(async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
    isPlayingRef.current = true;

    const blob = audioQueueRef.current.shift()!;
    const arrayBuffer = await blob.arrayBuffer();

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    try {
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        isPlayingRef.current = false;
        playNextAudio();
      };
      source.start();
    } catch {
      isPlayingRef.current = false;
      playNextAudio();
    }
  }, []);

  const connect = useCallback(async () => {
    if (!sessionId) {
      setError('No session ID');
      return;
    }
    setStatus('connecting');
    setError(null);

    const ws = new WebSocket(`ws://localhost:3001/api/voice/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('listening');
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(event.data);
          }
        };
        recorder.start(100);
      }).catch((err) => {
        console.error('Microphone error:', err);
        setError('Microphone access denied');
        setStatus('error');
      });
    };

    ws.onmessage = async (event) => {
      try {
        const text = await event.data.text();
        const message = JSON.parse(text);
        if (message.type === 'user_transcript') {
          setTranscript((prev) => prev + ' ' + (message.user_transcript || ''));
          setStatus('thinking');
        } else if (message.type === 'agent_response') {
          setTranscript((prev) => prev + '\n[Solli]: ' + (message.agent_response || ''));
          setStatus('speaking');
        } else if (message.type === 'connected') {
          setStatus('listening');
        } else if (message.type === 'error') {
          setError(message.message || 'Voice error');
          setStatus('error');
        }
      } catch {
        audioQueueRef.current.push(event.data as Blob);
        playNextAudio();
      }
    };

    ws.onerror = () => {
      setError('WebSocket error');
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus('idle');
      if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    };
  }, [sessionId, playNextAudio]);

  const disconnect = useCallback(() => {
    if (wsRef.current) wsRef.current.close();
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    setStatus('idle');
  }, []);

  const toggle = useCallback(() => {
    if (status === 'idle' || status === 'error') {
      connect();
    } else {
      disconnect();
    }
  }, [status, connect, disconnect]);

  const statusConfig: Record<VoiceStatus, { label: string; icon: string }> = {
    idle: { label: 'Tap to speak', icon: '◉' },
    connecting: { label: 'Connecting...', icon: '◐' },
    listening: { label: 'Listening...', icon: '●' },
    thinking: { label: 'Thinking...', icon: '◉' },
    speaking: { label: 'Speaking...', icon: '◉' },
    error: { label: 'Error', icon: '✕' },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={toggle}>
        {/* Glow effect behind orb */}
        <div style={{
          position: 'absolute',
          inset: '-20px',
          borderRadius: '50%',
          background: status === 'listening'
            ? 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)'
            : status === 'speaking'
            ? 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          filter: 'blur(20px)',
          transition: 'all 0.5s',
        }} />

        <canvas
          ref={canvasRef}
          width={260}
          height={260}
          style={{
            display: 'block',
            borderRadius: '50%',
            position: 'relative',
            zIndex: 1,
          }}
        />

        {/* Center icon */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 2,
        }}>
          <div style={{
            fontSize: '2.5rem',
            fontWeight: 300,
            color: status === 'idle' ? 'var(--color-text-dim)' : 'var(--color-text)',
            textShadow: status === 'listening' ? '0 0 20px rgba(99,102,241,0.8)' : status === 'speaking' ? '0 0 20px rgba(34,211,238,0.8)' : 'none',
            transition: 'all 0.3s',
          }}>
            {statusConfig[status].icon}
          </div>
        </div>
      </div>

      <div style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: status === 'listening' ? 'var(--color-primary-light)' : status === 'speaking' ? 'var(--color-accent)' : 'var(--color-text-muted)',
        textShadow: status === 'listening' || status === 'speaking' ? '0 0 10px currentColor' : 'none',
        transition: 'all 0.3s',
      }}>
        {statusConfig[status].label}
      </div>

      {error && (
        <div className="glass-card" style={{
          maxWidth: '400px',
          padding: '0.75rem 1rem',
          borderColor: 'rgba(248, 113, 113, 0.3)',
          color: 'var(--color-error)',
          fontSize: '0.875rem',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {transcript && (
        <div className="glass-card" style={{
          maxWidth: '480px',
          width: '100%',
          padding: '1rem 1.25rem',
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          maxHeight: '200px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.6,
        }}>
          {transcript}
        </div>
      )}
    </div>
  );
}

export default VoiceOrb;
