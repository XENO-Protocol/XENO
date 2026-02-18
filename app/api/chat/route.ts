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

const MEMORY_INJECTION_INSTRUCTION = '\nUse these only when they clearly apply to what the Host is saying or doing. Reference them coldly and briefly. Do not list memories; weave at most one into your reply when it fits.';

const identityBootState = initializeIdentity();
console.log('[Chat] Identity boot: mode=' + identityBootState.mode + ' fingerprint=' + identityBootState.fingerprint);

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
    const lastUserContent = messages.filter((m) => m.role === 'user').pop()?.content ?? '';

    // -- Entropy computation --
    const entropy = calculateHostEntropy(lastUserContent, recentEmotions);
    pushEmotion(entropy.emotion);

    // -- Memory retrieval --
    const relevantMemories = getRelevantMemories(lastUserContent, 5);
    const memoryBlock =
      relevantMemories.length > 0
        ? '\n\n## Relevant past experiences with the Host\n' + relevantMemories.map((m) => '- ' + m.content).join('\n') + MEMORY_INJECTION_INSTRUCTION
        : '';

    // -- Vault history (cross-session awareness) --
    const vaultHistory = getVaultHistorySummary(5);
    const vaultBlock = vaultHistory ? '\n\n' + vaultHistory : '';

    // -- Identity prompt modifier (RESTRICTED_MODE injection if degraded) --
    const identityModifier = getIdentityPromptModifier();

    // -- Dynamic prompt compilation --
    const systemContent =
      XENO_SYSTEM_PROMPT +
      entropy.promptModifier +
      identityModifier +
      vaultBlock +
      memoryBlock;

    const fullMessages = [
      { role: 'system' as const, content: systemContent },
      ...messages,
    ];

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

    // -- Persist to Obsidian Vault --
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
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Chat failed' },
      { status: 500 }
    );
  }
}