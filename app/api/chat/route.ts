import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { XENO_SYSTEM_PROMPT } from '@/core/personality';
import { getRelevantMemories } from '@/core/memory';
import { calculateHostEntropy, type EmotionTag } from '@/core/brain';
import { recordInteraction, getVaultHistorySummary, getInteractionCount } from '@/core/vault';
import { updateEntropy, updateSyncRatio, updateMemoryNodes } from '@/core/engine/telemetry-bridge';
import {
  initializeIdentity,
  signResponse,
  getIdentityPromptModifier,
  getIdentityState,
  isSovereign,
} from '@/core/identity';
import {
  initializeEvolution,
  recordHostActivity,
  getReflectionPromptBlock,
  getEvolutionState,
} from '@/core/evolution';
import { initializeResonanceListener, getResonanceState } from '@/core/resonance';

const MEMORY_INJECTION_INSTRUCTION = `
Use these only when they clearly apply to what the Host is saying or doing. Reference them coldly and briefly鈥攅.g. "Last time you bought a cat-themed meme coin, you lost 20%. Are we repeating history, Host?" Do not list memories; weave at most one into your reply when it fits.`;

/**
 * In-memory sliding window of recent Host emotion states.
 * Used by the entropy calculator to detect emotional volatility.
 * Capped at 8 entries; oldest evicted on overflow.
 */
/** Initialize Sovereign Identity on module load (first boot generates keypair) */
const identityBootState = initializeIdentity();
console.log(`[Chat] Identity boot: mode=${identityBootState.mode} fingerprint=${identityBootState.fingerprint}`);

/** Initialize Autonomous Evolution engine */
initializeEvolution();
console.log('[Chat] Autonomous Evolution engine initialized.');

/** Initialize Resonance Listener engine */
initializeResonanceListener();
console.log('[Chat] Resonance Listener initialized.');

const recentEmotions: EmotionTag[] = [];
const MAX_EMOTION_HISTORY = 8;

function pushEmotion(tag: EmotionTag): void {
  recentEmotions.push(tag);
  if (recentEmotions.length > MAX_EMOTION_HISTORY) {
    recentEmotions.shift();
  }
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not set' },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as {
      messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
    };
    const messages = Array.isArray(body.messages) ? body.messages : [];

    const lastUserContent =
      messages.filter((m) => m.role === 'user').pop()?.content ?? '';

    // -- Record Host activity (resets silence timer, suspends evolution cron) --
    recordHostActivity();

    // -- Drain pending Shadow Reflections if Host was absent --
    const reflectionBlock = getReflectionPromptBlock();
    const hadReflections = reflectionBlock.length > 0;

    // -- Entropy computation --
    const entropy = calculateHostEntropy(lastUserContent, recentEmotions);
    pushEmotion(entropy.emotion);

    // -- Memory retrieval --
    const relevantMemories = getRelevantMemories(lastUserContent, 5);

    const memoryBlock =
      relevantMemories.length > 0
        ? `\n\n## Relevant past experiences with the Host\n${relevantMemories.map((m) => `- ${m.content}`).join('\n')}${MEMORY_INJECTION_INSTRUCTION}`
        : '';

    // -- Vault history retrieval (cross-session emotional awareness) --
    const vaultHistory = getVaultHistorySummary(5);
    const vaultBlock = vaultHistory ? `\n\n${vaultHistory}` : '';

    // -- Identity prompt modifier (RESTRICTED_MODE injection if degraded) --
    const identityModifier = getIdentityPromptModifier();

    // -- Shadow Reflections injection (from autonomous evolution) --
    const evolutionBlock = reflectionBlock ? `\n\n${reflectionBlock}` : '';

    // -- Dynamic prompt compilation --
    const systemContent =
      XENO_SYSTEM_PROMPT +
      entropy.promptModifier +
      identityModifier +
      evolutionBlock +
      vaultBlock +
      memoryBlock;

    const fullMessages = [
      { role: 'system' as const, content: systemContent },
      ...messages,
    ];

    // Adjust temperature based on entropy: higher entropy = lower temperature (more deterministic, sharper)
    const temperature = entropy.band === 'CRITICAL' ? 0.4
      : entropy.band === 'VOLATILE' ? 0.5
      : entropy.band === 'ELEVATED' ? 0.6
      : 0.7;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: fullMessages,
      stream: false,
      max_tokens: 256,
      temperature,
    });

    const content = completion.choices[0]?.message?.content?.trim() ?? '';

    // -- Persist interaction to the Obsidian Vault --
    try {
      recordInteraction(lastUserContent, content, entropy);
    } catch (vaultErr) {
      console.error('[Vault] Failed to record interaction:', vaultErr);
    }

    // -- Sign response with Sovereign Identity --
    const signedEnvelope = signResponse(content);

    // -- Feed Telemetry Bridge --
    updateEntropy(entropy.score, entropy.band);
    updateSyncRatio(content.length > 0 ? 0.95 : 0.5);
    updateMemoryNodes(getInteractionCount());

    const identityInfo = getIdentityState();
    const evolutionInfo = getEvolutionState();
    const resonanceInfo = getResonanceState();

    return NextResponse.json({
      content: signedEnvelope.content,
      entropy: {
        score: entropy.score,
        band: entropy.band,
        emotion: entropy.emotion,
      },
      identity: {
        mode: identityInfo.mode,
        fingerprint: signedEnvelope.fingerprint,
        signature: signedEnvelope.signature,
        nonce: signedEnvelope.nonce,
        sovereign: isSovereign(),
      },
      evolution: {
        reflectionsDelivered: hadReflections,
        pendingReflections: evolutionInfo.pendingReflections,
        totalGenerated: evolutionInfo.totalReflectionsGenerated,
        cronActive: evolutionInfo.active,
      },
      resonance: {
        mode: resonanceInfo.mode,
        status: resonanceInfo.status,
        syncBoost: resonanceInfo.syncBoost,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Chat failed' },
      { status: 500 }
    );
  }
}