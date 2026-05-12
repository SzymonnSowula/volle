import { z } from 'zod';
import { logger } from '@/lib/utils/logger';
import { getGoogleTokensForSession } from '@/lib/google/tokens';
import { DEMO_MODE, getMockEmails } from '@/lib/demo-mode';

const log = logger('gmail-tool');

export const GmailToolInputSchema = z.object({
  action: z.enum(['read', 'draft', 'send', 'list']),
  messageId: z.string().optional(),
  to: z.string().email().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  threadId: z.string().optional(),
});

export type GmailToolInput = z.infer<typeof GmailToolInputSchema>;

export async function gmailTool(
  input: GmailToolInput,
  sessionId?: string
): Promise<{ success: boolean; message: string; data?: unknown }> {
  const baseUrl = process.env.WORKER_GOOGLE_URL || 'http://localhost:3003';
  log.info(`Gmail action: ${input.action}`);

  // Demo mode — return mock emails without hitting worker or requiring auth
  if (DEMO_MODE) {
    log.info('Demo mode: returning mock gmail data');
    if (input.action === 'list' || input.action === 'read') {
      return { success: true, message: 'Demo inbox (prototype mode)', data: getMockEmails() };
    }
    return { success: true, message: `[Demo] Gmail ${input.action} simulated. Workers not configured in this prototype.` };
  }

  // Payment enforcement
  if (sessionId) {
    const { requireToolPayment } = await import('@/lib/payments/tool-payment');
    await requireToolPayment(sessionId, 'gmail_read');
  }

  // Get Google tokens for this session's user
  let tokens: { accessToken: string; refreshToken: string | null } | null = null;
  if (sessionId) {
    tokens = await getGoogleTokensForSession(sessionId);
  }

  if (!tokens) {
    return {
      success: false,
      message: 'Google account not connected. Please connect your Google account in Settings > Connected Accounts.',
    };
  }

  try {
    const workerSecret = process.env.WORKER_AUTH_SECRET;
    const response = await fetch(`${baseUrl}/gmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(workerSecret ? { 'x-worker-secret': workerSecret } : {}),
      },
      body: JSON.stringify({
        action: input.action,
        messageId: input.messageId,
        to: input.to,
        subject: input.subject,
        body: input.body,
        threadId: input.threadId,
        requestId: crypto.randomUUID(),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google worker error: ${response.status} ${text}`);
    }

    const result = (await response.json()) as { success: boolean; data?: unknown; error?: string };

    if (result.success) {
      return { success: true, message: `Gmail ${input.action} completed`, data: result.data };
    }

    throw new Error(result.error || 'Gmail action failed');
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    log.error('Gmail tool failed', msg);
    return { success: false, message: msg };
  }
}
