import { getPool } from '@/lib/db/postgres';
import { getTreasuryBalanceServer, treasuryExists } from '@/lib/solana/server-client';
import { getToolCost } from '@/lib/x402';
import { logger } from '@/lib/utils/logger';

const log = logger('tool-payment');

export class InsufficientBalanceError extends Error {
  constructor(
    public readonly available: number,
    public readonly required: number,
    public readonly toolName: string
  ) {
    super(
      `Insufficient treasury balance for ${toolName}. ` +
        `Available: ${available.toFixed(4)} SOL, ` +
        `Required: ${required.toFixed(4)} SOL. ` +
        `Please fund your agent treasury.`
    );
  }
}

export class TreasuryNotFoundError extends Error {
  constructor() {
    super(
      'Agent treasury not found. Please initialize your treasury in the dashboard and fund it with SOL.'
    );
  }
}

/**
 * Checks if the session owner has sufficient treasury balance to pay for a tool call.
 * Throws if insufficient or if treasury does not exist.
 * Returns the tool cost on success.
 */
export async function requireToolPayment(
  sessionId: string,
  toolName: string
): Promise<number> {
  const pool = getPool();

  const sessionRes = await pool.query(
    'SELECT user_id, actual_cost_sol FROM sessions WHERE id = $1',
    [sessionId]
  );
  const session = sessionRes.rows[0];

  if (!session) {
    throw new Error('Session not found');
  }

  // Anonymous sessions skip enforcement (no wallet = no treasury)
  if (!session.user_id || session.user_id === 'anonymous') {
    log.info(`Session ${sessionId} is anonymous, skipping payment enforcement for ${toolName}`);
    return getToolCost(toolName);
  }

  const toolCost = getToolCost(toolName);

  // Source of truth for already-spent is the tasks table, not session.actual_cost_sol
  const spentRes = await pool.query(
    'SELECT COALESCE(SUM(cost_sol), 0) as total FROM tasks WHERE session_id = $1',
    [sessionId]
  );
  const alreadySpent = parseFloat(spentRes.rows[0]?.total || '0');
  const totalRequired = alreadySpent + toolCost;

  // Check treasury exists
  const hasTreasury = await treasuryExists(session.user_id);
  if (!hasTreasury) {
    log.warn(`Treasury not found for wallet ${session.user_id}`);
    throw new TreasuryNotFoundError();
  }

  // Check on-chain balance
  const treasuryBalance = await getTreasuryBalanceServer(session.user_id);

  if (treasuryBalance < totalRequired) {
    log.warn(
      `Payment rejected for ${toolName} in session ${sessionId}. ` +
        `Balance: ${treasuryBalance.toFixed(4)}, Required: ${totalRequired.toFixed(4)}`
    );
    throw new InsufficientBalanceError(treasuryBalance, totalRequired, toolName);
  }

  log.info(
    `Payment check passed for ${toolName} in session ${sessionId}. ` +
      `Balance: ${treasuryBalance.toFixed(4)}, Will spend: ${toolCost.toFixed(4)}`
  );

  return toolCost;
}
