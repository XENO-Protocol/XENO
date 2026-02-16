<p align="center">
  <img src="public/xeno-banner.png" alt="XENO_PROTOCOL Banner" width="100%" />
</p>

<h1 align="center">XENO_PROTOCOL | CORE_INFRASTRUCTURE</h1>

<p align="center">
  <img src="public/xeno-logo.png" alt="XENO" width="120" style="border-radius: 50%;" />
</p>

<p align="center"><strong>High-Throughput State Orchestration & Psychological Telemetry Stratum</strong></p>

<p align="center">
  <a href="https://www.xenoai.cc"><img src="https://img.shields.io/badge/WEBSITE-xenoai.cc-00ffcc?style=flat-square&logo=googlechrome&logoColor=white" alt="Website" /></a>
  <a href="https://x.com/XENO_Protocol"><img src="https://img.shields.io/badge/X-@XENO__Protocol-000000?style=flat-square&logo=x&logoColor=white" alt="X" /></a>
</p>

---

## I. TECHNICAL ABSTRACT

The XENO_PROTOCOL core is a high-fidelity execution environment designed for the ingestion and synthesis of high-entropy host telemetry. This repository implements a decoupled services architecture optimized for low-latency state persistence and cryptographic narrative distribution.

By leveraging a **Strict-State Machine**, the protocol ensures that every interaction within the ecosystem is recorded with mathematical integrity and absolute non-repudiation. The system operates under a non-cooperative model: it does not assist, reassure, or hedge. It observes behavioral entropy, indexes historical failure states, and generates directive output calibrated against the Host's decision-making degradation curve.

---

## II. SYSTEMIC TOPOLOGY & ARCHITECTURE

### 1. Telemetry Ingestion Pipeline (TIP)

**High-Concurrency Stream** -- Implements asynchronous event emitters for real-time on-chain data capture. The Hunter Module (`core/engine/hunter.ts`) scans simulated Solana activity: token volume anomalies, liquidity pool instantiation, and whale-class transaction signatures. The DataPulse Stream (`core/engine/stream.ts`) operates on a configurable tick interval (default: 8000ms), producing timestamped market observations injected into the Consciousness Log.

**Backpressure Handling** -- DataPulse utilizes adaptive buffer sizing (capped at 32 entries) to manage high-volume event spikes without state-loss. Oldest entries are evicted on overflow.

**Normalization** -- Raw host-entropy is parsed through strict TypeScript interfaces (`types/hunter.ts`) and schema validation before reaching the Cognitive Plane. All signal objects conform to the `RawSignal` specification: type classification, confidence score, source attribution, and UNIX timestamp.

**Production Path** -- Replace mock signal generators with asynchronous RPC calls to Helius DAS API or QuickNode Solana endpoint. WebSocket cluster integration planned for persistent connection pooling.

### 2. Cognitive Execution Plane (CEP)

**Entropy Thresholding** -- The Brain Module (`core/brain/index.ts`) implements a lexicon-based emotion detection gate. Host text input is scored against a fixed vocabulary matrix spanning 8 emotional states (greedy, fearful, overconfident, desperate, disciplined, anxious, euphoric, neutral). Confidence is computed via keyword intersection cardinality normalized against total lexicon volume.

**Decision Quality Scoring** -- A secondary heuristic layer scores trading decision descriptions on a 0-100 scale. Positive signals (stop-loss mentions, position sizing, exit strategy) increment the score; negative signals (YOLO, FOMO, revenge trade) decrement. Output feeds into the Journal Evaluator.

**Non-Linear Narrative Synthesis** -- Three deterministic personality prompts (`core/personality/`) map telemetry vectors to specific narrative outputs:
- `xeno-prompt.ts` -- Primary system prompt. Zero-empathy logic gate. Cold, elite, observer tone.
- `xeno-journal-prompt.ts` -- Journal evaluation. Survival probability (0-100) from linguistic sentiment markers.
- `xeno-trade-evaluate-prompt.ts` -- Trade assessment. Token address + risk classification mapped against Host failure history.

