'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  ArrowLeft,
  Monitor,
  Globe,
  Mic,
  Cpu,
  Shield,
  Clock,
  Sparkles,
  Mail,
  CheckCircle2,
  Radio,
  Layers,
  Download,
} from 'lucide-react';
import Link from 'next/link';

export default function DownloadPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav className="w-full border-b border-neutral-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-black">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-semibold tracking-tight text-black">Solli</span>
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-neutral-500 hover:text-black transition-colors"
          >
            Launch Beta
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 mb-6">
            <Radio className="h-3 w-3 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              Coming soon
            </span>
          </div>
          <h1 className="text-5xl font-semibold tracking-tight text-black sm:text-6xl leading-[1.1]">
            The future of Solli
            <br />
            lives on your desktop
          </h1>
          <p className="mt-6 text-lg text-neutral-500 max-w-xl leading-relaxed">
            What you see today is a browser beta — a showcase of what is possible. 
            The real Solli is a native desktop agent that runs quietly in the background, 
            handles your workflows automatically, and only talks to you when it matters.
          </p>
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-neutral-100">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-black">Where we are vs. where we are going</h2>
          <p className="mt-2 text-neutral-500">The web beta proves the concept. The desktop app delivers the vision.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-black">Web Beta</h3>
                <p className="text-xs text-neutral-400">Available now</p>
              </div>
            </div>
            <ul className="space-y-4">
              <FeatureItem icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} text="Voice-native session operator" />
              <FeatureItem icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} text="Research, inbox & planning agents" />
              <FeatureItem icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} text="On-chain receipts & treasury" />
              <FeatureItem icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} text="x402 micropayments per tool" />
              <FeatureItem icon={<Clock className="h-4 w-4 text-amber-500" />} text="Browser-only (you must keep the tab open)" dim />
              <FeatureItem icon={<Clock className="h-4 w-4 text-amber-500" />} text="Manual session lifecycle" dim />
              <FeatureItem icon={<Clock className="h-4 w-4 text-amber-500" />} text="Requires active interaction" dim />
            </ul>
          </div>

          {/* Future */}
          <div className="rounded-2xl border border-black bg-black p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <Monitor className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Desktop Agent</h3>
                <p className="text-xs text-neutral-400">Coming 2026</p>
              </div>
            </div>
            <ul className="space-y-4">
              <FeatureItem icon={<Sparkles className="h-4 w-4 text-teal-400" />} text="Everything in the beta, plus:" white />
              <FeatureItem icon={<Cpu className="h-4 w-4 text-teal-400" />} text="Runs in the background 24/7" white />
              <FeatureItem icon={<Mic className="h-4 w-4 text-teal-400" />} text="Ambient voice mode — wake up anytime" white />
              <FeatureItem icon={<Layers className="h-4 w-4 text-teal-400" />} text="Cross-app automation (files, apps, browser)" white />
              <FeatureItem icon={<Shield className="h-4 w-4 text-teal-400" />} text="Local-first privacy — your data never leaves" white />
              <FeatureItem icon={<Clock className="h-4 w-4 text-teal-400" />} text="Scheduled & recurring workflows" white />
              <FeatureItem icon={<Zap className="h-4 w-4 text-teal-400" />} text="Proactive suggestions before you ask" white />
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-neutral-100">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-black">How the desktop agent works</h2>
          <p className="mt-2 text-neutral-500">Invisible until you need it. Powerful when you do.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <StepCard
            number={1}
            title="Install"
            description="One-click installer. Solli lives in your menu bar, using less memory than a browser tab."
            icon={<Download className="h-5 w-5" />}
          />
          <StepCard
            number={2}
            title="Authorize"
            description="Connect your wallet, Google, and any other tools once. Solli remembers everything securely."
            icon={<Shield className="h-5 w-5" />}
          />
          <StepCard
            number={3}
            title="Forget about it"
            description="Say 'handle my inbox every morning at 9' and Solli just does it. You only hear a summary."
            icon={<Mic className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Waitlist */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-neutral-100">
        <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-12 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-tight text-black">
            Be the first to get the desktop agent
          </h2>
          <p className="mt-3 text-neutral-500 max-w-md mx-auto">
            We are building this right now. Leave your email and we will let you know 
            the moment the native app is ready.
          </p>

          {!submitted ? (
            <form onSubmit={handleNotify} className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-4 py-3 text-sm text-black outline-none focus:border-black transition-colors"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                Notify me
              </button>
            </form>
          ) : (
            <div className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-6 py-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">
                You are on the list. We will reach out soon.
              </span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Monitor className="h-3 w-3" /> macOS & Windows
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3 w-3" /> Local-first
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3" /> Early 2026
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
          <div className="flex items-center gap-6 text-xs text-neutral-400">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-black transition-colors">Beta</Link>
            <span>Powered by Solana. Colosseum 2026.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({
  icon,
  text,
  dim,
  white,
}: {
  icon: React.ReactNode;
  text: string;
  dim?: boolean;
  white?: boolean;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span
        className={`text-sm leading-relaxed ${
          white
            ? 'text-neutral-200'
            : dim
            ? 'text-neutral-400'
            : 'text-neutral-700'
        }`}
      >
        {text}
      </span>
    </li>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-neutral-100 bg-white p-8 transition-all hover:border-neutral-200 hover:shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-black mb-5">
        {icon}
      </div>
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white text-[10px] font-bold absolute top-6 right-6">
        {number}
      </div>
      <h3 className="text-base font-semibold text-black">{title}</h3>
      <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{description}</p>
    </div>
  );
}
