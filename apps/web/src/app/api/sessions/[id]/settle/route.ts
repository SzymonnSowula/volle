import { NextRequest, NextResponse } from 'next/server';
import { getSessionById } from '@/lib/db/sessions';
import { getPool } from '@/lib/db/postgres';
import { logger } from '@/lib/utils/logger';

const log = logger('settle-route');

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getSessionById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'completed' && session.status !== 'failed') {
      return NextResponse.json(
        { error: 'Session must be completed or failed before settlement' },
        { status: 409 }
      );
    }

    // Compute actual cost from tasks (source of truth)
    const pool = getPool();
    const costResult = await pool.query(
      'SELECT COALESCE(SUM(cost_sol), 0) as total FROM tasks WHERE session_id = $1',
      [id]
    );
    const actualCost = parseFloat(costResult.rows[0]?.total || '0');

    // Update session with final actual cost
    await pool.query('UPDATE sessions SET actual_cost_sol = $1 WHERE id = $2', [actualCost, id]);

    // Create on-chain execution receipt as proof of settlement
    let onChainTxid: string | undefined;
    try {
      const { BlockchainReceiptService } = await import('@solli/blockchain');
      const receiptService = new BlockchainReceiptService();
      const receipt = await receiptService.createExecutionReceipt({
        sessionId: id,
        agentName: 'settlement',
        inputData: { estimatedCostSol: session.estimated_cost_sol },
        outputData: { actualCostSol: actualCost, status: session.status },
        executionTimeMs: 0,
        costUnits: actualCost,
        createdAt: new Date(),
      });
      onChainTxid = receipt.onChainTxid;
      log.info(`Session ${id} receipt recorded on-chain: ${onChainTxid}`);
    } catch (chainErr) {
      log.error(`Failed to record on-chain receipt for ${id}`, chainErr);
    }

    return NextResponse.json({
      success: true,
      sessionId: id,
      status: session.status,
      actualCostSol: actualCost,
      estimatedCostSol: session.estimated_cost_sol,
      onChainTxid,
      message: `Session settled. Charged ${actualCost.toFixed(4)} SOL.`,
    });
  } catch (error) {
    console.error('[POST /api/sessions/[id]/settle]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
