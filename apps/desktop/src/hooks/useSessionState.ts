import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface SessionState {
  id: string;
  status: string;
  userId: string;
  agentHistory: Array<{
    agentName: string;
    eventType: string;
    content: string;
    timestamp: string;
  }>;
  toolResults: Record<string, unknown>;
  pendingApprovals: Array<{
    id: string;
    agentName: string;
    message: string;
  }>;
  summary: string;
}

interface UseSessionStateResult {
  session: SessionState | null;
  loading: boolean;
  error: string | null;
}

export function useSessionState(sessionId: string): UseSessionStateResult {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        const data = await api.getSession(sessionId);
        if (isMounted) {
          setSession(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load session');
          setLoading(false);
        }
      }
    };

    const pollSession = async () => {
      await fetchSession();

      const interval = setInterval(async () => {
        try {
          const data = await api.getSessionState(sessionId);
          if (isMounted && data) {
            setSession(data);
          }
        } catch {
          // Silently handle poll errors
        }
      }, 2000);

      return () => clearInterval(interval);
    };

    pollSession();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return { session, loading, error };
}
