# Solli - Voice-Native Session Operator

A production-ready monorepo for a voice-native desktop application with multi-agent orchestration, powered by Tauri, React, Fastify, and LangGraph.

## Architecture Overview

```
solli/
├── apps/
│   ├── desktop/           # Tauri + React 18 desktop app
│   ├── api/              # Fastify backend API
│   ├── worker-browser/   # Playwright browser automation worker
│   └── worker-google/    # Google APIs (Gmail/Calendar) worker
├── packages/
│   ├── agent-core/       # LangGraph multi-agent orchestration
│   ├── shared/           # Shared types and Zod schemas
│   └── blockchain/        # Solana/x402 payment stubs
└── docker/               # PostgreSQL + Redis configuration
```

## Tech Stack

- **Desktop**: Tauri 2 + React 18 + TypeScript
- **Backend**: Fastify + TypeScript
- **Orchestration**: LangGraph (TypeScript)
- **Voice**: ElevenLabs WebSocket API
- **Browser Automation**: Playwright
- **APIs**: Google Gmail & Calendar
- **Database**: PostgreSQL + pgvector
- **Cache**: Redis
- **Monorepo**: pnpm workspaces + Turborepo

## Agent System

The multi-agent orchestration (`packages/agent-core/`) routes user intent through specialized agents:

1. **Coordinator** - Classifies user intent (RESEARCH | INBOX | PLANNING | APPLICATION | GENERAL)
2. **Research** - Web search and information gathering
3. **Inbox** - Email management via Gmail
4. **Planning** - Calendar and scheduling via Google Calendar
5. **Summary** - Session summary generation

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose
- Rust (for Tauri desktop app)

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone <repo-url> solli
cd solli
pnpm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

### 3. Start Infrastructure

```bash
docker-compose up -d
```

### 4. Start Development Servers

```bash
# Start all apps in development mode
pnpm dev

# Or start individual apps
pnpm --filter @solli/api dev
pnpm --filter @solli/worker-browser dev
pnpm --filter @solli/worker-google dev
pnpm --filter @solli/desktop dev
```

### 5. Build for Production

```bash
pnpm build
```

## Project Structure Details

### Desktop App (`apps/desktop/`)

Voice-enabled desktop interface with:
- `VoiceOrb.tsx` - Animated voice activity indicator
- `AgentTimeline.tsx` - Real-time agent activity feed
- `SessionPanel.tsx` - Main session control UI
- `SummaryCard.tsx` - End-of-session summary

### API Server (`apps/api/`)

Fastify backend exposing:
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `POST /api/agents/trigger` - Trigger agent execution
- `POST /api/agents/approve` - Approve pending agent action
- `POST /api/receipts` - Create execution receipt

### Agent Core (`packages/agent-core/`)

LangGraph-based orchestration with:
- State machine workflow for session management
- Postgres checkpointer for persistence
- Tool abstraction layer for browser/Gmail/Calendar

### Browser Worker (`apps/worker-browser/`)

Playwright-based automation:
- Web search
- Page scraping
- Form filling

### Google Worker (`apps/worker-google/`)

Google API integrations:
- Gmail (read/draft/send)
- Calendar (list/create/update/delete events)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `ELEVENLABS_API_KEY` | ElevenLabs API key for voice |
| `ELEVENLABS_AGENT_ID` | ElevenLabs agent ID |
| `OPENAI_API_KEY` | OpenAI API key for LLM |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `SOLANA_RPC_URL` | Solana RPC endpoint |

## Database Schema

The PostgreSQL database includes:
- `sessions` - User session tracking
- `tasks` - Agent task execution records
- `agent_events` - Agent activity timeline
- `receipts` - Execution receipts for payments
- `checkpoints` - LangGraph state persistence

## License

MIT
