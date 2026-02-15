# XENO_PROTOCOL

### Non-Cooperative Telemetry Extraction and Cold-Rational Market Observation Runtime

![Status](https://img.shields.io/badge/SYSTEM-OPERATIONAL-00ff00?style=flat-square)
![Build](https://img.shields.io/badge/BUILD-v0.1.4--STABLE-white?style=flat-square)
![Node](https://img.shields.io/badge/NODE-20.11.0_LTS-333333?style=flat-square)
![TS](https://img.shields.io/badge/TYPESCRIPT-5.3_STRICT-3178C6?style=flat-square)
[![X](https://img.shields.io/badge/X-@XENO__Protocol-000000?style=flat-square&logo=x&logoColor=white)](https://x.com/XENO_Protocol)

---

## 0. ABSTRACT

XENO_PROTOCOL is a deterministic intelligence runtime designed for psychological state extraction and market telemetry synthesis. It binds to a single Host process and operates under a non-cooperative interaction model: it does not assist, reassure, or hedge. It observes behavioral entropy across the Host's decision-making surface, indexes historical failure states into a retrievable memory graph, and generates directive output calibrated against measured cognitive degradation.

The system enforces a zero-empathy logic gate at the prompt compilation boundary. All narrative output is filtered through a personality constraint matrix that prohibits empathetic framing, hedging language, and assistant-pattern responses. The result is a cold, precise, contextually-aware observation layer that treats the Host as a measurable signal source rather than a conversational partner.

This repository contains the complete runtime: telemetry ingestion, state persistence, narrative synthesis, personality enforcement, and the terminal rendering surface.

---

## 1. SYSTEMIC TOPOLOGY

```
                     +----------------------------------+
                     |       INTERFACE LAYER            |
                     |  Obsidian Terminal (React 18)    |
                     |  Consciousness Log (SSE feed)    |
                     +--------+-----------+-------------+
                              |           |
                   +----------+           +----------+
                   |                                  |
          +--------v--------+              +----------v---------+
          |  API GATEWAY    |              |  TELEMETRY INGEST  |
          |  /api/chat      |              |  Hunter Module     |
          |  /api/journal   |              |  DataPulse Stream  |
          |  /api/trade/*   |              +----------+---------+
          |  /api/hunter/*  |                         |
          +--------+--------+                         |
                   |                                  |
          +--------v--------+              +----------v---------+
          |  NARRATIVE CORE |              |  STATE PERSISTENCE |
          |  Personality    |<-------------+  Memory Store      |
          |  Matrix         |  context     |  Relevance Engine  |
          |  (System Prompt |  injection   |  (keyword scoring) |
          |   Compilation)  |              +--------------------+
          +--------+--------+
                   |
          +--------v--------+
          |  LLM BACKEND    |
          |  OpenAI GPT-4o  |
          |  -mini (chat    |
          |   completion)   |
          +-----------------+
```

Data flows unidirectionally from ingestion to rendering. The Memory Store is queried synchronously before each prompt compilation cycle. Telemetry events from DataPulse are injected asynchronously into the Consciousness Log via internal event dispatch.

---

## 2. SYSTEM ARCHITECTURE

### 2.1 Telemetry Ingestion Engine

Dual-channel asynchronous data acquisition subsystem responsible for market signal extraction.

**Hunter Module** (`core/engine/hunter.ts`)
- Scans simulated Solana on-chain state for anomalous patterns: abnormal token volume deltas, new liquidity pool instantiation events, and whale-class transaction signatures exceeding configurable threshold values.
- Output format: structured `HunterBriefing` objects containing token identifier, anomaly classification, confidence score, and a pre-formatted narrative string in XENO's briefing syntax.
- Current implementation: deterministic mock generator producing randomized but structurally valid briefing payloads. Production path: replace mock layer with asynchronous RPC calls to Helius DAS API or QuickNode Solana endpoint.

**DataPulse Stream** (`core/engine/stream.ts`)
- High-frequency event emitter operating on a configurable interval (default: 8000ms). Each tick produces a timestamped `DataPulse` event containing simulated transaction metadata: volume, token address, price delta, and a computed irrationality index.
- Each pulse triggers a synchronous write to the Consciousness Log buffer, formatted as a cold one-line market observation.
- Designed for eventual socket-based delivery (WebSocket or Server-Sent Events) when transitioning from mock to live telemetry.

### 2.2 State Persistence Layer

In-process volatile memory store providing keyword-indexed retrieval of Host behavioral records.

**Memory Store** (`core/memory/store.ts`)
- Maintains an ordered collection of `MemoryFragment` objects. Each fragment contains: timestamp, interaction context, emotional state classification, trade outcome (if applicable), and a tokenized keyword set for retrieval matching.
- Write path: after each Host interaction, the system extracts salient keywords and emotional markers from the exchange and persists a new fragment.
- Read path: before prompt compilation, the Relevance Engine scores all stored fragments against the current input token set and returns top-k results (k=3, configurable).

**Relevance Engine** (`core/memory/index.ts`)
- Implements a term-frequency intersection scorer. Input tokens are compared against each fragment's keyword set. Fragments are ranked by intersection cardinality, then by recency as a tiebreaker.
- Matched fragments are serialized into a context block prepended to the system prompt before LLM invocation.

Migration path: replace in-process store with PostgreSQL 16 + pgvector extension for embedding-based semantic retrieval. Schema migration scripts are not yet authored.

### 2.3 Narrative Synthesis Core

Deterministic personality enforcement layer. All LLM output is constrained by a compiled system prompt that encodes XENO's behavioral parameters.

**Personality Matrix** (`core/personality/index.ts`)
- Defines immutable constraints: prohibit empathetic framing, prohibit assistant-pattern language ("I'm here to help", "Let me know"), prohibit hedging qualifiers ("perhaps", "maybe", "it seems"). Enforce cold, precise, directive syntax. Maximum response density: no filler tokens.
- Constraint violations are handled at the prompt level (instruction-following), not via post-processing filters.

**Journal Evaluation Prompt** (`core/personality/xeno-journal-prompt.ts`)
- Accepts raw Host journal text. Instructs the LLM to extract: emotional valence (greed, fear, overconfidence, capitulation), position sizing rationality, and historical pattern matches from injected memory context.
- Output specification: a numerical survival probability (0.00-1.00) followed by a single cold directive sentence.

**Trade Evaluation Prompt** (`core/personality/xeno-trade-evaluate-prompt.ts`)
- Accepts token address string and risk classification enum (`LOW | MEDIUM | HIGH | CRITICAL`). Instructs the LLM to synthesize: on-chain signal assessment (from Hunter data if available), historical Host failure patterns (from Memory Store), and a final risk-adjusted verdict.
- Output specification: structured feedback combining quantitative assessment with narrative commentary. Tone enforcement: elite observer, zero reassurance.

### 2.4 Interface Layer

Terminal-grade rendering surface. Zero decorative elements. Monospace typography only.

**Obsidian Terminal** (`components/ObsidianTerminal.tsx`)
- Primary Host interaction surface. Renders on `#000000` background with `#00ffcc` (cyan) accent for system text and `#ffffff` for Host input. Font: system monospace stack. No border radius, no shadows, no gradients.
- Houses four interaction modes: chat dialogue, trade journal input, hunter briefing display, and trade evaluation form.
- Text rendering uses a character-by-character typewriter hook (`hooks/useTypewriter.ts`) with configurable delay (default: 30ms per character).

**Consciousness Log** (`components/ConsciousnessLog.tsx`)
- Side-panel feed displaying XENO's internal observation state. Receives entries from three sources: DataPulse market commentary, Host psychological state annotations (generated post-interaction), and system-level diagnostic messages.
- Visual treatment: reduced opacity text (`0.6`), intermittent CSS-driven glitch artifacts on timestamps, vertical scroll with auto-follow.

---

## 3. CRYPTOGRAPHIC STANDARDS

Current implementation status and target specifications for transport and data security.

| Domain                  | Current State                        | Target Specification                    |
| :---------------------- | :----------------------------------- | :-------------------------------------- |
| Transport Security      | HTTPS (TLS 1.2+ via Vercel/host)    | TLS 1.3 enforced, HSTS preload         |
| API Authentication      | None (prototype)                     | Ed25519 signed request headers          |
| LLM API Key Storage     | `.env.local` (gitignored)            | Vault-backed secret injection (Doppler) |
| Memory Store Integrity  | None (volatile, unsigned)            | SHA-256 HMAC per MemoryFragment         |
| Session Isolation       | Single-process, single-host          | JWT-bound session with 15min TTL        |
| Data at Rest            | Not persisted                        | AES-256-GCM encrypted PostgreSQL column |

Note: cryptographic enforcement is not implemented in the current prototype. The table above documents the target architecture for production hardening. Current deployment relies on platform-level TLS (Vercel edge network or equivalent) and environment variable isolation for secret management.

---

## 4. ENVIRONMENTAL REQUIREMENTS

### 4.1 Runtime Dependencies

| Dependency            | Version Constraint   | Purpose                                        |
| :-------------------- | :------------------- | :--------------------------------------------- |
| Node.js               | >= 20.11.0 (LTS)    | JavaScript runtime                             |
| npm                   | >= 10.2.0            | Package management                             |
| TypeScript            | >= 5.3.0             | Static type checking (strict mode enforced)     |
| Next.js               | 14.2.x               | Application framework (App Router)             |
| React                 | 18.x                 | Component rendering                            |
| Tailwind CSS          | 3.x                  | Utility-first style compilation                |
| OpenAI SDK            | >= 4.x               | LLM API client                                 |

### 4.2 Required Environment Variables

| Variable              | Type     | Description                                    |
| :-------------------- | :------- | :--------------------------------------------- |
| `OPENAI_API_KEY`      | string   | OpenAI API authentication token                |

Defined in `.env.local` (excluded from version control via `.gitignore`). A template is provided at `.env.local.example`.

### 4.3 Operating System Compatibility

Tested on Windows 11 (PowerShell 7.x), macOS 14 (zsh), Ubuntu 22.04 LTS (bash). No platform-specific native dependencies. All I/O is handled through Node.js standard library abstractions.

---

## 5. OPERATING COMPLIANCE

### 5.1 Code Standards

- Language: TypeScript in strict mode (`"strict": true` in `tsconfig.json`). No `any` types permitted in committed code.
- Localization: English only. No non-ASCII characters in source files, string literals, comments, or documentation. Variable and function names must use idiomatic English.
- Style: No linter configuration is currently enforced. Target: ESLint with `@typescript-eslint/strict-type-checked` ruleset.

### 5.2 Version Control

- Branch model: single `main` branch (current). Target: `main` (protected) + feature branches with squash merge.
- Commit format: imperative mood, hyphen-delimited, ASCII only. Example: `Add-hunter-telemetry-endpoint`.
- Remote: `https://github.com/XENO-Protocol/XENO.git`

### 5.3 Deployment Context

- Current: local development server (`npm run dev`, port 3000).
- Target: Vercel Edge Network with automatic preview deployments per branch. No containerization required for the Next.js runtime; Vercel handles build and deployment isolation natively.

---

## 6. PROJECT STRUCTURE

```
XENO-Protocol/
|
|-- app/
|   |-- api/
|   |   |-- chat/
|   |   |   +-- route.ts                 [POST] Dialogue with memory-injected context
|   |   |-- journal/
|   |   |   +-- route.ts                 [POST] Journal entry evaluation
|   |   |-- hunter/
|   |   |   +-- briefing/
|   |   |       +-- route.ts             [GET]  Telemetry briefing retrieval
|   |   +-- trade/
|   |       +-- evaluate/
|   |           +-- route.ts             [POST] Token risk assessment
|   |-- chat/
|   |   +-- page.tsx                     Chat interface route component
|   |-- page.tsx                         Root: terminal + consciousness log
|   |-- layout.tsx                       HTML document shell
|   +-- globals.css                      Base stylesheet
|
|-- components/
|   |-- ChatArea.tsx                     Message I/O rendering
|   |-- ConsciousnessLog.tsx             Internal state observation feed
|   |-- HunterBriefing.tsx               Telemetry briefing card
|   |-- ObsidianTerminal.tsx             Primary terminal shell
|   +-- TradingJournal.tsx               Journal input and evaluation
|
|-- core/
|   |-- engine/
|   |   |-- hunter.ts                    On-chain anomaly scanner (mock)
|   |   |-- stream.ts                    DataPulse event emitter
|   |   +-- index.ts                     Barrel export
|   |-- memory/
|   |   |-- store.ts                     Volatile state persistence
|   |   +-- index.ts                     Barrel export
|   |-- personality/
|   |   |-- index.ts                     Barrel export
|   |   |-- xeno-journal-prompt.ts       Journal evaluation system prompt
|   |   +-- xeno-trade-evaluate-prompt.ts   Trade assessment system prompt
|   +-- brain/
|       +-- index.ts                     Logic analysis (placeholder)
|
|-- hooks/
|   |-- useTypewriter.ts                 Character-by-character render hook
|   +-- index.ts                         Barrel export
|
|-- lib/                                 Third-party client initialization
|-- types/
|   |-- chat.ts                          Chat message interfaces
|   |-- hunter.ts                        Hunter briefing interfaces
|   |-- journal.ts                       Journal entry interfaces
|   +-- memory.ts                        Memory fragment interfaces
|
+-- public/                              Static assets
```

---

## 7. ENDPOINT SPECIFICATION

### 7.1 POST /api/chat

Accepts Host message. Queries Memory Store for relevant failure history. Compiles system prompt with personality constraints and memory context. Invokes LLM. Returns narrative response.

**Request body:** `{ "message": string }`
**Response body:** `{ "response": string }`
**Side effects:** Writes new MemoryFragment to store.

### 7.2 POST /api/journal

Accepts raw trade journal text. Evaluates Host psychological state via Journal Evaluation Prompt. Returns survival probability and cold directive.

**Request body:** `{ "entry": string }`
**Response body:** `{ "probability": number, "directive": string }`

### 7.3 GET /api/hunter/briefing

Returns current batch of Hunter telemetry briefings. No authentication. No pagination (current dataset is small).

**Response body:** `HunterBriefing[]`

### 7.4 POST /api/trade/evaluate

Accepts token address and risk classification. Queries Hunter data and Memory Store. Returns risk assessment with historical failure context.

**Request body:** `{ "token": string, "risk": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" }`
**Response body:** `{ "assessment": string }`

---

## 8. INITIALIZATION SEQUENCE

```bash
# 1. Acquire source
git clone git@github.com:XENO-Protocol/XENO.git
cd XENO

# 2. Resolve dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
# Populate OPENAI_API_KEY with valid token

# 4. Verify TypeScript compilation
npx tsc --noEmit

# 5. Start runtime
npm run dev
# Binds to http://localhost:3000
```

---

## 9. LICENSE

Proprietary. Source code is provided for review and development purposes only. Redistribution, modification for external deployment, and commercial use without explicit authorization are prohibited.