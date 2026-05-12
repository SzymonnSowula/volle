'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { VolleLogo } from '@/components/VolleLogo';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-white">
      <Nav />

      <section className="relative px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[100%] bg-gradient-to-br from-red-600/10 to-transparent blur-[140px] pointer-events-none rounded-full" />
        <div className="mx-auto max-w-4xl relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mt-4 text-lg text-neutral-400 max-w-2xl leading-relaxed">
            Last updated: May 2026. How we handle your data, voice inputs, and connected integrations.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-20 space-y-12 text-neutral-300 leading-relaxed">

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            Volle operates as an AI agent platform. To provide our services, we collect and process the following:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-white">Voice and Text Inputs:</strong> Queries you speak or type into the Volle interface.</li>
            <li><strong className="text-white">Blockchain Addresses:</strong> Your connected Solana wallet public key used for authentication and the x402 payment protocol.</li>
            <li><strong className="text-white">OAuth Tokens:</strong> If you connect Google (Gmail/Calendar) or other integrations, we store the necessary access tokens securely to allow agents to perform actions on your behalf.</li>
            <li><strong className="text-white">Session Metadata:</strong> Execution logs, task costs, and on-chain receipts generated during your use of the platform.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Data</h2>
          <p className="mb-4">
            We use your data strictly to execute the intents you explicitly request:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Processing your natural language commands via LLMs (OpenAI).</li>
            <li>Generating voice responses via ElevenLabs.</li>
            <li>Executing API calls to connected services (e.g., fetching unread emails, creating calendar events).</li>
            <li>Calculating and settling micropayment costs on the Solana blockchain.</li>
          </ul>
          <p className="mt-4 text-red-400 font-medium">
            We do not sell your personal data, email contents, or calendar events to third parties, nor do we use them to train baseline AI models.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">3. Third-Party Services</h2>
          <p className="mb-4">
            Volle relies on several third-party providers. When you use Volle, your data may be processed by:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong className="text-white">OpenAI:</strong> For intent classification and agent reasoning.</li>
            <li><strong className="text-white">ElevenLabs:</strong> For text-to-speech and speech-to-text conversion.</li>
            <li><strong className="text-white">Google APIs:</strong> If connected, for accessing your Inbox and Calendar.</li>
            <li><strong className="text-white">Solana:</strong> For public, immutable storage of session receipts and payment settlements.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">4. Desktop Application (Local-First)</h2>
          <p className="mb-4">
            If you use the Volle Desktop app:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>File organization and desktop workflows are executed locally on your machine.</li>
            <li>Volle enforces strict path whitelists (Desktop, Documents, Downloads, Pictures) and blocks system directories to ensure safety.</li>
            <li>File contents are not uploaded unless explicitly required for a specific agent task that you approve.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention & Deletion</h2>
          <p className="mb-4">
            Session history and task logs are stored in our database so you can review them in your dashboard.
            You can disconnect your wallet or revoke OAuth tokens at any time. Because on-chain receipts are deployed to the Solana blockchain, they are immutable and cannot be deleted, but they contain no personally identifiable information (only transaction hashes and costs).
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">6. Contact Us</h2>
          <p>
            If you have questions about this privacy policy, please reach out via GitHub or Twitter.
          </p>
        </div>

      </section>

      <PageFooter />
    </div>
  );
}

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <VolleLogo className="h-8 w-8 text-white" />
          <span className="text-xl font-bold tracking-tight text-white">VOLLE</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-neutral-300">
          <Link href="/learn/documentation" className="hover:text-white transition-colors hidden sm:block">Learn</Link>
          <Link href="/explore/agents" className="hover:text-white transition-colors hidden sm:block">Explore</Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        </div>
      </div>
    </nav>
  );
}

function PageFooter() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <VolleLogo className="h-5 w-5 text-white" />
          <span className="text-sm font-medium text-white">Volle</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-neutral-400">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/privacy" className="text-white">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
