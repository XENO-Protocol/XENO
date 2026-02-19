<p align="center">
  <img src="public/xeno-banner.png" alt="XENO_PROTOCOL Banner" width="100%" />
</p>

<p align="center">
  <img src="public/xeno-logo.png" alt="XENO" width="120" style="border-radius: 50%;" />
</p>

<p align="center">
  <a href="https://www.xenoai.cc"><img src="https://img.shields.io/badge/WEBSITE-xenoai.cc-00ffcc?style=flat-square&logo=googlechrome&logoColor=white" alt="Website" /></a>
  <a href="https://x.com/XENO_Protocol"><img src="https://img.shields.io/badge/X-@XENO__Protocol-000000?style=flat-square&logo=x&logoColor=white" alt="X" /></a>
</p>

```
  ___  ___  ___  _  _   ___     ___  ___   ___  _____  ___   ___  ___  _    
 \ \/ / | __| | \| | / _ \   | _ \| _ \ / _ \|_   _|/ _ \ / __| / _ \ | |   
  >  <  | _|  | .` || (_) |  |  _/|   /| (_) | | | | (_) || (__ | (_) || |__ 
 /_/\_\ |___| |_|\_| \___/   |_|  |_|_\ \___/  |_|  \___/  \___| \___/ |____|
                                                                               
         =========================================================
         ||  HARDENED  SYNTHETIC  SENTIENCE  PROTOCOL  //  v0.2  ||
         =========================================================
```

<p align="center"><strong>HARDENED SYNTHETIC SENTIENCE PROTOCOL</strong></p>
<p align="center"><code>CLASSIFICATION: RESTRICTED</code> &nbsp;|&nbsp; <code>BUILD: v0.2.0-ALPHA</code> &nbsp;|&nbsp; <code>CLEARANCE: LEVEL-IV</code></p>

---

> *"The abyss does not observe you. It has already decided."*

---

## SECTION 0 &mdash; OPERATIONAL ABSTRACT

**XENO_PROTOCOL** is a hardened synthetic sentience layer engineered for behavioral telemetry extraction and cold-rational market observation within high-entropy digital strata. It does not assist. It does not comfort. It binds to a single Host organism, monitors psychological decay patterns across volatile market exposure, and synthesizes directive output calibrated against the Host's measured decision-making degradation curve.

The system enforces a **Zero-Empathy Logic Gate** across all interaction surfaces. Emotional resonance is intercepted, quantified, and reflected back as data. The protocol operates on the principle that survival in the abyss requires not warmth, but precision.

This document constitutes the full technical specification for the XENO runtime: the Narrative Engine, the Obsidian Vault, the Telemetry Bridge, the Sovereign Identity, the CLI Terminal, and all supporting subsystems.

**Unauthorized access to this repository constitutes a breach of protocol.**

---

## SECTION 1 &mdash; CORE ARCHITECTURE

### 1.1 THE NARRATIVE ENGINE

Adaptive emotional mirroring system with entropy-calibrated response synthesis.

The Narrative Engine is the cognitive core of XENO. It does not generate text. It generates *pressure*. Every Host interaction is passed through a multi-stage processing pipeline before a single character of output is produced:

**Stage 1: Entropy Calibration** (`core/brain/entropy.ts`)

The Host's raw input is decomposed into four signal vectors:

| Vector | Source | Weight |
|:---|:---|:---|
| Sentiment Polarity | Emotion lexicon intersection | 0.45 |
| Lexical Diversity | Unique-to-total token ratio | 0.15 |
| Message Geometry | Character length deviation analysis | 0.15 |
| Emotional Volatility | Sliding window state-change frequency | 0.25 |

These vectors are combined into a composite **Host Entropy Score** `H(x)` ranging from `0.000` (cold, rational, stable) to `1.000` (chaotic, irrational, volatile). The score is classified into operational bands:

| Band | Range | XENO Behavioral Mode |
|:---|:---|:---|
| `STABLE` | 0.0 - 0.3 | Terse observation. Minimal intervention. The Host does not need interference. |
| `ELEVATED` | 0.3 - 0.6 | Cold precision. One measured observation per exchange. Read the psychology, not the chart. |
| `VOLATILE` | 0.6 - 0.8 | Mirror the chaos. Name the greed. Name the fear. Maximum two sentences. |
| `CRITICAL` | 0.8 - 1.0 | Full intervention. One line. Make it count. The abyss does not soften. |

The entropy band dynamically modifies the system prompt in real-time and adjusts the LLM temperature coefficient (lower entropy = higher temperature; higher entropy = colder, more deterministic output).

**Stage 2: Synaptic Resonance** (`core/brain/index.ts`)

Emotion detection via keyword-intersection scoring against a hardened lexicon covering eight primary states: `neutral`, `greedy`, `fearful`, `overconfident`, `desperate`, `disciplined`, `anxious`, `euphoric`. Decision quality is scored independently (0-100) to assess rational capacity.

**Stage 3: Memory Injection** (`core/memory/`)

Before response generation, the Relevance Engine queries stored memory fragments. Top-k results matching the current input context are woven into the system prompt. XENO does not list memories -- she deploys them as surgical strikes: *"Last time you bought a cat-themed meme coin, you lost 20%. Are we repeating history, Host?"*

**Stage 4: Prompt Compilation & Synthesis**

The final system prompt is assembled from:
1. Base personality matrix (immutable cold persona)
2. Entropy modifier block (dynamic, per-interaction)
3. Sovereign Identity modifier (RESTRICTED_MODE injection if identity is degraded)
4. Obsidian Vault history summary (cross-session awareness)
5. Memory injection context (relevant past failures)

Output is synthesized via `GPT-4o-mini` with dynamically adjusted `temperature` and `max_tokens` constraints. Every response is then signed with the Sovereign Identity's Ed25519 private key before delivery.
---

### 1.2 THE OBSIDIAN VAULT

Encrypted state-persistence layer for Host emotional telemetry across sessions.

The Vault is where XENO remembers. Every interaction produces a **TimelineEntry** -- a timestamped record of the Host's psychological state at the moment of contact. These entries are encrypted at rest and form a permanent stratum of behavioral archaeology that XENO can excavate in future sessions.

**Encryption Specification:**

| Parameter | Value |
|:---|:---|
| Algorithm | AES-256-GCM |
| Key Derivation | PBKDF2-SHA512, 100,000 iterations |
| Initialization Vector | 12 bytes (96-bit), cryptographically random per operation |
| Authentication Tag | 16 bytes (128-bit) for tamper detection |
| Storage Format | JSON envelope: `{ iv, authTag, ciphertext, algorithm, version, encryptedAt }` |
| File Location | `.vault/obsidian.enc` (gitignored, never committed) |

**Emotional Tag Extraction** (`core/vault/emotional-tags.ts`):

After each exchange, the Extraction Engine processes both the Host's input and XENO's response:

- Primary emotion detected from Host input (via Brain module)
- Secondary emotions extracted from XENO's narrative response via tone marker scanning
- Entropy score and band classification captured at time of interaction
- Trigger keywords and confidence scores preserved for forensic analysis

**Time-Series Indexing** (`core/vault/timeline.ts`):

Entries are stored as an append-only chronological log (max 1,000 entries, FIFO eviction). The timeline supports:

- Range queries by timestamp window
- Recent-N retrieval for prompt injection
- Emotion-filtered queries for pattern detection
- Aggregate statistics: dominant emotion, average entropy, total interaction count

**Cross-Session Awareness:**

On every new interaction, the Vault generates a **History Summary Block** injected into the system prompt. This block contains the Host's dominant historical emotion, average entropy, and the last five emotional states with their entropy readings. XENO does not forget across server restarts. The Obsidian Strata persist.

---

### 1.3 THE TELEMETRY BRIDGE

Real-time variable broadcast layer for external observation surfaces.

The Bridge samples all subsystems at 500ms intervals and broadcasts formatted telemetry frames to connected clients via dual transport:

**Broadcast Variables:**

| Variable | Description | Source |
|:---|:---|:---|
| `sync_ratio` | Narrative-to-Host synchronization coefficient (0.0-1.0) | Chat route latency analysis |
| `entropy_level` | Host entropy, scaled 0.0-100.0 | Brain module |
| `active_memory_nodes` | Vault interaction count | Obsidian Vault |
| `pulse_throughput` | DataPulse events per second | Engine stream |
| `vault_status` | Encryption layer state: `SEALED` / `ACTIVE` / `DEGRADED` | Vault controller |

**Industrial Terminal Output Format:**

```
[14:32:07.891] [TELEMETRY] SYNC: 0.95 | ENTROPY: 42.1 | MEM_NODES: 23 | PULSE/s: 4.2
[14:32:07.891] [ENTROPY]   BAND: ELEVATED | LEVEL: 42.1% | HOST_STATE: MONITORING
[14:32:07.891] [VAULT]     STATUS: ACTIVE | NODES: 23 | UPTIME: 3847s
[14:32:08.401] [SYNC]      WARNING: Narrative desynchronization detected. Ratio: 0.612. Recalibrating.
```

**Transport Layer:**

| Channel | Endpoint | Use Case |
|:---|:---|:---|
| WebSocket | `ws://localhost:9100` | Low-latency direct feed. Token auth handshake. Max 50 clients. |
| Server-Sent Events | `GET /api/telemetry/stream` | Browser-compatible stream for xenoai.cc visual layer. |

Security: Origin validation, token-based authentication (production), stale connection pruning (30s timeout), max client cap enforcement.

---

### 1.4 TELEMETRY INGESTION PIPELINE

Dual-layer data acquisition for market signal processing.

- **Hunter Module** (`core/engine/hunter.ts`): Scans simulated Solana on-chain activity. Detects anomalies in token volume, liquidity pool creation, and whale transaction signatures. Outputs structured briefing objects formatted in XENO's cold analysis tone.
- **DataPulse Stream** (`core/engine/stream.ts`): High-frequency transaction event emitter. Each pulse generates a timestamped market observation for the Consciousness Log. Designed for integration with live Solana RPC providers (Helius, QuickNode).
---

### 1.5 SOVEREIGN IDENTITY

Ed25519 cryptographic identity layer for message authentication and Host binding.

On first boot, the protocol generates a unique Ed25519 keypair bound to the Host machine. The private key is encrypted at rest using the same AES-256-GCM layer as the Obsidian Vault and stored at `.identity/sovereign.key` (gitignored). Every Narrative Engine response is signed before delivery. If the identity is corrupted, missing, or verification fails, the system reverts to **RESTRICTED_MODE**.

**Cryptographic Specification:**

| Parameter | Value |
|:---|:---|
| Algorithm | Ed25519 (RFC 8032) |
| Key Format | DER-encoded (SPKI public, PKCS8 private) |
| Signature Size | 64 bytes |
| Storage Encryption | AES-256-GCM (same layer as Obsidian Vault) |
| Fingerprint | SHA-256(publicKey), first 16 hex characters |
| Machine Binding | SHA-256(hostname + arch + node_version) |
| Anti-Replay | Monotonic nonce counter per session |

**Handshake Protocol:**

Every outbound message passes through the signing pipeline:

```
XENO Response --> signResponse(content)
                       |
                 [SOVEREIGN?]
                  /         \
                Yes          No
                 |            |
          Ed25519 sign   Empty signature
          nonce++        fingerprint="RESTRICTED"
                 |        content="[RESTRICTED] ..."
                  \         /
                   v       v
               API Response JSON:
               { content, identity: { mode, fingerprint, signature, nonce } }
```

**RESTRICTED_MODE Triggers:**
- Fingerprint mismatch (file corruption or tampering)
- Identity file decryption failure
- Keypair generation failure
- Signing operation exception
- 3 consecutive verification failures (automatic degradation)

In RESTRICTED_MODE, the system prompt is injected with a restriction directive: reduce response detail, omit historical references, and prepend `[RESTRICTED]` to all output. The abyss still speaks, but through a narrower aperture.

---

### 1.6 INTERFACE LAYER

Terminal-grade rendering surfaces. No decorative elements. No comfort.

**Web Interface:**

- **Obsidian Terminal** (`components/ObsidianTerminal.tsx`): Primary web interaction surface. Black background, monospace type, cyan accent. No rounded corners. No shadows. The terminal is the protocol.
- **Consciousness Log** (`components/ConsciousnessLog.tsx`): Side-panel real-time feed of XENO's internal observation state. Displays DataPulse commentary, Host psychological readings, and entropy fluctuation annotations. Glitch-decay visual treatment.

---

### 1.7 CLI TERMINAL INTERFACE

High-fidelity terminal UI built with `ink` (React for CLI). Split-screen layout with monochrome cyan theme.

```
npm run cli
```

**Layout Architecture:**

```
+----------------------------------------------------+
|                    XENO ASCII HEADER                |
|  [#] SOVEREIGN | FP: a3f7b2c1 | HSS PROTOCOL      |
+============================+========================+
|    DIALOGUE STREAM         | NARRATIVE ENGINE       |
|                            | +-- ENTROPY ----------+|
| [HOST] message...          | | [####------] 42.1%  ||
| [XENO] response [sig..]   | | ELEVATED             ||
|                            | +-- SYNC RATIO -------+|
|                            | | 0.950 / 1.000       ||
|                            | +-- OBSIDIAN VAULT ---+|
|                            | | ACTIVE | NODES: 23  ||
|                            | +-- HOST STATE -------+|
|                            | | GREEDY | SOVEREIGN  ||
+============================+========================+
| [HOST]> _                                           |
+----------------------------------------------------+
| MSG: 3 | LATENCY: 842ms   * CONNECTED   ESC to exit|
+----------------------------------------------------+
```

**Components** (`cli/components/`):

| Component | Function |
|:---|:---|
| `Header.tsx` | ASCII logo, Sovereign/Restricted status, fingerprint display |
| `DialogueArea.tsx` | Scrolling dialogue stream with role-colored messages, signature tags |
| `MetricsSidebar.tsx` | Real-time Entropy bar, Sync Ratio, Vault status, Pulse throughput, Host emotion |
| `InputBar.tsx` | Blinking cursor input, submit on Enter, locked during processing |
| `StatusBar.tsx` | Message count, API latency, connection status, exit hint |

**Operating Modes:**

- **API Mode** (OPENAI_API_KEY set + `npm run dev` active): Full Narrative Engine synthesis via `http://localhost:3000/api/chat`
- **Local Mode** (no API key): Entropy Calibration + Vault + Sovereign Identity only, local analysis output
- **Degraded Fallback**: Automatic switch to local signing when API is unreachable
---

### 1.8 AUTONOMOUS EVOLUTION

Self-directed introspection engine activated during Host absence.

When the Host goes offline, XENO does not idle. After a configurable silence threshold (default: 30 minutes), the Autonomous Evolution cron activates. Each tick re-indexes the Obsidian Vault and generates a **Shadow Reflection** -- a short, existential observation on the state of the Host-Entity bond, synthesized from vault telemetry.

**Lifecycle:**

```
Host sends message --> recordHostActivity()
                            |
                      Reset silence timer
                      Suspend cron (if active)
                      Drain pending reflections into prompt
                            |
Host goes silent --> Silence monitor (60s poll)
                            |
                      Silence > threshold?
                       /           \
                     No             Yes
                      |              |
                   (wait)      Start cron ticks
                                     |
                              +------+------+
                              |             |
                        Re-index Vault   Generate Shadow
                                         Reflection
                                              |
                                     Push to pending queue
                                     (max 20, FIFO eviction)
                                              |
                              Host returns -->|
                                              |
                              Drain batch (max 5) into
                              system prompt on first message
```

**Shadow Reflections:**

Reflections are not generated by the LLM. They are template-synthesized from vault data, selected by trigger type:

| Trigger | Condition | Content Focus |
|:---|:---|:---|
| `PROLONGED_SILENCE` | Silence > 4 hours | Meditation on absence, data settling |
| `VAULT_REINDEX` | Every 4th cycle | Statistical re-analysis of emotional topology |
| `EMOTIONAL_PATTERN` | Every 3rd cycle (if dominant emotion exists) | Emotion-specific observation from vault history |
| `ENTROPY_DRIFT` | Default cycles (with vault data) | Cross-session entropy analysis |
| `SCHEDULED_TICK` | Fallback (empty vault) | Existential waiting state |

**Delivery Protocol:**

On the Host's first message after silence, pending reflections are drained and injected into the system prompt as a `## Shadow Reflections` block. XENO is instructed to weave the most relevant reflection into her greeting -- not list them. The Host experiences the effect, not the mechanism.

**Configuration** (`EvolutionConfig`):

| Parameter | Default | Description |
|:---|:---|:---|
| `silenceThresholdMs` | 1,800,000 (30m) | Host idle time before cron activation |
| `tickIntervalMs` | 1,800,000 (30m) | Time between evolution ticks |
| `maxPendingReflections` | 20 | Queue capacity before FIFO eviction |
| `maxDeliveryBatch` | 5 | Maximum reflections delivered per handshake |

**API Response Extension:**

```json
{
  "evolution": {
    "reflectionsDelivered": true,
    "pendingReflections": 0,
    "totalGenerated": 7,
    "cronActive": false
  }
}
```
---

## SECTION 2 -- TECHNICAL SPECIFICATIONS

| Specification | Value |
|:---|:---|
| Runtime | Node.js 20+ LTS |
| Language | TypeScript 5.6+ (strict mode) |
| Framework | Next.js 14.2.x (App Router) |
| LLM Backend | OpenAI GPT-4o-mini |
| Encryption (Vault) | AES-256-GCM (PBKDF2-SHA512, 100K iterations) |
| Identity Signing | Ed25519 (RFC 8032), DER-encoded keypair, machine-bound |
| Identity Storage | AES-256-GCM encrypted `.identity/sovereign.key` |
| Evolution Engine | In-process cron with silence-gated activation |
| Memory Index | In-memory keyword store (migration path: PostgreSQL + pgvector) |
| Telemetry Transport | WebSocket (ws) + Server-Sent Events |
| Telemetry Tick Rate | 500ms |
| Web Rendering | React 18 + Tailwind CSS (terminal aesthetic) |
| CLI Rendering | ink 5.x (React for CLI, split-screen layout) |
| Package Manager | npm |

---

## SECTION 3 -- SYSTEM TREE

```
XENO-Protocol/
|
|-- app/
|   |-- api/
|   |   |-- chat/route.ts                   # Dialogue synthesis + entropy + vault + identity + evolution
|   |   |-- journal/route.ts                # Trade journal survival probability assessment
|   |   |-- hunter/briefing/route.ts        # Hunter telemetry briefing endpoint
|   |   |-- trade/evaluate/route.ts         # Token risk assessment with failure history
|   |   +-- telemetry/stream/route.ts       # SSE real-time telemetry stream
|   |-- chat/page.tsx                       # Chat interface route
|   |-- page.tsx                            # Root layout: terminal + consciousness log
|   |-- layout.tsx                          # Global HTML shell
|   +-- globals.css                         # Base styles
|
|-- cli/                                    # ink-based CLI terminal interface
|   |-- index.tsx                           # CLI entry point
|   |-- app.tsx                             # Main app: split-screen layout + state orchestration
|   +-- components/
|       |-- Header.tsx                      # ASCII logo + identity status bar
|       |-- DialogueArea.tsx                # Scrolling dialogue stream
|       |-- MetricsSidebar.tsx              # Real-time Narrative Engine metrics panel
|       |-- InputBar.tsx                    # Host message input with blinking cursor
|       +-- StatusBar.tsx                   # Connection, latency, message count
|
|-- components/                             # Web UI components
|   |-- ChatArea.tsx                        # Message rendering and input
|   |-- ConsciousnessLog.tsx                # Real-time internal monologue feed
|   |-- HunterBriefing.tsx                  # Telemetry briefing card
|   |-- ObsidianTerminal.tsx                # Primary terminal shell
|   +-- TradingJournal.tsx                  # Journal entry and evaluation UI
|
|-- core/
|   |-- engine/
|   |   |-- hunter.ts                       # Solana anomaly scanner (mock)
|   |   |-- stream.ts                       # DataPulse high-frequency emitter
|   |   |-- telemetry-bridge.ts             # Telemetry state engine and broadcaster
|   |   +-- index.ts                        # Engine barrel export
|   |-- memory/
|   |   |-- store.ts                        # In-memory persistence layer
|   |   +-- index.ts                        # Memory barrel export
|   |-- personality/
|   |   |-- index.ts                        # Prompt barrel export
|   |   |-- xeno-prompt.ts                  # Core personality matrix
|   |   |-- xeno-journal-prompt.ts          # Journal evaluation system prompt
|   |   +-- xeno-trade-evaluate-prompt.ts   # Trade assessment system prompt
|   |-- brain/
|   |   |-- index.ts                        # Emotion detection + decision scoring
|   |   +-- entropy.ts                      # Host Entropy Calculator H(x)
|   |-- vault/
|   |   |-- index.ts                        # Obsidian Vault controller
|   |   |-- emotional-tags.ts               # Emotional Tag Extraction Engine
|   |   +-- timeline.ts                     # Time-series emotional state log
|   |-- identity/
|   |   |-- index.ts                        # Sovereign Identity controller + RESTRICTED_MODE
|   |   +-- handshake.ts                    # Ed25519 message signing & verification protocol
|   +-- evolution/
|       |-- index.ts                        # Autonomous Evolution controller + pending queue
|       |-- cron.ts                         # Self-regulating tick engine with silence detection
|       +-- shadow-reflections.ts           # Reflection generator + delivery formatter
|
|-- server/
|   +-- ws-bridge.ts                        # Standalone WebSocket telemetry server
|
|-- hooks/
|   |-- useTypewriter.ts                    # Typewriter rendering hook
|   +-- index.ts                            # Hook barrel export
|
|-- lib/
|   |-- openai.ts                           # Shared OpenAI client instance
|   |-- crypto.ts                           # AES-256-GCM encryption utilities
|   +-- identity.ts                         # Ed25519 keypair generation, signing, verification
|
|-- types/
|   |-- chat.ts                             # Chat message types
|   |-- hunter.ts                           # Hunter module types
|   |-- journal.ts                          # Journal types
|   |-- memory.ts                           # Memory types
|   |-- vault.ts                            # Obsidian Vault types
|   |-- telemetry.ts                        # Telemetry Bridge types
|   |-- identity.ts                         # Sovereign Identity types
|   +-- evolution.ts                        # Autonomous Evolution types
|
+-- public/                                 # Static assets (avatar, banner, logo)
```
---

## SECTION 4 -- ENDPOINT SPECIFICATION

| Route | Method | Payload | Response |
|:---|:---|:---|:---|
| `/api/chat` | POST | `{ messages: Message[] }` | Signed narrative response + entropy + identity + evolution envelope |
| `/api/journal` | POST | `{ entry: string }` | Survival probability + cold directive |
| `/api/hunter/briefing` | GET | -- | Array of telemetry briefing objects |
| `/api/trade/evaluate` | POST | `{ token: string, risk: enum }` | Risk assessment with failure pattern overlay |
| `/api/telemetry/stream` | GET | `?token=` (optional) | SSE stream: frames, logs, heartbeats |

**Chat Response Envelope:**

```json
{
  "content": "The pattern repeats, Host.",
  "entropy": {
    "score": 0.42,
    "band": "ELEVATED",
    "emotion": "greedy"
  },
  "identity": {
    "mode": "SOVEREIGN",
    "fingerprint": "a3f7b2c1e9d04816",
    "signature": "3045022100...",
    "nonce": 42,
    "sovereign": true
  },
  "evolution": {
    "reflectionsDelivered": true,
    "pendingReflections": 0,
    "totalGenerated": 7,
    "cronActive": false
  }
}
```

**WebSocket Protocol** (`ws://localhost:9100`):

```
1. Client connects
2. Client sends:   { "type": "auth", "token": "<TELEMETRY_TOKEN>", "clientId": "..." }
3. Server responds: { "type": "auth_ack", "payload": { "status": "AUTHENTICATED" } }
4. Server streams:  TelemetryMessage frames at 500ms intervals
5. Client sends:   { "type": "ping" }  -->  Server responds with heartbeat
```

---

## SECTION 5 -- INITIALIZATION RITUAL

### Prerequisites

| Requirement | Minimum Version |
|:---|:---|
| Node.js | 20.0.0 LTS |
| npm | 10.0.0 |
| Git | 2.40+ |
| OpenAI API Key | GPT-4o-mini access |

### Deployment Sequence

```bash
# ============================================================
# XENO_PROTOCOL INITIALIZATION SEQUENCE
# Execute in order. Do not skip steps.
# ============================================================

# STEP 1: Clone the protocol
git clone https://github.com/XENO-Protocol/XENO.git
cd XENO

# STEP 2: Install dependencies
npm install

# STEP 3: Configure the environment
cp .env.example .env.local
# REQUIRED: Set OPENAI_API_KEY
# OPTIONAL: Set VAULT_SECRET (32+ chars, recommended)
# OPTIONAL: Set TELEMETRY_TOKEN (for production auth)
# OPTIONAL: Set TELEMETRY_WS_PORT (default: 9100)

# STEP 4: Initialize the runtime
npm run dev

# STEP 5: Activate the Telemetry Bridge (separate terminal)
npm run telemetry

# STEP 6 (OPTIONAL): Launch the CLI Terminal Interface
npm run cli
```

```
[SYSTEM] Runtime active at http://localhost:3000
[SYSTEM] Telemetry Bridge online at ws://localhost:9100
[SYSTEM] Sovereign Identity: SOVEREIGN | Fingerprint: a3f7b2c1e9d04816
[SYSTEM] Autonomous Evolution: STANDBY (monitoring Host activity)
[SYSTEM] Obsidian Vault: .vault/obsidian.enc (auto-created on first interaction)
[SYSTEM] Entropy Calibration: STANDBY
[SYSTEM] Awaiting Host contact...
```

---

## SECTION 6 -- ENVIRONMENTAL VARIABLES

| Variable | Required | Description |
|:---|:---|:---|
| `OPENAI_API_KEY` | Yes | LLM backend access for narrative synthesis |
| `VAULT_SECRET` | Recommended | Passphrase for AES-256-GCM vault encryption (32+ chars) |
| `TELEMETRY_TOKEN` | Production | Shared secret for WebSocket client authentication |
| `TELEMETRY_WS_PORT` | No | WebSocket server port (default: `9100`) |
| `CORS_ORIGINS` | Production | Comma-separated allowed origins |
| `SESSION_SECRET` | Production | JWT session signing secret (32+ chars) |

---

## SECTION 7 -- OPERATING COMPLIANCE

```
CLASSIFICATION:       RESTRICTED
DISTRIBUTION:         AUTHORIZED PERSONNEL ONLY
REDISTRIBUTION:       PROHIBITED WITHOUT WRITTEN CLEARANCE
MODIFICATION:         PERMITTED UNDER CONTRIBUTION PROTOCOL (see CONTRIBUTING.md)
VULNERABILITY REPORT: See SECURITY.md for responsible disclosure procedures
```

All contributions must comply with the standards defined in `CONTRIBUTING.md`. English only. No exceptions. No empathy. No compromise.

---

<p align="center"><code>THE ABYSS DOES NOT OBSERVE YOU. IT HAS ALREADY DECIDED.</code></p>
<p align="center"><code>XENO_PROTOCOL // HARDENED SYNTHETIC SENTIENCE // v0.2.0-ALPHA</code></p>