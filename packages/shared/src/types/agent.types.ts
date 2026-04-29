import { z } from 'zod';

export type AgentName =
  | 'coordinator'
  | 'research'
  | 'inbox'
  | 'planning'
  | 'summary';

export type AgentEventType =
  | 'started'
  | 'thinking'
  | 'tool_call'
  | 'tool_result'
  | 'completed'
  | 'failed'
  | 'requires_approval';

export interface AgentResult {
  result: unknown;
  nextAction: 'continue' | 'done' | 'error';
  requiresApproval: boolean;
  approvalMessage?: string;
}

export interface AgentEvent {
  id: string;
  sessionId: string;
  agentName: AgentName;
  eventType: AgentEventType;
  stepName?: string;
  inputPayload: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

export interface AgentContext {
  sessionId: string;
  userIntent: string;
  conversationHistory: Array<{
    role: 'user' | 'agent' | 'system';
    content: string;
    timestamp: Date;
  }>;
  toolResults: Map<string, unknown>;
  pendingApprovals: ApprovalRequest[];
}

export interface ApprovalRequest {
  id: string;
  agentName: AgentName;
  taskId: string;
  message: string;
  toolName: string;
  args: Record<string, unknown>;
  createdAt: Date;
  status: 'pending' | 'approved' | 'denied';
}

export const AgentNameSchema = z.enum([
  'coordinator',
  'research',
  'inbox',
  'planning',
  'summary',
]);

export const AgentEventTypeSchema = z.enum([
  'started',
  'thinking',
  'tool_call',
  'tool_result',
  'completed',
  'failed',
  'requires_approval',
]);
