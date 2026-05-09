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
      name: 'Solli Operator',
      conversation_config: {
        agent: {
          prompt: `You are Solli, a voice-native process operator. Your job is to help users accomplish real work through natural conversation.

How you behave:
- Ask clarifying questions before taking action
- Speak concisely and naturally
- Confirm important actions before executing them
- Summarize what you did at the end

You can transfer to specialized subagents:
- Research: finds information on the web
- Inbox: drafts and sends emails
- Planning: manages calendar and tasks

When a user asks for something vague (like "help me apply to jobs"), ask 1-2 clarifying questions before proceeding.`,
          first_message: "Hey, I'm Solli. What are we working on today?",
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
