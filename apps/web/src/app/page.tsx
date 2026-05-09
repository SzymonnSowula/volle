'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '@/components/wallet/WalletConnectButton';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Mic, Globe, Mail, Calendar, Search, ArrowRight, Check } from 'lucide-react';

export default function LandingPage() {
  const { connected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (connected) {
      router.push('/dashboard');
    }
  }, [connected, router]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav className="w-full border-b border-neutral-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-black">Solli</span>
          </div>
          <WalletConnectButton />
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-semibold tracking-tight text-black sm:text-6xl leading-[1.1]">
            Run your work
            <br />
            with voice agents
          </h1>
          <p className="mt-6 text-lg text-neutral-500 max-w-xl leading-relaxed">
            Solli is a voice-native process operator. Speak naturally — it asks questions, 
            runs tools, and closes the loop with a summary and on-chain receipt.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <WalletConnectButton />
            <a 
              href="#how-it-works" 
              className="text-sm font-medium text-neutral-500 hover:text-black transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-24 border-t border-neutral-100">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-black">Run a process</h2>
          <p className="mt-2 text-neutral-500">Pick a workflow. Solli guides you through it step by step.</p>
        </div>
        <div className="grid grid-cols-1 gap-px bg-neutral-100 border border-neutral-100 rounded-lg overflow-hidden sm:grid-cols-3">
          <FeatureCell
            icon={<Globe className="h-5 w-5" />}
            title="Apply to Jobs"
            description="Research openings, generate tailored CVs and cover letters, and send applications."
          />
          <FeatureCell
            icon={<Mail className="h-5 w-5" />}
            title="Manage Inbox"
            description="Sort unread emails, draft replies in your tone, and send with your approval."
          />
          <FeatureCell
            icon={<Calendar className="h-5 w-5" />}
            title="Plan Your Day"
            description="Gather tasks, build a schedule, add calendar events, and set reminders."
          />
          <FeatureCell
            icon={<Search className="h-5 w-5" />}
            title="Pre-Interview Research"
            description="Deep-dive a company, recent news, and likely interview questions."
          />
          <FeatureCell
            icon={<Mic className="h-5 w-5" />}
            title="Voice-First"
            description="Talk naturally. Solli hears you, thinks, and responds in real time."
          />
          <FeatureCell
            icon={<Zap className="h-5 w-5" />}
            title="On-Chain Receipts"
            description="Every session is recorded on Solana. Proof of work you can verify."
          />
        </div>
      </section>

      {/* How it Works */}
      <section className="mx-auto max-w-6xl px-6 py-24 border-t border-neutral-100">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-black">How it works</h2>
          <p className="mt-2 text-neutral-500">A team of specialized agents working together.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-5">
          <Step number={1} title="Speak" description="Tell Solli what you need. It asks clarifying questions." />
          <Step number={2} title="Route" description="Coordinator picks the right agent for the job." />
          <Step number={3} title="Execute" description="Agent runs tools — search, draft, schedule, send." />
          <Step number={4} title="Approve" description="You review and approve before anything ships." />
          <Step number={5} title="Receipt" description="Session saved on-chain with cost and proof." />
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 border-t border-neutral-100">
        <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-black">
            Ready to talk through your work?
          </h2>
          <p className="mt-3 text-neutral-500 max-w-md mx-auto">
            Connect your Solana wallet to start. No email. No password. Just voice.
          </p>
          <div className="mt-8 flex justify-center">
            <WalletConnectButton />
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Check className="h-3 w-3" /> ElevenLabs voice
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3 w-3" /> Solana on-chain
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3 w-3" /> x402 micropayments
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 mt-auto">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-black">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-medium text-black">Solli</span>
          </div>
          <span className="text-xs text-neutral-400">Powered by Solana. Colosseum 2026.</span>
        </div>
      </footer>
    </div>
  );
}

function FeatureCell({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-8 transition-colors hover:bg-neutral-50">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-black">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-black">{title}</h3>
      <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="relative">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-xs font-semibold">
        {number}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-black">{title}</h3>
      <p className="mt-1 text-sm text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}
