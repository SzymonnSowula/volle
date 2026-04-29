import { SessionState, AgentName } from './session.graph';

export async function inboxNode(
  state: SessionState
): Promise<Partial<SessionState>> {
  const agentHistory = [...state.agentHistory];

  agentHistory.push({
    agentName: 'inbox',
    eventType: 'started',
    content: `Starting inbox agent for: "${state.userIntent}"`,
    timestamp: new Date(),
  });

  agentHistory.push({
    agentName: 'inbox',
    eventType: 'thinking',
    content: 'Processing inbox request...',
    timestamp: new Date(),
  });

  const toolResults = new Map(state.toolResults);
  toolResults.set('inbox_' + Date.now(), {
    action: 'email_processing',
    status: 'completed',
    timestamp: new Date(),
  });

  agentHistory.push({
    agentName: 'inbox',
    eventType: 'completed',
    content: 'Inbox processing completed',
    timestamp: new Date(),
  });

  return {
    agentHistory,
    toolResults,
    currentAgent: 'summary' as AgentName,
    requiresApproval: false,
  };
}
