/**
 * core/vault/emotional-tags.ts -- Emotional Tag Extraction Engine
 *
 * Extracts structured emotional tags from the Narrative Engine's output
 * by combining the Brain module's emotion detection with entropy data.
 */

import { detectEmotion, type EmotionTag } from '@/core/brain';
import type { EntropyResult } from '@/core/brain';
import type { EmotionalTag } from '@/types/vault';

/** Narrative tone markers indicating secondary emotional states */
const NARRATIVE_MARKERS: Record<EmotionTag, string[]> = {
  greedy: ['void feeds', 'feeding the void', 'greed', 'chase', 'appetite', 'hunger'],
  fearful: ['fear', 'abyss', 'bleed', 'survive', 'drown', 'darkness'],
  overconfident: ['hubris', 'blind', 'invincible', 'delusion', 'arrogance'],
  desperate: ['burn', 'rekt', 'last', 'nothing left', 'ashes', 'gone'],
  disciplined: ['discipline', 'cold', 'rational', 'sharp', 'edge', 'calculated'],
  anxious: ['hesitat', 'uncertain', 'drift', 'waver', 'unstable'],
  euphoric: ['peak', 'high', 'euphori', 'manic', 'intoxicat'],
  neutral: [],
};

/**
 * Extract secondary emotions from XENO's narrative response.
 */
function extractSecondaryEmotions(
  xenoResponse: string,
  primaryEmotion: EmotionTag
): EmotionTag[] {
  const lower = xenoResponse.toLowerCase();
  const secondary: EmotionTag[] = [];

  for (const [tag, markers] of Object.entries(NARRATIVE_MARKERS) as [EmotionTag, string[]][]) {
    if (tag === primaryEmotion || tag === 'neutral') continue;
    const found = markers.some((m) => lower.includes(m));
    if (found) secondary.push(tag);
  }

  return secondary;
}

/**
 * Build a complete EmotionalTag from a Host input, XENO response, and entropy result.
 *
 * @param hostInput - The Host's raw message text
 * @param xenoResponse - XENO's narrative response
 * @param entropy - The EntropyResult computed for this interaction
 * @returns A fully populated EmotionalTag
 */
export function extractEmotionalTag(
  hostInput: string,
  xenoResponse: string,
  entropy: EntropyResult
): EmotionalTag {
  const emotionResult = detectEmotion(hostInput);
  const secondary = extractSecondaryEmotions(xenoResponse, emotionResult.primary);

  return {
    emotion: emotionResult.primary,
    entropyScore: entropy.score,
    entropyBand: entropy.band,
    secondary,
    triggerKeywords: emotionResult.keywords,
    confidence: emotionResult.confidence,
  };
}