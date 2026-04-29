import { Request, Response } from 'express';
import { taskRunner } from '../runner';

export async function handleSearch(req: Request, res: Response): Promise<void> {
  const { query, limit = 10, sessionId, requestId } = req.body;
  const startTime = Date.now();

  try {
    if (!query) {
      res.status(400).json({ error: 'query is required' });
      return;
    }

    const result = await taskRunner.executeTask(
      { type: 'search', query, limit },
      sessionId
    );

    res.json({
      success: true,
      data: result,
      executionTimeMs: Date.now() - startTime,
      requestId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: Date.now() - startTime,
    });
  }
}
