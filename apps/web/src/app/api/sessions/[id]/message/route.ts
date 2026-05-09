import { NextRequest, NextResponse } from 'next/server';
import { getSessionById } from '@/lib/db/sessions';
import { continueSession } from '@/lib/orchestration/session-runner';
import { logger } from '@/lib/utils/logger';

const log = logger('message-route');

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const session = await getSessionById(id);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Guard: only allow messages to sessions that can be continued
    if (!['clarifying', 'created', 'running'].includes(session.status)) {
      return NextResponse.json(
        { error: `Session is ${session.status} and cannot receive messages` },
        { status: 409 }
      );
    }

    const body = await request.json();
    const message = body.message;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'message is required' }, { status: 400 });
    }

    // Run asynchronously so client can stream/poll
    continueSession(id, message).catch((err) => {
      log.error(`Background continuation failed for ${id}`, err);
    });

    return NextResponse.json({ success: true, sessionId: id, status: 'running' });
  } catch (error) {
    console.error('[POST /api/sessions/[id]/message]', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
