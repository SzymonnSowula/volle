import type { SessionStore } from '@/lib/db/session-store';
import { gmailTool, type GmailToolInput } from '@/lib/tools/gmail.tool';
import { getToolCost, formatCost } from '@/lib/x402';
import { logger } from '@/lib/utils/logger';

const log = logger('inbox-agent');
const INBOX_READ_COST = getToolCost('gmail_read');
const INBOX_SEND_COST = getToolCost('gmail_send');

export interface InboxEmail {
  id: string;
  subject: string;
  from: string;
  snippet: string;
}

export interface InboxResult {
  emailsProcessed: InboxEmail[];
  actionsTaken: string[];
  draftsCreated: number;
  messagesSent: number;
}

export async function inboxAgent(
  sessionId: string,
  query: string,
  store: SessionStore
): Promise<InboxResult> {
  await store.addEvent({
    sessionId,
    agentName: 'inbox',
    eventType: 'started',
    content: `Starting inbox management for: "${query}"`,
  });

  const result: InboxResult = {
    emailsProcessed: [],
    actionsTaken: [],
    draftsCreated: 0,
    messagesSent: 0,
  };

  try {
    // Step 1: List recent emails
    await store.addTask({
      sessionId,
      agentName: 'inbox',
      toolName: 'gmail_list',
      inputJson: { action: 'list' },
      status: 'running',
    });

    const listRes = await gmailTool({ action: 'list' }, sessionId);

    if (listRes.success && Array.isArray(listRes.data)) {
      result.emailsProcessed = listRes.data.slice(0, 5).map((e: any) => ({
        id: e.id || e.messageId || 'unknown',
        subject: e.subject || 'No subject',
        from: e.from || 'Unknown',
        snippet: e.snippet || e.body?.substring(0, 100) || '',
      }));

      await store.addEvent({
        sessionId,
        agentName: 'inbox',
        eventType: 'tool_result',
        content: `Listed ${result.emailsProcessed.length} emails · Cost: ${formatCost(INBOX_READ_COST)}`,
        metadata: { emails: result.emailsProcessed, costSol: INBOX_READ_COST },
      });

      await store.addTask({
        sessionId,
        agentName: 'inbox',
        toolName: 'gmail_list',
        outputJson: { count: result.emailsProcessed.length },
        status: 'completed',
        costSol: INBOX_READ_COST,
      });

      result.actionsTaken.push(`Listed ${result.emailsProcessed.length} emails`);
    } else {
      throw new Error(listRes.message || 'Failed to list emails');
    }

    // Step 2: If query mentions drafting or sending, create a draft
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('draft') || lowerQuery.includes('reply') || lowerQuery.includes('send')) {
      const draftInput: GmailToolInput = {
        action: 'draft',
        to: 'recipient@example.com', // In production, this would be extracted from context
        subject: 'Re: ' + (result.emailsProcessed[0]?.subject || 'Follow-up'),
        body: `Hi,\n\nFollowing up on our conversation.\n\nBest regards,`,
      };

      await store.addTask({
        sessionId,
        agentName: 'inbox',
        toolName: 'gmail_draft',
        inputJson: draftInput,
        status: 'running',
      });

      const draftRes = await gmailTool(draftInput, sessionId);

      if (draftRes.success) {
        result.draftsCreated += 1;
        result.actionsTaken.push('Created draft reply');

        await store.addEvent({
          sessionId,
          agentName: 'inbox',
          eventType: 'tool_result',
          content: `Draft created · Cost: ${formatCost(INBOX_SEND_COST)}`,
          metadata: { draft: draftRes.data, costSol: INBOX_SEND_COST },
        });

        await store.addTask({
          sessionId,
          agentName: 'inbox',
          toolName: 'gmail_draft',
          outputJson: draftRes.data as Record<string, unknown>,
          status: 'completed',
          costSol: INBOX_SEND_COST,
        });
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    log.error('Inbox agent failed', msg);

    await store.addEvent({
      sessionId,
      agentName: 'inbox',
      eventType: 'failed',
      content: `Inbox management failed: ${msg}`,
    });

    await store.addTask({
      sessionId,
      agentName: 'inbox',
      toolName: 'gmail_list',
      status: 'failed',
      errorMessage: msg,
      costSol: INBOX_READ_COST,
    });
  }

  await store.addEvent({
    sessionId,
    agentName: 'inbox',
    eventType: 'completed',
    content: `Inbox management completed. ${result.actionsTaken.join('. ')}`,
  });

  return result;
}
