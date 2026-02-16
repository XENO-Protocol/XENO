import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { XENO_SYSTEM_PROMPT } from '@/core/personality';
import { getRelevantMemories } from '@/core/memory';
import { calculateHostEntropy, type EmotionTag } from '@/core/brain';

const MEMORY_INJECTION_INSTRUCTION = `
Use these only when they clearly apply to what the Host is saying or doing. Reference them coldly and briefly---e.g. "Last time you bought a cat-themed meme coin, you lost 20%. Are we repeating history, Host?" Do not list memories; weave at most one into your reply when it fits.`;

/**
 * In-memory sliding window of recent Host emotion states.
 * Used by the entropy calculator to detect emotional volatility.
 * Capped at 8 entries; oldest evicted on overflow.
 */
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

    // -- Entropy computation --
    const entropy = calculateHostEntropy(lastUserContent, recentEmotions);
    pushEmotion(entropy.emotion);

    // -- Memory retrieval --
    const relevantMemories = getRelevantMemories(lastUserContent, 5);

    const memoryBlock =
      relevantMemories.length > 0
        ? `\n\n## Relevant past experiences with the Host\n${relevantMemories.map((m) => `- ${m.content}`).join('\n')}${MEMORY_INJECTION_INSTRUCTION}`
        : '';

    // -- Dynamic prompt compilation --
    // Base prompt + entropy modifier + memory context
    const systemContent =
      XENO_SYSTEM_PROMPT +
      entropy.promptModifier +
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

    return NextResponse.json({
      content,
      entropy: {
        score: entropy.score,
        band: entropy.band,
        emotion: entropy.emotion,
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