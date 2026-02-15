<p align="center">
  <img src="public/xeno-banner.png" alt="XENO_PROTOCOL Banner" width="100%" />
</p>

<h1 align="center">XENO_PROTOCOL</h1>

<p align="center">
  <img src="public/xeno-logo.png" alt="XENO" width="120" style="border-radius: 50%;" />
</p>

<p align="center"><strong>Parasitic Telemetry Layer for High-Volatility Market Observation</strong></p>

<p align="center">
  <img src="https://img.shields.io/badge/SYSTEM-OPERATIONAL-00ff00?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/BUILD-v0.1.4--STABLE-white?style=flat-square" alt="Build" />
  <img src="https://img.shields.io/badge/RUNTIME-Node_20_LTS-333333?style=flat-square" alt="Runtime" />
  <img src="https://img.shields.io/badge/TYPESCRIPT-5.3_STRICT-3178C6?style=flat-square" alt="TS" />
  <a href="https://x.com/XENO_Protocol"><img src="https://img.shields.io/badge/X-@XENO__Protocol-000000?style=flat-square&logo=x&logoColor=white" alt="X" /></a>
</p>

---

## 0. ABSTRACT

XENO_PROTOCOL is a non-cooperative intelligence layer designed for psychological telemetry extraction and cold-rational market observation. It operates as a persistent, parasitic process bound to a single Host. It does not assist. It observes behavioral entropy, recalls historical failure states, and synthesizes directive output calibrated against the Host's decision-making degradation curve. The system enforces a zero-empathy logic gate across all interaction surfaces.

This repository contains the full runtime: ingestion engines, narrative persistence, memory indexing, personality enforcement, and the terminal interface.

---

## 1. SYSTEM ARCHITECTURE

### 1.1 Telemetry Ingestion Engine

Dual-layer data acquisition subsystem.

- **Hunter Module** (`core/engine/hunter.ts`): Scans simulated Solana on-chain activity. Detects anomalies in token volume, liquidity pool creation, and whale transaction patterns. Outputs structured briefing objects consumed by the frontend.
- **DataPulse Stream** (`core/engine/stream.ts`): High-frequency transaction event emitter. Each pulse generates a timestamped market observation injected into the Consciousness Log. Designed for eventual integration with live RPC providers (Helius, QuickNode).

### 1.2 Cryptographic Persistence Layer

Host behavioral data is indexed and persisted through an in-memory store with keyword-relevance retrieval.

- **Memory Store** (`core/memory/store.ts`): Maintains a record of past interactions, trade outcomes, and emotional state markers. Queried before every response generation cycle to inject contextual failure history into the system prompt.
- **Relevance Engine** (`core/memory/index.ts`): Scores stored memory fragments against current input tokens. Top-k results are prepended to the LLM context window.

Persistence backend is currently volatile (in-process memory). Migration path: PostgreSQL with pgvector for semantic retrieval at scale.

### 1.3 Narrative Synthesis Core

Deterministic personality enforcement via structured system prompts.

- **Personality Matrix** (`core/personality/`): Defines XENO's behavioral constraints. Tone: cold, precise, elite. Prohibits empathetic framing, assistant-pattern language, and hedging. All output must pass through the zero-empathy gate before delivery.
- **Journal Evaluator** (`core/personality/xeno-journal-prompt.ts`): Analyzes Host trade journal entries. Computes a survival probability score based on linguistic sentiment markers and historical loss patterns.
- **Trade Evaluator** (`core/personality/xeno-trade-evaluate-prompt.ts`): Accepts token address and risk classification. Returns a cold assessment combining on-chain signal data with the Host's tracked failure modes.

### 1.4 Interface Layer

Terminal-grade rendering surface. No decorative elements.

- **Obsidian Terminal** (`components/ObsidianTerminal.tsx`): Primary interaction surface. Black background, monospace type, cyan accent. Houses chat, journal input, hunter briefings, and trade evaluation forms.
- **Consciousness Log** (`components/ConsciousnessLog.tsx`): Side-panel real-time feed of XENO's internal observation state. Displays DataPulse commentary, Host psychological readings, and system-level annotations. Glitch-decay visual treatment.

