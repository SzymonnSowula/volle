import { FastifyInstance } from 'fastify';

export class ReceiptService {
  async createReceipt(
    data: {
      sessionId: string;
      agentName: string;
      taskId?: string;
      inputHash: string;
      outputHash: string;
      executionTimeMs: number;
      costUnits: number;
    }
  ): Promise<{ id: string; success: boolean }> {
    const id = crypto.randomUUID();
    console.log('Receipt created:', { id, ...data });
    return { id, success: true };
  }

  async getReceiptById(_id: string): Promise<unknown> {
    return null;
  }

  async getReceiptsBySession(_sessionId: string): Promise<unknown[]> {
    return [];
  }

  async confirmReceipt(
    id: string,
    onChainTxid: string,
    signature: string
  ): Promise<void> {
    console.log('Receipt confirmed:', { id, onChainTxid, signature });
  }

  async getStats(): Promise<{
    totalReceipts: number;
    pendingReceipts: number;
    confirmedReceipts: number;
  }> {
    return {
      totalReceipts: 0,
      pendingReceipts: 0,
      confirmedReceipts: 0,
    };
  }
}

export const receiptService = new ReceiptService();