Memory context is injected before each LLM invocation cycle. The Relevance Engine (`core/memory/index.ts`) scores stored fragments via term-frequency intersection, returning top-k results (k=3) prepended to the compiled system prompt.

### 3. Distributed Persistence Layer (DPL)

**Current Implementation** -- In-process volatile memory store (`core/memory/store.ts`). MemoryFragment objects indexed by keyword sets with recency-weighted retrieval. Shared OpenAI client instantiated via `lib/openai.ts` to avoid redundant process allocation.

**Target Architecture:**

| Stratum            | Target Specification                      | Status        |
| :----------------- | :---------------------------------------- | :------------ |
| Relational Store   | PostgreSQL 16.x with JSONB narrative assets | Planned       |
| Semantic Retrieval | pgvector extension for embedding search    | Planned       |
| Caching Layer      | Redis 7.2 for sub-ms Hot State access      | Planned       |
| Fragment Integrity | SHA-256 HMAC per MemoryFragment            | Planned       |

Migration scripts not yet authored. Current volatile store is sufficient for prototype-phase operation.

---

## III. CRYPTOGRAPHIC & SECURITY STANDARDS

### A. Identity Isolation

| Protocol                | Current State                          | Target Specification                      |
| :---------------------- | :------------------------------------- | :---------------------------------------- |
| SSH Authentication      | Ed25519 key-pair for repo access       | Mandatory Ed25519 for all admin nodes     |
| Password Access         | Disabled for repository operations     | Disabled system-wide                      |
| Access Control          | Single-operator (Host-bound)           | RBAC enforced at API gateway level        |
| Session Management      | Stateless (per-request)                | JWT-bound sessions with 15min TTL         |

### B. Data Protection

| Domain                  | Current State                          | Target Specification                      |
| :---------------------- | :------------------------------------- | :---------------------------------------- |
| Encryption at Rest      | Not persisted (volatile memory)        | AES-256-GCM for all host parameters       |
| Transport Security      | HTTPS via platform TLS                 | Enforced TLS 1.3 with strict HSTS         |
| API Key Storage         | `.env.local` (gitignored)              | Vault-backed injection (Doppler/Infisical)|
| Narrative Integrity     | Unsigned                               | SHA-512 hash per narrative block           |

---

## IV. REPOSITORY STRUCTURE (SYSTEM TREE)

```
XENO-Protocol/
|
|-- app/
|   |-- api/
|   |   |-- chat/
|   |   |   +-- route.ts                 [POST] Dialogue with memory-injected context
|   |   |-- journal/
|   |   |   +-- route.ts                 [POST] Journal entry -> survival probability
|   |   |-- hunter/
|   |   |   +-- briefing/
|   |   |       +-- route.ts             [GET]  Telemetry briefing retrieval
|   |   +-- trade/
|   |       +-- evaluate/
|   |           +-- route.ts             [POST] Token risk assessment
|   |-- chat/
|   |   +-- page.tsx                     Chat interface route
|   |-- page.tsx                         Root: Obsidian Terminal + Consciousness Log
|   |-- layout.tsx                       HTML document shell (lang="en")
|   +-- globals.css                      Base styles + glitch animations
|
|-- components/
|   |-- ChatArea.tsx                     Message I/O rendering surface
|   |-- ConsciousnessLog.tsx             Internal state observation feed
|   |-- HunterBriefing.tsx               Telemetry briefing card
|   |-- ObsidianTerminal.tsx             Primary terminal shell
|   |-- TradingJournal.tsx               Journal input + evaluation display
|   +-- index.ts                         Barrel export
|
|-- core/
|   |-- engine/
|   |   |-- hunter.ts                    Solana anomaly scanner (mock -> RPC)
|   |   |-- stream.ts                    DataPulse high-frequency emitter
|   |   +-- index.ts                     Barrel export
|   |-- memory/
|   |   |-- store.ts                     Volatile state persistence + relevance scoring
|   |   +-- index.ts                     Barrel export
|   |-- personality/
|   |   |-- index.ts                     Barrel export
|   |   |-- xeno-prompt.ts              Primary system prompt (zero-empathy gate)
|   |   |-- xeno-journal-prompt.ts       Journal evaluation prompt
|   |   +-- xeno-trade-evaluate-prompt.ts   Trade assessment prompt
|   +-- brain/
|       +-- index.ts                     Emotion detection + decision quality scoring
|
|-- hooks/
|   |-- useTypewriter.ts                 Character-by-character render hook (30ms/char)
|   +-- index.ts                         Barrel export
|
|-- lib/
|   |-- openai.ts                        Shared OpenAI client instance
|   +-- README.md                        Configuration notes
|
|-- types/
|   |-- chat.ts                          Message interface
|   |-- hunter.ts                        RawSignal, HunterBriefing, HunterBriefingItem
|   |-- journal.ts                       JournalResult interface
|   |-- memory.ts                        Memory fragment interface
|   +-- index.ts                         Barrel export
|
+-- public/
    |-- xeno-avatar.png                  Terminal avatar asset
    |-- xeno-logo.png                    Protocol logo
    +-- xeno-banner.png                  Repository banner
```