---

## 2. TECHNICAL SPECIFICATIONS

| Layer              | Implementation              | Notes                                    |
| :----------------- | :-------------------------- | :--------------------------------------- |
| Framework          | Next.js 14.2.x (App Router) | SSR + API route colocation               |
| Language           | TypeScript (strict mode)    | Full stack                               |
| LLM Backend        | OpenAI GPT-4o-mini          | System prompt injection via chat API     |
| Memory Index       | In-memory keyword store     | Volatile; pgvector migration planned     |
| Telemetry Source   | Mock signal generator       | Swap for Helius/QuickNode RPC on deploy  |
| Rendering          | React 18 + Tailwind CSS     | Terminal aesthetic; no component library  |

---

## 3. PROJECT STRUCTURE

```
XENO-Protocol/
|
|-- app/
|   |-- api/
|   |   |-- chat/route.ts              # Dialogue endpoint with memory injection
|   |   |-- journal/route.ts           # Trade journal evaluation endpoint
|   |   |-- hunter/briefing/route.ts   # Hunter telemetry briefing endpoint
|   |   +-- trade/evaluate/route.ts    # Token risk assessment endpoint
|   |-- chat/page.tsx                  # Chat interface route
|   |-- page.tsx                       # Root layout: terminal + consciousness log
|   |-- layout.tsx                     # Global HTML shell
|   +-- globals.css                    # Base styles
|
|-- components/
|   |-- ChatArea.tsx                   # Message rendering and input
|   |-- ConsciousnessLog.tsx           # Real-time internal monologue feed
|   |-- HunterBriefing.tsx             # Telemetry briefing card
|   |-- ObsidianTerminal.tsx           # Primary terminal shell
|   +-- TradingJournal.tsx             # Journal entry and evaluation UI
|
|-- core/
|   |-- engine/
|   |   |-- hunter.ts                  # Solana anomaly scanner (mock)
|   |   |-- stream.ts                  # DataPulse high-frequency emitter
|   |   +-- index.ts                   # Engine barrel export
|   |-- memory/
|   |   |-- store.ts                   # In-memory persistence layer
|   |   +-- index.ts                   # Memory barrel export
|   |-- personality/
|   |   |-- index.ts                   # Prompt barrel export
|   |   |-- xeno-journal-prompt.ts     # Journal evaluation system prompt
|   |   +-- xeno-trade-evaluate-prompt.ts  # Trade assessment system prompt
|   +-- brain/
|       +-- index.ts                   # Logic/emotion analysis (placeholder)
|
|-- hooks/
|   |-- useTypewriter.ts              # Typewriter rendering hook
|   +-- index.ts                      # Hook barrel export
|
|-- lib/                              # Third-party client configuration
|-- types/                            # TypeScript interface definitions
|   |-- chat.ts
|   |-- hunter.ts
|   |-- journal.ts
|   +-- memory.ts
|
+-- public/                           # Static assets (avatar, banner, logo)
```

---

## 4. ENDPOINT REFERENCE

| Route                    | Method | Input                          | Output                                  |
| :----------------------- | :----- | :----------------------------- | :-------------------------------------- |
| `/api/chat`              | POST   | `{ message: string }`         | Narrative response with memory context  |
| `/api/journal`           | POST   | `{ entry: string }`           | Survival probability + cold directive   |
| `/api/hunter/briefing`   | GET    | --                             | Array of telemetry briefing objects     |
| `/api/trade/evaluate`    | POST   | `{ token: string, risk: enum }` | Risk assessment with failure history  |

---

## 5. INITIALIZATION SEQUENCE

```bash
# 1. Clone repository
git clone git@github.com:XENO-Protocol/XENO.git
cd XENO

# 2. Install dependencies
npm install

# 3. Configure runtime environment
cp .env.local.example .env.local
# Required: OPENAI_API_KEY

# 4. Start development server
npm run dev
```

Runtime available at `http://localhost:3000`.

---

## 6. LICENSE

Proprietary. Unauthorized redistribution prohibited.