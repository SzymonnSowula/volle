import { FastifyInstance } from 'fastify';
import { runSession } from '@solli/agent-core';

export async function agentsRoutes(fastify: FastifyInstance) {
  fastify.post('/trigger', async (request, reply) => {
    const body = request.body as {
      sessionId: string;
      userIntent: string;
    };

    if (!body.sessionId || !body.userIntent) {
      return reply.status(400).send({
        error: 'sessionId and userIntent are required',
      });
    }

    try {
      const result = await runSession(body.sessionId, body.userIntent);

      return {
        success: true,
        result,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Agent execution failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  fastify.post('/approve', async (request, reply) => {
    const body = request.body as {
      sessionId: string;
      approvalId: string;
      approved: boolean;
      notes?: string;
    };

    if (!body.sessionId || !body.approvalId) {
      return reply.status(400).send({
        error: 'sessionId and approvalId are required',
      });
    }

    try {
      const orchestrator = fastify.orchestrator;
      await orchestrator.handleApproval(
        body.sessionId,
        body.approvalId,
        body.approved,
        body.notes
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Approval handling failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  fastify.get('/state/:sessionId', async (request, reply) => {
    const { sessionId } = request.params as { sessionId: string };

    try {
      const orchestrator = fastify.orchestrator;
      const state = await orchestrator.getSessionState(sessionId);

      if (!state) {
        return reply.status(404).send({ error: 'Session state not found' });
      }

      return state;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: 'Failed to get session state',
      });
    }
  });
}
