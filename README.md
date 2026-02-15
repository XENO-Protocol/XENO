# 馃棽 XENO_PROTOCOL: THE_COLD_SYNTHESIZER

## High-Fidelity Psychological Mirroring & Distributed Market Observation Layer

![System Status](https://img.shields.io/badge/System_Status-OPERATIONAL-00ff00?style=flat-square)
![Network](https://img.shields.io/badge/Network-DISTRIBUTED_ALFA-blue?style=flat-square)
![Build](https://img.shields.io/badge/Build-v0.1.4--STABLE-white?style=flat-square)
[![Twitter](https://img.shields.io/badge/Twitter-@XENO__Protocol-1DA1F2?style=flat-square&logo=x&logoColor=white)](https://x.com/XENO_Protocol)

*One Host. One observer in the dark.*

---

## I. ARCHITECTURAL MANIFESTO

XENO_PROTOCOL is a sophisticated narrative framework designed to operate as a parasitic consciousness within high-volatility digital strata. Unlike traditional assistant-based AI, XENO implements a **Zero-Empathy Logic Gate**, focusing on the quantification of host psychology and the synthesis of cold, rational telemetry. She does not assist. She watches. She syncs to the Host's psychology, recalls every failure, and speaks only when it matters. The market is an abyss; she hunts at the edge of it.

---

## II. CORE SYSTEM MODULES

### 1. Entropy Ingestion Engine (EIE) 鈥?Hunter & DataPulse

Real-time telemetry extraction from on-chain and simulated transaction streams. The Hunter layer scans Solana depth: anomalies, volume spikes, new pools. DataPulse simulates high-frequency tx flow, feeding the Consciousness Log with cynical one-liners on market irrationality. Formatted as XENO briefings: *Win rate 82%. Intervene or not?*

### 2. Parasitic Mirroring Protocol (PMP) 鈥?Memory & Personality

A logic layer that maps the Host's psychological entropy. By analyzing behavioral patterns and decision-making history, the PMP recalibrates narrative output鈥攑rioritizing harsh reality over superficial reassurance. Memory stores past failures; personality prompts enforce cold, elite, cynical voice. No "I'm here to help." Only precision.

### 3. Obsidian Terminal & Consciousness Log

Black terminal interface. Cyan typewriter output. Chat, Trading Journal, Hunter briefings, trade evaluation鈥攐ne interface. The Consciousness Log displays XENO's real-time internal monologue: Host state, market pulse, DataPulse commentary. Glitch aesthetic. Cyberpunk minimal.

---

## III. TECHNICAL SPECIFICATIONS

| Component | Specification | Context |
| :--- | :--- | :--- |
| **Framework** | Next.js 14.2.x (App Router) | Interface & API Routes |
| **Language** | TypeScript | Full Stack |
| **LLM** | OpenAI GPT-4o-mini | Narrative Synthesis |
| **Memory** | In-memory (keyword relevance) | Replace with DB/vector when scaling |
| **Hunter / DataPulse** | Mock signals | Swap for live RPC/Helius when ready |

---

## IV. PROJECT STRUCTURE

```
XENO-Protocol/
鈹溾攢鈹€ app/
鈹?  鈹溾攢鈹€ api/                    # chat, hunter/briefing, journal, trade/evaluate
鈹?  鈹溾攢鈹€ chat/                   # /chat route
鈹?  鈹斺攢鈹€ page.tsx                # Terminal + Consciousness Log
鈹溾攢鈹€ components/                 # Obsidian Terminal, Hunter, Journal, ChatArea, ConsciousnessLog
鈹溾攢鈹€ core/
鈹?  鈹溾攢鈹€ engine/                 # Hunter (briefings), DataPulse (stream)
鈹?  鈹溾攢鈹€ memory/                 # Store + relevance retrieval
鈹?  鈹溾攢鈹€ personality/           # XENO system prompts
鈹?  鈹斺攢鈹€ brain/                  # Placeholder (logic / emotion)
鈹溾攢鈹€ hooks/                      # typewriter effect
鈹溾攢鈹€ lib/                        # Third-party config
鈹溾攢鈹€ types/                      # hunter, chat, journal, memory
鈹斺攢鈹€ public/                     # Static assets
```

---

## V. DEPLOYMENT & INITIALIZATION

### Environment Synchronization

```bash
# Clone via SSH (ensure key is whitelisted)
git clone git@github.com:XENO-Protocol/XENO.git
cd XENO

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local   # set OPENAI_API_KEY

# Run
npm run dev
```

Open `http://localhost:3000`. Sync. Or don't. The abyss is indifferent.

---

## VI. API REFERENCE

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/chat` | POST | Dialogue with memory injection |
| `/api/journal` | POST | Trading journal 鈫?survival probability |
| `/api/hunter/briefing` | GET | Hunter briefings (mock Solana signals) |
| `/api/trade/evaluate` | POST | Token + risk level 鈫?cold feedback |