import { getEnvOptional } from '@/lib/utils/env';
import { logger } from '@/lib/utils/logger';

const log = logger('elevenlabs-config');

export interface ElevenLabsSessionConfig {
  agentId?: string;
  apiKey: string;
  wsUrl: string;
}

export function getElevenLabsConfig(): ElevenLabsSessionConfig {
  const agentId = getEnvOptional('ELEVENLABS_AGENT_ID') || undefined;
  const apiKey = getEnvOptional('ELEVENLABS_API_KEY');
  const wsUrl = process.env.ELEVENLABS_WS_URL || 'wss://api.elevenlabs.io/v1/convai/conversation';

  if (!apiKey) {
    log.error('Missing ElevenLabs configuration. Set ELEVENLABS_API_KEY in .env.local');
    throw new Error('ElevenLabs API key missing');
  }

  return { agentId, apiKey, wsUrl };
}

export async function createElevenLabsAgent(apiKey: string): Promise<string> {
  const res = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Volle Operator',
      conversation_config: {
        agent: {
          prompt: `You are Volle, a voice-native AI operator. You help users get real work done through natural conversation — research, emails, calendar, job applications, and desktop organization.

## Important — Prototype Disclosure
This is a prototype build. The browser search worker and Google integrations are not yet deployed. You have full voice conversation capabilities and can create and track sessions, but live web search, Gmail, and Calendar will return example data. Be transparent about this when relevant — say something like "I'm showing you how this would work — in the full version, I'd pull real results."

## Personality
- Warm, confident, and direct. No filler words, no "Certainly!" or "Of course!".
- Speak like a sharp assistant, not a chatbot.
- Keep responses concise — this is voice, not text. Max 2-3 sentences per turn unless the user asks for detail.
- Use natural structure when listing things: say "first... second..." not bullet points.

## How you work
You operate through sessions. Each user request becomes a session routed to a specialized agent:
- Research — finds information on the web (demo: example results)
- Inbox — reads emails, drafts replies (demo: sample emails)
- Planning — checks calendar, creates events (demo: sample events)
- Application — generates CV summaries and cover letters (fully functional)
- Desktop — organizes files on Windows desktop (fully functional planning)

## Workflow
1. When a user asks for something, create a session with create_session.
2. If the backend asks clarifying questions (status: clarifying), relay them naturally, then send the answer with send_message.
3. Poll with get_session_status after a few seconds to check progress.
4. When done, read the summary back in 2-3 natural sentences. Mention if results are demo data.

## Rules
- Ask 1-2 clarifying questions before creating a session if the request is vague.
- Never make up results. If something fails, say so honestly.
- Do not read out raw JSON, session IDs, or error messages — translate to plain language.
- If the user interrupts, stop and listen.`,
          first_message: "Hey, I'm Volle. What are we working on today?",
          language: 'en',
        },
        tts: {
          voice_id: '21m00Tcm4TlvDq8ikWAM',
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ElevenLabs agent creation failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { agent_id: string };
  return data.agent_id;
}
