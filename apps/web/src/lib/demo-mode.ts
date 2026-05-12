/**
 * Demo Mode — set DEMO_MODE=true in env to run without workers.
 * All tools return realistic mock data and the agent discloses the prototype status.
 */

export const DEMO_MODE = process.env.DEMO_MODE === 'true';

// ─── Mock data ────────────────────────────────────────────────────────────────

export function getMockSearchResults(query: string) {
  const q = query.toLowerCase();

  if (q.includes('solana') || q.includes('crypto') || q.includes('defi')) {
    return [
      {
        title: 'Solana DeFi TVL Surpasses $8B — Ecosystem Roundup',
        organization: 'The Block',
        location: 'Web',
        url: 'https://www.theblock.co',
        snippet: 'Solana\'s DeFi ecosystem continues to grow with new protocols launching weekly.',
        reason: 'Top crypto media coverage of Solana DeFi growth',
      },
      {
        title: 'Jupiter DEX Hits Record $2B Daily Volume',
        organization: 'CoinDesk',
        location: 'Web',
        url: 'https://www.coindesk.com',
        snippet: 'Jupiter aggregator dominates Solana DEX trading with new token launch features.',
        reason: 'Leading DEX on Solana with significant volume milestone',
      },
      {
        title: 'Helium Migration to Solana — One Year Later',
        organization: 'Decrypt',
        location: 'Web',
        url: 'https://decrypt.co',
        snippet: 'The IoT network reports improved performance and lower costs after moving to Solana.',
        reason: 'Successful large-scale migration case study',
      },
    ];
  }

  if (q.includes('internship') || q.includes('job') || q.includes('praca')) {
    return [
      {
        title: 'AI Research Intern — XYZ Labs Warsaw',
        organization: 'XYZ Labs',
        location: 'Warsaw, Poland',
        url: 'https://example.com/xyz-ai-intern',
        reason: 'Top AI research lab in Poland with strong mentorship program',
      },
      {
        title: 'Full-Stack Engineer Intern — TechCorp Poland',
        organization: 'TechCorp Poland',
        location: 'Krakow, Poland (Hybrid)',
        url: 'https://example.com/techcorp-intern',
        reason: 'Well-funded startup with modern tech stack',
      },
      {
        title: 'Data Science Intern — Global Analytics',
        organization: 'Global Analytics',
        location: 'Remote (Poland)',
        url: 'https://example.com/global-ds-intern',
        reason: 'Remote-friendly with focus on real-world data science projects',
      },
    ];
  }

  // Generic fallback
  return [
    {
      title: `[Demo] Top result for: "${query}"`,
      organization: 'Example Source',
      location: 'Web',
      url: 'https://example.com/1',
      snippet: 'This is a sample search result shown in demo mode',
      reason: 'Highly relevant to your query',
    },
    {
      title: `[Demo] Second result for: "${query}"`,
      organization: 'Another Source',
      location: 'Web',
      url: 'https://example.com/2',
      snippet: 'Another sample result',
      reason: 'Related content',
    },
  ];
}

export function getMockEmails() {
  return [
    {
      id: 'demo-email-1',
      subject: '[Demo] Meeting notes from last week',
      from: 'team@example.com',
      snippet: 'Hi, please find attached the notes from our last sync. We discussed...',
    },
    {
      id: 'demo-email-2',
      subject: '[Demo] Invoice #INV-2024-042',
      from: 'billing@vendor.com',
      snippet: 'Your invoice for April services is ready. Amount due: $299.00',
    },
    {
      id: 'demo-email-3',
      subject: '[Demo] Follow-up: proposal feedback',
      from: 'client@company.com',
      snippet: 'Thanks for sending over the proposal. We have a few questions...',
    },
  ];
}

export function getMockCalendarEvents() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  return [
    {
      id: 'demo-event-1',
      summary: '[Demo] Team standup',
      start: { dateTime: new Date(tomorrow.setHours(9, 0)).toISOString() },
      end: { dateTime: new Date(tomorrow.setHours(9, 30)).toISOString() },
      attendees: ['alice@team.com', 'bob@team.com'],
    },
    {
      id: 'demo-event-2',
      summary: '[Demo] Product review',
      start: { dateTime: new Date(tomorrow.setHours(14, 0)).toISOString() },
      end: { dateTime: new Date(tomorrow.setHours(15, 0)).toISOString() },
      attendees: ['pm@company.com'],
    },
    {
      id: 'demo-event-3',
      summary: '[Demo] 1:1 with manager',
      start: { dateTime: new Date(tomorrow.setHours(16, 0)).toISOString() },
      end: { dateTime: new Date(tomorrow.setHours(16, 30)).toISOString() },
      attendees: [],
    },
  ];
}