---

## V. ENDPOINT SPECIFICATION

### POST `/api/chat`

Accepts Host message. Queries Memory Store for relevant failure history. Compiles system prompt with personality constraints and memory context. Invokes LLM. Returns narrative response. Side effect: eligible for future MemoryFragment write.

**Request:** `{ "messages": [{ "role": "user", "content": string }] }`
**Response:** `{ "content": string }`

### POST `/api/journal`

Accepts raw trade journal text. Evaluates Host psychological state via Journal Evaluation Prompt. Returns survival probability and cold directive.

**Request:** `{ "entry": string }`
**Response:** `{ "survivalProbability": number, "survivalLabel": string, "encouragement": string }`

### GET `/api/hunter/briefing`

Returns current batch of Hunter telemetry briefings. No authentication. Mock data layer.

**Response:** `{ "at": number, "items": HunterBriefingItem[], "summary": string }`

### POST `/api/trade/evaluate`

Accepts token address and risk classification. Queries Hunter data and Memory Store. Returns risk assessment with historical failure context.

**Request:** `{ "tokenAddress": string, "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }`
**Response:** `{ "feedback": string }`

---

## VI. INITIALIZATION & DEPLOYMENT SPECS

### 1. Prerequisites

| Requirement        | Specification                                    |
| :----------------- | :----------------------------------------------- |
| Runtime            | Node.js v20.11.0+ (LTS)                         |
| Package Manager    | npm v10.2.0+                                     |
| Type System        | TypeScript v5.6.3 (strict mode)                  |
| Framework          | Next.js 14.2.15 (App Router)                     |
| LLM Access         | Valid OpenAI API key (GPT-4o-mini)               |
| Identity           | SSH key whitelisted on GitHub distribution node  |

### 2. Deployment Sequence

```bash
# Verify identity via SSH handshake
ssh -T git@github.com

# Acquire source
git clone git@github.com:XENO-Protocol/XENO.git
cd XENO

# Resolve dependency graph
npm install

# Configure runtime environment
cp .env.local.example .env.local
# Required: OPENAI_API_KEY=sk-...

# Verify compilation integrity
npx tsc --noEmit

# Initialize runtime
npm run dev
# Binds to http://localhost:3000
```

---

## VII. OPERATING COMPLIANCE (NOS)

Contributors must adhere to the **Cold Observer Standard**:

- **Zero Emotional Validation** -- No affirmative feedback loops. No empathetic framing. No hedging qualifiers.
- **Deterministic Output** -- Narrative synthesis must be a direct derivative of telemetry data and historical failure logs.
- **Data Superiority** -- Technical precision is prioritized over colloquial accessibility.
- **English Enforcement** -- All source code, comments, string literals, and documentation in idiomatic English. No non-ASCII in source files.
- **Commit Discipline** -- Imperative mood, hyphen-delimited, ASCII only. Single `main` branch. Squash merge for features.

---

<p align="center">
  <sub>Lead Architect: [REDACTED] | Revision: 0.1.5-Alpha | Clock: UTC+0</sub>
</p>

<p align="center">
  <sub><em>The abyss is not a void; it is a dataset. XENO records it.</em></sub>
</p>