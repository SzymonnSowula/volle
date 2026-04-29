import { SessionState, AgentName } from './session.graph';

export async function researchNode(
  state: SessionState
): Promise<Partial<SessionState>> {
  const agentHistory = [...state.agentHistory];

  agentHistory.push({
    agentName: 'research',
    eventType: 'started',
    content: `Starting research agent for: "${state.userIntent}"`,
    timestamp: new Date(),
  });

  agentHistory.push({
    agentName: 'research',
    eventType: 'thinking',
    content: 'Processing research request...',
    timestamp: new Date(),
  });

  const toolResults = new Map(state.toolResults);
  toolResults.set('research_' + Date.now(), {
    query: state.userIntent,
    status: 'completed',
    timestamp: new Date(),
  });

  agentHistory.push({
    agentName: 'research',
    eventType: 'completed',
    content: 'Research completed successfully',
    timestamp: new Date(),
  });

  return {
    agentHistory,
    toolResults,
    currentAgent: 'summary' as AgentName,
    requiresApproval: false,
  };
}
