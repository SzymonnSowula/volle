'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SessionInput } from '@/components/session/SessionInput';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { VoiceConversationPanel } from '@/components/session/VoiceConversationPanel';
import { SimulationPanel } from '@/components/SimulationPanel';
import { AgentTreasuryCard } from '@/components/AgentTreasuryCard';
import { getSolliProgram, createOnchainSession } from '@/lib/solana/anchor-client';
import { Loader2, Search, Clock, ArrowRight, Play, Zap } from 'lucide-react';

interface RecentSession {
  id: string;
  input: string | null;
  status: string;
  intent: string | null;
  createdAt: string;
}

const SUGGESTIONS = [
  "Help me apply to 3 AI internships in Warsaw",
  "Sort my unread emails and draft replies",
  "Research this company before my interview",
  "Plan my workday: project, gym, and calls",
  "Summarize what we did in yesterday's session",
];

export default function DashboardPage() {
  const router = useRouter();
  const { connected, publicKey, wallet } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<RecentSession[]>([]);
  const [showVoice, setShowVoice] = useState(true);
  const [simulationQuery, setSimulationQuery] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!connected) {
      router.push('/');
    }
  }, [connected, router]);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setRecent(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (connected) {
      loadRecent();
    }
  }, [connected, loadRecent]);

  const handleStartSession = async (input: string) => {
    setLoading(true);
    try {
      let onchainSessionId: number | undefined;
      if (publicKey && wallet?.adapter) {
        try {
          const program = getSolliProgram(connection, wallet.adapter);
          onchainSessionId = Date.now();
          await createOnchainSession(program, publicKey, onchainSessionId, input, 'pending');
        } catch (err) {
          console.error('[Onchain session]', err);
        }
      }

      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          userId: publicKey?.toBase58(),
          metadata: onchainSessionId ? { onchainSessionId } : undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        fetch(`/api/sessions/${data.id}/run`, { method: 'POST' }).catch(() => {});
        router.push(`/session/${data.id}`);
      } else {
        const msg = data.message || data.error || `Server error (${res.status})`;
        alert(`Failed to create session: ${msg}`);
        setLoading(false);
      }
    } catch (err) {
      alert('Failed to create session. Is the server running? Check /api/health');
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-neutral-400" />
          <p className="mt-3 text-sm text-neutral-500">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="w-full border-b border-neutral-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-semibold tracking-tight text-black">Solli</span>
            </button>
          </div>
          <WalletConnectButton />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 pt-16 pb-8">
          <h1 className="text-center text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            What are we working on?
          </h1>
          <p className="mt-3 text-center text-sm text-neutral-500 max-w-md">
            Type or speak. Solli will ask questions, run tools, and close the loop.
          </p>

          <div className="mt-8 w-full max-w-2xl">
            <SessionInput
              onStartSession={handleStartSession}
              onStartVoice={() => setShowVoice((v) => !v)}
              disabled={loading}
              size="lg"
            />
          </div>

          {loading && (
            <div className="mt-6 flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating your session...
            </div>
          )}

          {/* Suggestions + Demo */}
          {!loading && !showVoice && (
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleStartSession(s)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm text-neutral-600 transition-all hover:border-black hover:text-black"
                  >
                    <Search className="h-3 w-3" />
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setSimulationQuery("Help me apply to 3 AI internships in Warsaw")}
                  className="inline-flex items-center gap-2 rounded-full border border-dashed border-neutral-300 bg-neutral-50 px-5 py-2 text-sm font-medium text-neutral-600 transition-all hover:border-neutral-400 hover:text-black"
                >
                  <Play className="h-3.5 w-3.5" />
                  Watch Demo
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Voice Panel */}
        {showVoice && (
          <section className="mx-auto max-w-2xl px-6 pb-12 animate-slide-up">
            <VoiceConversationPanel />
          </section>
        )}

        {/* Treasury + Recent */}
        {!showVoice && (
          <section className="mx-auto max-w-3xl px-6 py-12 space-y-8">
            <AgentTreasuryCard />

            {recent.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Recent Sessions</h2>
                </div>
                <div className="space-y-2">
                  {recent.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => router.push(`/session/${s.id}`)}
                      className="w-full text-left rounded-xl border border-neutral-200 bg-white px-5 py-4 transition-all hover:border-neutral-300 hover:shadow-sm group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black truncate">{s.input || 'No input'}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
                            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 font-medium uppercase tracking-wide">
                              {s.status}
                            </span>
                            {s.intent && <span>{s.intent}</span>}
                            <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-neutral-300 group-hover:text-black transition-colors shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Simulation */}
      {simulationQuery && (
        <SimulationPanel
          query={simulationQuery}
          onClose={() => setSimulationQuery(null)}
        />
      )}
    </div>
  );
}
