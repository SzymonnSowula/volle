import type { SessionStore } from '@/lib/db/session-store';
import type { ResearchResult } from './research-agent';
import type { InboxResult } from './inbox-agent';
import type { PlanningResult } from './planning-agent';
import type { ApplicationResult } from './application-agent';
import { getToolCost, formatCost } from '@/lib/x402';
import { logger } from '@/lib/utils/logger';

const log = logger('summary-agent');
const SUMMARY_COST = getToolCost('summary_generate');

async function callOpenAI(prompt: string, temperature = 0.7, maxTokens = 500): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not set');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI error: ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content?.trim() || '';
}

export async function summaryAgent(
  sessionId: string,
  userIntent: string,
  researchResults: ResearchResult[],
  store: SessionStore,
  inboxResults?: InboxResult,
  planningResults?: PlanningResult,
  applicationResults?: ApplicationResult
): Promise<string> {
  await store.addEvent({
    sessionId,
    agentName: 'summary',
    eventType: 'started',
    content: 'Generating session summary...',
  });

  let summary = '';

  try {
    const resultsText = researchResults
      .map((r, i) => `${i + 1}. ${r.title} (${r.organization || 'Unknown'}, ${r.location || 'N/A'})`)
      .join('\n');

    const inboxText = inboxResults
      ? `Inbox actions: ${inboxResults.actionsTaken.join(', ')}. Emails processed: ${inboxResults.emailsProcessed.length}.`
      : '';

    const planningText = planningResults
      ? `Calendar actions: ${planningResults.actionsTaken.join(', ')}. Events created: ${planningResults.eventsCreated.length}.`
      : '';

    const applicationText = applicationResults
      ? `Application docs: ${applicationResults.documents.map((d) => d.title).join(', ')}.`
      : '';

    const prompt = `Generate a concise 2-4 sentence summary of the session.

User request: "${userIntent}"

${resultsText ? `Research results:\n${resultsText}\n` : ''}
${inboxText ? `${inboxText}\n` : ''}
${planningText ? `${planningText}\n` : ''}
${applicationText ? `${applicationText}\n` : ''}

Summary:`;

    summary = await callOpenAI(prompt, 0.5, 500);
    log.info('Generated summary', summary);
  } catch (error) {
    log.error('Summary generation failed', error);
    const parts: string[] = [];
    if (researchResults.length) parts.push(`Research: ${researchResults.length} results`);
    if (inboxResults) parts.push(`Inbox: ${inboxResults.emailsProcessed.length} emails`);
    if (planningResults) parts.push(`Planning: ${planningResults.eventsCreated.length} events`);
    if (applicationResults) parts.push(`Application: ${applicationResults.documents.length} docs generated`);
    summary = `Session completed. Request: "${userIntent}". ${parts.join('. ') || 'No specialized actions taken.'}`;
  }

  await store.addEvent({
    sessionId,
    agentName: 'summary',
    eventType: 'completed',
    content: `Summary generated · Cost: ${formatCost(SUMMARY_COST)}`,
    metadata: { costSol: SUMMARY_COST },
  });

  await store.addTask({
    sessionId,
    agentName: 'summary',
    toolName: 'summary_generate',
    outputJson: { summary },
    status: 'completed',
    costSol: SUMMARY_COST,
  });

  await store.updateSession(sessionId, {
    status: 'completed',
    summary,
    actualCostSol: SUMMARY_COST, // summary generation cost; research cost recorded separately in tasks
  });

  return summary;
}
