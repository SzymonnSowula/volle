interface TimelineEvent {
  id: string;
  agentName: string;
  eventType: string;
  content: string;
  timestamp: Date;
}

interface AgentTimelineProps {
  events: TimelineEvent[];
}

function AgentTimeline({ events }: AgentTimelineProps) {
  const getEventIcon = (eventType: string): string => {
    switch (eventType) {
      case 'started': return '▶';
      case 'thinking': return '◉';
      case 'tool_call': return '🔧';
      case 'tool_result': return '✓';
      case 'completed': return '✓';
      case 'failed': return '✕';
      case 'approval_required': return '◉';
      case 'message': return '◉';
      default: return '●';
    }
  }

  const getEventClass = (eventType: string): string => {
    switch (eventType) {
      case 'started': return 'started';
      case 'thinking': return 'thinking';
      case 'tool_call': return 'tool_call';
      case 'tool_result': return 'tool_result';
      case 'completed': return 'completed';
      case 'failed': return 'failed';
      case 'approval_required': return 'approval_required';
      case 'message': return 'message';
      default: return 'started';
    }
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  const formatAgentName = (name: string): string => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  if (events.length === 0) {
    return (
      <div className="glass-card" style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}>◉</div>
        Waiting for agent activity...
      </div>
    );
  }

  return (
    <div className="timeline-events">
      {events.map((event) => (
        <div
          key={event.id}
          className={`timeline-event ${event.agentName === 'user' ? 'user' : ''}`}
        >
          <div
            className={`timeline-event-icon ${getEventClass(event.eventType)}`}
            title={event.eventType}
          >
            {getEventIcon(event.eventType)}
          </div>
          <div className="timeline-event-content">
            <strong>{formatAgentName(event.agentName)}</strong>
            <p>{event.content}</p>
          </div>
          <div className="timeline-event-time">{formatTime(event.timestamp)}</div>
        </div>
      ))}
    </div>
  );
}

export default AgentTimeline;
