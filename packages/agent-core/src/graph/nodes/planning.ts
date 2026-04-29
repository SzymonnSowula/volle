import { SessionState, AgentName } from './session.graph';

export async function planningNode(
  state: SessionState
): Promise<Partial<SessionState>> {
  const agentHistory = [...state.agentHistory];

  agentHistory.push({
    agentName: 'planning',
    eventType: 'started',
    content: `Starting planning agent for: "${state.userIntent}"`,
    timestamp: new Date(),
  });

  agentHistory.push({
    agentName: 'planning',
    eventType: 'thinking',
    content: 'Processing planning request...',
    timestamp: new Date(),
  });

  const toolResults = new Map(state.toolResults);
  toolResults.set('planning_' + Date.now(), {
    action: 'calendar_planning',
    status: 'completed',
    timestamp: new Date(),
  });

  agentHistory.push({
    agentName: 'planning',
    eventType: 'completed',
    content: 'Planning completed successfully',
    timestamp: new Date(),
  });

  return {
    agentHistory,
    toolResults,
    currentAgent: 'summary' as AgentName,
    requiresApproval: false,
  };
}
