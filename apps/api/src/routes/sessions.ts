import { FastifyInstance } from 'fastify';

export async function sessionsRoutes(fastify: FastifyInstance) {
  fastify.post('/', async (request, reply) => {
    const body = request.body as { userId?: string; metadata?: Record<string, unknown> };

    if (!body.userId) {
      return reply.status(400).send({ error: 'userId is required' });
    }

    const sessionId = crypto.randomUUID();

    const db = fastify.db;
    await db.query(
      `INSERT INTO sessions (id, user_id, status, started_at, metadata)
       VALUES ($1, $2, $3, NOW(), $4)`,
      [sessionId, body.userId, 'active', JSON.stringify(body.metadata || {})]
    );

    return reply.status(201).send({
      id: sessionId,
      userId: body.userId,
      status: 'active',
      startedAt: new Date().toISOString(),
    });
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const db = fastify.db;
    const session = await db.queryOne(
      'SELECT * FROM sessions WHERE id = $1',
      [id]
    );

    if (!session) {
      return reply.status(404).send({ error: 'Session not found' });
    }

    return session;
  });

  fastify.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (body.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(body.status);
    }

    if (body.intentClassification !== undefined) {
      updates.push(`intent_classification = $${paramIndex++}`);
      values.push(body.intentClassification);
    }

    if (body.metadata !== undefined) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(body.metadata));
    }

    if (updates.length === 0) {
      return reply.status(400).send({ error: 'No updates provided' });
    }

    values.push(id);

    const db = fastify.db;
    await db.query(
      `UPDATE sessions SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    const session = await db.queryOne(
      'SELECT * FROM sessions WHERE id = $1',
      [id]
    );

    return session;
  });

  fastify.get('/:id/events', async (request, reply) => {
    const { id } = request.params as { id: string };

    const db = fastify.db;
    const events = await db.query(
      'SELECT * FROM agent_events WHERE session_id = $1 ORDER BY created_at ASC',
      [id]
    );

    return events;
  });

  fastify.post('/:id/complete', async (request, reply) => {
    const { id } = request.params as { id: string };

    const db = fastify.db;
    await db.query(
      `UPDATE sessions SET status = 'completed', ended_at = NOW() WHERE id = $1`,
      [id]
    );

    const session = await db.queryOne(
      'SELECT * FROM sessions WHERE id = $1',
      [id]
    );

    return session;
  });
}
