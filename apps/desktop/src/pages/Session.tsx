import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoiceOrb from '../components/VoiceOrb';
import AgentTimeline from '../components/AgentTimeline';
import SummaryCard from '../components/SummaryCard';
import { api } from '../lib/api';

interface TimelineEvent {
  id: string;
  agentName: string;
  eventType: string;
  content: string;
  timestamp: Date;
}

interface ResearchResult {
  title: string;
  organization?: string;
  location?: string;
  url?: string;
  reason?: string;
  snippet?: string;
}

function Session() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState('');
  const [sending, setSending] = useState(false);
  const eventsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      try {
        const [sessionData, eventsData] = await Promise.all([
          api.getSession(id!),
          api.getSessionEvents(id!),
        ]);
        if (!isMounted) return;
        setSession(sessionData);
        setEvents(
          eventsData.map((e: any) => ({
            id: e.id,
            agentName: e.agent_name,
            eventType: e.event_type,
            content: e.content,
            timestamp: new Date(e.created_at),
          }))
        );
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load session');
        setLoading(false);
      }
    };

    fetchAll();

    const interval = setInterval(() => {
      fetchAll().catch(() => {});
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const handleEndSession = async () => {
    try {
      await api.completeSession(id!);
      navigate('/');
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleSendFollowUp = async () => {
    if (!followUp.trim()) return;
    setSending(true);

    try {
      await api.sendMessage(id!, followUp.trim());
      setFollowUp('');
      setEvents((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          agentName: 'user',
          eventType: 'message',
          content: followUp.trim(),
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const researchResults: ResearchResult[] = session?.researchResults || session?.metadata?.researchResults || [];
  const isRunning = session?.status === 'running';
  const isCompleted = session?.status === 'completed';

  if (loading) {
    return (
      <div className="session">
        <div className="loading">Loading session...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="session">
        <div className="loading error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="session">
      <header className="session-header">
        <div className="session-header-info">
          <h2>Session {id?.slice(0, 8)}</h2>
          <p className="session-header-input">{session?.input}</p>
        </div>
        <div className="session-header-actions">
          <span className={`status-pill ${isRunning ? 'running' : isCompleted ? 'completed' : ''}`}>
            <span className="status-pill-dot" />
            {isRunning ? 'Running' : isCompleted ? 'Completed' : session?.status}
          </span>
          <button className="btn btn-ghost" onClick={handleEndSession}>
            End
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            Back
          </button>
        </div>
      </header>

      <div className="session-content">
        <div className="voice-section">
          <VoiceOrb sessionId={id} />
        </div>

        <div className="agent-timeline">
          <div className="timeline-title">Agent Activity</div>
          <AgentTimeline events={events} />
          <div ref={eventsEndRef} />
        </div>

        {!isCompleted && (
          <div className="follow-up-container">
            <input
              type="text"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendFollowUp()}
              placeholder="Type a follow-up or ask a question..."
              disabled={sending}
              className="follow-up-input"
            />
            <button
              className="btn btn-primary"
              onClick={handleSendFollowUp}
              disabled={sending || !followUp.trim()}
              style={{ padding: '0.5rem 1.25rem' }}
            >
              {sending ? '...' : '→'}
            </button>
          </div>
        )}

        {researchResults.length > 0 && (
          <div className="research-results">
            <div className="timeline-title">Results</div>
            <div className="results-list">
              {researchResults.map((result, index) => (
                <div key={index} className="result-card">
                  <div className="result-header">
                    <h4 className="result-title">{result.title}</h4>
                    <span className="result-number">#{index + 1}</span>
                  </div>
                  <div className="result-tags">
                    {result.organization && <span className="result-tag">{result.organization}</span>}
                    {result.location && <span className="result-tag">{result.location}</span>}
                  </div>
                  {result.reason && <p className="result-reason">{result.reason}</p>}
                  {result.snippet && !result.reason && <p className="result-snippet">{result.snippet}</p>}
                  {result.url && (
                    <a href={result.url} target="_blank" rel="noopener noreferrer" className="result-link">
                      View source →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {session?.summary && <SummaryCard summary={session.summary} />}
      </div>
    </div>
  );
}

export default Session;
