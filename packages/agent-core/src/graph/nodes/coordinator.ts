import { SessionState, IntentClassification } from './session.graph';

const intentKeywords: Record<IntentClassification, string[]> = {
  RESEARCH: ['research', 'search', 'find', 'look up', 'investigate', 'browse'],
  INBOX: ['inbox', 'email', 'gmail', 'message', 'mail', 'send email'],
  PLANNING: ['plan', 'schedule', 'calendar', 'organize', 'meeting', 'event'],
  APPLICATION: ['app', 'application', 'open', 'launch', 'use'],
  GENERAL: ['general', 'help', 'question', 'what', 'how', 'explain'],
};

export async function coordinatorNode(
  state: SessionState
): Promise<Partial<SessionState>> {
  const userIntent = state.userIntent?.toLowerCase() || '';
  const agentHistory = [...state.agentHistory];

  agentHistory.push({
    agentName: 'coordinator',
    eventType: 'thinking',
    content: `Analyzing user intent: "${state.userIntent}"`,
    timestamp: new Date(),
  });

  let classification: IntentClassification = 'GENERAL';
  let maxMatchCount = 0;

  for (const [intent, keywords] of Object.entries(intentKeywords)) {
    const matchCount = keywords.filter((keyword) =>
      userIntent.includes(keyword.toLowerCase())
    ).length;

    if (matchCount > maxMatchCount) {
      maxMatchCount = matchCount;
      classification = intent as IntentClassification;
    }
  }

  agentHistory.push({
    agentName: 'coordinator',
    eventType: 'completed',
    content: `Classified intent as: ${classification}`,
    timestamp: new Date(),
  });

  let requiresApproval = false;
  if (state.pendingApprovals.length > 0) {
    requiresApproval = state.pendingApprovals.some((a) => a.status === 'pending');
  }

  return {
    agentHistory,
    currentAgent: classification.toLowerCase() as SessionState['currentAgent'],
    requiresApproval,
    pendingApprovals: state.pendingApprovals,
  };
}
