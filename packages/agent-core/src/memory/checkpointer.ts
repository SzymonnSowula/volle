import { Pool } from 'pg';
import { createClient } from 'redis';

export interface CheckpointerConfig {
  pool: Pool;
  channelPattern?: string;
}

export class PostgresCheckpointer {
  private pool: Pool;
  private pubClient: ReturnType<typeof createClient>;
  private subClient: ReturnType<typeof createClient>;
  private channelPattern: string;

  constructor(config: CheckpointerConfig) {
    this.pool = config.pool;
    this.channelPattern = config.channelPattern || 'checkpoints:*';
    this.pubClient = createClient({ url: process.env.REDIS_URL });
    this.subClient = createClient({ url: process.env.REDIS_URL });
  }

  async initialize(): Promise<void> {
    await this.pubClient.connect();
    await this.subClient.connect();
  }

  async saveCheckpoint(
    threadId: string,
    checkpoint: Record<string, unknown>
  ): Promise<void> {
    const key = `checkpoints:${threadId}`;
    await this.pool.query(
      `INSERT INTO checkpoints (thread_id, checkpoint_data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (thread_id)
       DO UPDATE SET checkpoint_data = $2, updated_at = NOW()`,
      [threadId, JSON.stringify(checkpoint)]
    );
    await this.pubClient.publish(this.channelPattern, JSON.stringify({ threadId, checkpoint }));
  }

  async loadCheckpoint(threadId: string): Promise<Record<string, unknown> | null> {
    const result = await this.pool.query(
      'SELECT checkpoint_data FROM checkpoints WHERE thread_id = $1',
      [threadId]
    );
    return result.rows[0]?.checkpoint_data || null;
  }

  async deleteCheckpoint(threadId: string): Promise<void> {
    await this.pool.query('DELETE FROM checkpoints WHERE thread_id = $1', [threadId]);
  }

  async subscribeToCheckpoints(
    callback: (threadId: string, checkpoint: Record<string, unknown>) => void
  ): Promise<void> {
    await this.subClient.pSubscribe(this.channelPattern, (message) => {
      const { threadId, checkpoint } = JSON.parse(message);
      callback(threadId, checkpoint);
    });
  }

  async close(): Promise<void> {
    await this.pubClient.quit();
    await this.subClient.quit();
  }
}
