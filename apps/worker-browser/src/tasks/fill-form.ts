import { Request, Response } from 'express';
import { taskRunner } from '../runner';

export async function handleFillForm(req: Request, res: Response): Promise<void> {
  const { url, formData, submit, sessionId, requestId } = req.body;
  const startTime = Date.now();

  try {
    if (!url) {
      res.status(400).json({ error: 'url is required' });
      return;
    }

    if (!formData || typeof formData !== 'object') {
      res.status(400).json({ error: 'formData is required and must be an object' });
      return;
    }

    const result = await taskRunner.executeTask(
      { type: 'fill_form', url, formData, submit },
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
