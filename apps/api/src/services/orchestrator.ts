export interface SessionState {
  sessionId: string;
  userIntent: string;
  agentHistory: Array<{
    agentName: string;
    eventType: string;
    content: string;
    timestamp: Date;
  }>;
  toolResults: Map<string, unknown>;
  pendingApprovals: Array<{
    id: string;
    agentName: string;
    taskId: string;
    message: string;
    toolName: string;
    args: Record<string, unknown>;
    createdAt: Date;
    status: 'pending' | 'approved' | 'denied';
  }>;
  summary: string;
  currentAgent: string;
  requiresApproval: boolean;
  lastError: string | null;
}

export class OrchestratorService {
  private sessionStates: Map<string, SessionState> = new Map();

  async runSession(sessionId: string, userIntent: string): Promise<SessionState> {
    const state: SessionState = {
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

    this.sessionStates.set(sessionId, state);
    return state;
  }

  async handleApproval(
    sessionId: string,
    approvalId: string,
    approved: boolean,
    _notes?: string
  ): Promise<void> {
    const state = this.sessionStates.get(sessionId);
    if (!state) throw new Error('Session not found');

    const updatedApprovals = state.pendingApprovals.map((a) => {
      if (a.id === approvalId) {
        return { ...a, status: approved ? 'approved' as const : 'denied' as const };
      }
      return a;
    });

    state.pendingApprovals = updatedApprovals.filter((a) => a.status === 'pending');
  }

  async getSessionState(sessionId: string): Promise<SessionState | null> {
    return this.sessionStates.get(sessionId) || null;
  }

  async cancelSession(sessionId: string): Promise<void> {
    this.sessionStates.delete(sessionId);
  }
}

export const orchestratorService = new OrchestratorService();
