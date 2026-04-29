import {
  StateGraph,
  START,
  END,
  MemorySaver,
} from '@langchain/langgraph';
import { AgentName } from './types';

export interface SessionState {
  sessionId: string;
  userIntent: string;
  agentHistory: AgentHistoryEntry[];
  toolResults: Map<string, unknown>;
  pendingApprovals: ApprovalRequest[];
  summary: string;
  currentAgent: AgentName;
  requiresApproval: boolean;
  lastError: string | null;
}

export interface AgentHistoryEntry {
  agentName: string;
  eventType: string;
  content: string;
  timestamp: Date;
}

export interface ApprovalRequest {
  id: string;
  agentName: string;
  taskId: string;
  message: string;
  toolName: string;
  args: Record<string, unknown>;
  createdAt: Date;
  status: 'pending' | 'approved' | 'denied';
}

export type IntentClassification =
  | 'RESEARCH'
  | 'INBOX'
  | 'PLANNING'
  | 'APPLICATION'
  | 'GENERAL';

export type RouterOutput = IntentClassification | 'APPROVAL_WAIT' | 'ERROR';

export function routeIntent(state: SessionState): IntentClassification {
  if (state.requiresApproval) return 'GENERAL';
  if (state.lastError) return 'GENERAL';

  const intent = state.userIntent?.toUpperCase() || '';

  if (intent.includes('RESEARCH') || intent.includes('SEARCH') || intent.includes('LOOK UP') || intent.includes('FIND')) {
    return 'RESEARCH';
  }
  if (intent.includes('INBOX') || intent.includes('EMAIL') || intent.includes('GMAIL') || intent.includes('MESSAGE')) {
    return 'INBOX';
  }
  if (intent.includes('PLAN') || intent.includes('SCHEDULE') || intent.includes('CALENDAR') || intent.includes('ORGANIZE')) {
    return 'PLANNING';
  }

  return 'RESEARCH';
}

export async function runSession(
  sessionId: string,
  userIntent: string
): Promise<SessionState> {
  const workflow = new StateGraph<SessionState>({
    channels: {
      sessionId: { value: null, default: () => '' },
      userIntent: { value: null, default: () => '' },
      agentHistory: { value: null, default: () => [] },
      toolResults: { value: null, default: () => new Map() },
      pendingApprovals: { value: null, default: () => [] },
      summary: { value: null, default: () => '' },
      currentAgent: { value: null, default: () => 'coordinator' as AgentName },
      requiresApproval: { value: null, default: () => false },
      lastError: { value: null, default: () => null as string | null },
    },
  });

  workflow.addEdge(START, 'coordinator');
  workflow.addEdge('summary', END);

  const graph = workflow.compile({
    checkpointer: new MemorySaver(),
  });

  const initialState: SessionState = {
    sessionId,
    userIntent,
    agentHistory: [],
    toolResults: new Map(),
    pendingApprovals: [],
    summary: '',
    currentAgent: 'coordinator',
    requiresApproval: false,
    lastError: null,
  };

  const result = await graph.invoke(initialState, {
    configurable: { thread_id: sessionId },
  });

  return result;
}
