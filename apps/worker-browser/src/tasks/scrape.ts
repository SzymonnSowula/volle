import { Request, Response } from 'express';
import { taskRunner } from '../runner';

export async function handleScrape(req: Request, res: Response): Promise<void> {
  const { url, selectors, sessionId, requestId } = req.body;
  const startTime = Date.now();

  try {
    if (!url) {
      res.status(400).json({ error: 'url is required' });
      return;
    }

    const result = await taskRunner.executeTask(
      { type: 'scrape', url, selectors },
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
