import { NextRequest, NextResponse } from 'next/server';
import { getElevenLabsConfig, createElevenLabsAgent } from '@/lib/elevenlabs/session-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body.sessionId;
    const requestedAgentId = body.agentId;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const config = getElevenLabsConfig();

    let agentId = requestedAgentId || config.agentId;

    // If no agentId provided, create one dynamically via ElevenLabs API
    if (!agentId) {
      try {
        agentId = await createElevenLabsAgent(config.apiKey);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        console.error('[POST /api/voice/session] Agent creation failed:', msg);
        return NextResponse.json(
          { error: 'Failed to create voice agent', details: msg },
          { status: 500 }
        );
      }
    }

    // NOTE: In production, use signed URLs instead of exposing the raw API key.
    // For hackathon/demo, the API key is sent to the client so the browser can
    // open the WebSocket directly (WebSocket cannot carry custom headers).
    return NextResponse.json({
      sessionId,
      agentId,
      apiKey: config.apiKey,
      wsUrl: config.wsUrl,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('ElevenLabs API key missing')) {
      return NextResponse.json({ error: 'Voice not configured. Add ELEVENLABS_API_KEY to .env.local' }, { status: 503 });
    }
    console.error('[POST /api/voice/session]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
