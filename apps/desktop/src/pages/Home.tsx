import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

function Home() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleStartSession = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const response = await api.createSessionWithInput(input.trim());
      const { sessionId } = response;
      await api.runSession(sessionId);
      navigate(`/session/${sessionId}`);
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Failed to start session. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    'Find me 3 AI internship opportunities in Poland',
    'Research remote React developer jobs',
    'Find top AI conferences in Europe 2025',
    'Check my unread emails from today',
    'Schedule a meeting with the team tomorrow at 2pm',
  ];

  return (
    <div className="home">
      <div className="home-hero">
        <div className="home-badge">
          <span className="home-badge-dot" />
          Voice-Native Session Operator
        </div>

        <h1>What would you like<br />to accomplish?</h1>
        <p className="home-subtitle">
          Start a session and let Solli research, organize, and execute — all through natural conversation.
        </p>

        <div className="home-input-container">
          <div className="home-input-glow" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Find me AI internships in Poland..."
            rows={3}
            className="home-textarea"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleStartSession();
              }
            }}
          />
          <div className="home-input-actions">
            <div className="home-samples">
              {sampleQueries.slice(0, 3).map((q) => (
                <button key={q} onClick={() => setInput(q)} className="sample-chip">
                  {q}
                </button>
              ))}
            </div>
            <button
              className="btn btn-primary"
              onClick={handleStartSession}
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  Starting...
                </>
              ) : (
                <>
                  Start Session →
                </>
              )}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem', color: 'var(--color-text-dim)', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>🔍</span> Research
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>📧</span> Inbox
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1rem' }}>📅</span> Planning
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
