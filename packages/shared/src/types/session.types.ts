import { z } from 'zod';

export type IntentClassification =
  | 'RESEARCH'
  | 'INBOX'
  | 'PLANNING'
  | 'APPLICATION'
  | 'GENERAL';

export type SessionStatus = 'active' | 'completed' | 'failed' | 'cancelled';

export interface SessionUser {
  id: string;
  name?: string;
  email?: string;
}

export interface Session {
  id: string;
  userId: string;
  status: SessionStatus;
  intentClassification?: IntentClassification;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface SessionCreateInput {
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface SessionUpdateInput {
  status?: SessionStatus;
  intentClassification?: IntentClassification;
  metadata?: Record<string, unknown>;
}
