import { z } from 'zod';

export type ReceiptType = 'execution' | 'payment' | 'refund';
export type ReceiptStatus = 'pending' | 'confirmed' | 'failed';

export interface Receipt {
  id: string;
  sessionId: string;
  receiptType: ReceiptType;
  agentName: string;
  taskId?: string;
  inputHash: string;
  outputHash: string;
  executionTimeMs?: number;
  costUnits?: number;
  signature?: string;
  onChainTxid?: string;
  status: ReceiptStatus;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

export const ReceiptStatusSchema = z.enum(['pending', 'confirmed', 'failed']);
export const ReceiptTypeSchema = z.enum(['execution', 'payment', 'refund']);

export interface ExecutionReceipt {
  sessionId: string;
  agentName: string;
  taskId?: string;
  inputData: Record<string, unknown>;
  outputData: Record<string, unknown>;
  executionTimeMs: number;
  costUnits: number;
  signature: string;
}
