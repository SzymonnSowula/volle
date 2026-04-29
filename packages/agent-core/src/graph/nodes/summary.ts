import { SessionState, AgentName } from './session.graph';

export async function summaryNode(
  state: SessionState
): Promise<Partial<SessionState>> {
  const agentHistory = [...state.agentHistory];

  agentHistory.push({
    agentName: 'summary',
    eventType: 'started',
    content: 'Generating session summary...',
    timestamp: new Date(),
  });

  const summary = generateSummary(state);

  agentHistory.push({
    agentName: 'summary',
    eventType: 'completed',
    content: `Summary generated: ${summary.substring(0, 50)}...`,
    timestamp: new Date(),
  });

  return {
    agentHistory,
    summary,
    currentAgent: 'summary' as AgentName,
  };
}

function generateSummary(state: SessionState): string {
  const agentNames = state.agentHistory.map((e) => e.agentName);
  const uniqueAgents = [...new Set(agentNames)];
  const toolCount = state.toolResults.size;

  return `Session ${state.sessionId} completed.\n` +
    `User intent: ${state.userIntent}\n` +
    `Agents involved: ${uniqueAgents.join(', ')}\n` +
    `Tools executed: ${toolCount}\n` +
    `Summary: Session was successfully processed through the multi-agent system.`;
}
