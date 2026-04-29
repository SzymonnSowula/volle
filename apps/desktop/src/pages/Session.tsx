import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VoiceOrb from '../components/VoiceOrb';
import AgentTimeline from '../components/AgentTimeline';
import SummaryCard from '../components/SummaryCard';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { useSessionState } from '../hooks/useSessionState';

interface TimelineEvent {
  id: string;
  agentName: string;
  eventType: string;
  content: string;
  timestamp: Date;
}

function Session() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [summary, setSummary] = useState<string>('');

  const { isConnected, transcript, sendText } = useVoiceSession(id!);
  const { session, loading } = useSessionState(id!);

  useEffect(() => {
    if (session?.agentHistory) {
      setEvents(
        session.agentHistory.map((entry: any, index: number) => ({
          id: `event-${index}`,
          agentName: entry.agentName,
          eventType: entry.eventType,
          content: entry.content,
          timestamp: new Date(entry.timestamp),
        }))
      );
    }
    if (session?.summary) {
      setSummary(session.summary);
    }
  }, [session]);

  const handleEndSession = async () => {
    try {
      await fetch(`/api/sessions/${id}/complete`, { method: 'POST' });
      navigate('/');
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  if (loading) {
    return (
      <div className="session">
        <div className="loading">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="session">
      <header className="session-header">
        <h2>Session: {id?.slice(0, 8)}...</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.875rem',
              color: isConnected ? '#22c55e' : '#ef4444',
            }}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <button className="back-button" onClick={handleEndSession}>
            End Session
          </button>
          <button className="back-button" onClick={() => navigate('/')}>
            Back
          </button>
        </div>
      </header>

      <div className="session-content">
        <div className="voice-section">
          <VoiceOrb isActive={isConnected} transcript={transcript} />
        </div>

        <div className="agent-timeline">
          <h3 className="timeline-title">Agent Activity</h3>
          <AgentTimeline events={events} />
        </div>

        {summary && <SummaryCard summary={summary} />}
      </div>
    </div>
  );
}

export default Session;
