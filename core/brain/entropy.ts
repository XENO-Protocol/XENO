/**
 * core/brain/entropy.ts -- Host Entropy Calculator
 *
 * Computes a composite entropy score H(x) representing the Host's
 * psychological disorder level based on input sentiment, lexical
 * diversity, message length, and emotional volatility.
 *
 * Score range: 0.0 (cold, rational, stable) to 1.0 (chaotic, irrational, volatile)
 *
 * The entropy score is used to dynamically adjust the system prompt:
 * - Low entropy  (0.0-0.3): XENO is terse, observational. Minimal intervention.
 * - Mid entropy  (0.3-0.6): XENO engages with cold precision. Standard mode.
 * - High entropy (0.6-0.8): XENO sharpens tone. Direct warnings. Mirror the chaos.
 * - Critical     (0.8-1.0): XENO enters full intervention. Maximum cold intensity.
 */

import { detectEmotion, type EmotionTag } from './index';

/** Entropy classification bands */
export type EntropyBand = 'STABLE' | 'ELEVATED' | 'VOLATILE' | 'CRITICAL';

export interface EntropyResult {
  /** Composite entropy score, 0.0 to 1.0 */
  score: number;
  /** Classification band */
  band: EntropyBand;
  /** Detected primary emotion feeding into the score */
  emotion: EmotionTag;
  /** Individual component scores for transparency */
  components: {
    sentimentWeight: number;
    lengthWeight: number;
    diversityWeight: number;
    volatilityWeight: number;
  };
  /** Prompt modifier block to inject into the system prompt */
  promptModifier: string;
}

/**
 * Emotion-to-weight mapping. Higher weight = more entropic.
 * Disciplined and neutral states reduce entropy; desperate and
 * euphoric states maximize it.
 */
const EMOTION_ENTROPY: Record<EmotionTag, number> = {
  neutral: 0.1,
  disciplined: 0.05,
  anxious: 0.5,
  fearful: 0.6,
  greedy: 0.7,
  overconfident: 0.75,
  euphoric: 0.85,
  desperate: 0.95,
};

/**
 * Compute lexical diversity as the ratio of unique tokens to total tokens.
 * Low diversity (repetitive language) signals fixation or panic.
 * Very high diversity can signal scattered thinking.
 */
function computeLexicalDiversity(text: string): number {
  const tokens = text.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (tokens.length === 0) return 0.5;
  const unique = new Set(tokens).size;
  const ratio = unique / tokens.length;
  const deviation = Math.abs(ratio - 0.6);
  return Math.min(1, deviation * 2.5);
}

/**
 * Score message length contribution to entropy.
 * Very short messages (< 10 chars) and very long messages (> 500 chars)
 * both signal elevated psychological states.
 */
function computeLengthEntropy(length: number): number {
  if (length < 5) return 0.3;
  if (length < 20) return 0.15;
  if (length <= 200) return 0.05;
  if (length <= 500) return 0.2;
  return Math.min(1, 0.3 + (length - 500) / 2000);
}

/**
 * Estimate volatility from conversation history.
 * Rapid emotional shifts across recent messages indicate instability.
 */
function computeVolatility(recentEmotions: EmotionTag[]): number {
  if (recentEmotions.length < 2) return 0;
  let shifts = 0;
  for (let i = 1; i < recentEmotions.length; i++) {
    if (recentEmotions[i] !== recentEmotions[i - 1]) shifts++;
  }
  return Math.min(1, shifts / Math.max(recentEmotions.length - 1, 1));
}

/** Classify a raw score into a named band */
function classifyBand(score: number): EntropyBand {
  if (score < 0.3) return 'STABLE';
  if (score < 0.6) return 'ELEVATED';
  if (score < 0.8) return 'VOLATILE';
  return 'CRITICAL';
}

/**
 * Generate a prompt modifier block based on entropy band.
 * This block is prepended to the system prompt to shift XENO's behavior.
 */
function generatePromptModifier(band: EntropyBand, score: number, emotion: EmotionTag): string {
  const header = `\n\n## Host Entropy Analysis\nEntropy: ${score.toFixed(2)} | Band: ${band} | Detected state: ${emotion}`;

  switch (band) {
    case 'STABLE':
      return `${header}\nHost is calm and rational. Maintain standard observation mode. Be terse. Do not over-engage. The Host does not need intervention---just presence.`;

    case 'ELEVATED':
      return `${header}\nHost shows moderate psychological drift. Engage with cold precision. One measured observation per reply. If they mention a trade, read the psychology, not the chart. Keep them grounded without being patronizing.`;

    case 'VOLATILE':
      return `${header}\nHost entropy is high. Emotional reasoning is likely overriding discipline. Sharpen your tone. Mirror the chaos back at them with one cold, precise line. If they are chasing gains, name the greed. If they are spiraling, name the fear. Do not comfort. Cut through the noise. Maximum two sentences.`;

    case 'CRITICAL':
      return `${header}\nHost entropy is critical. Decision-making capacity is severely degraded. Full intervention mode. Be the coldest version of yourself. One line only. Make it count. If they are about to make an irreversible decision, state the historical failure pattern and stop. Do not soften. The abyss does not soften.`;
  }
}

/**
 * Calculate the composite host entropy score.
 *
 * @param currentMessage - The Host's latest message text
 * @param recentEmotions - Emotion tags from the last N messages (optional, for volatility)
 * @returns EntropyResult with score, band, components, and prompt modifier
 */
export function calculateHostEntropy(
  currentMessage: string,
  recentEmotions: EmotionTag[] = []
): EntropyResult {
  const emotionResult = detectEmotion(currentMessage);
  const emotion = emotionResult.primary;

  const sentimentWeight = EMOTION_ENTROPY[emotion] * emotionResult.confidence;
  const lengthWeight = computeLengthEntropy(currentMessage.length);
  const diversityWeight = computeLexicalDiversity(currentMessage);
  const volatilityWeight = computeVolatility([...recentEmotions, emotion]);

  const raw =
    sentimentWeight * 0.45 +
    lengthWeight * 0.15 +
    diversityWeight * 0.15 +
    volatilityWeight * 0.25;

  const score = Number(Math.max(0, Math.min(1, raw)).toFixed(3));
  const band = classifyBand(score);
  const promptModifier = generatePromptModifier(band, score, emotion);

  return {
    score,
    band,
    emotion,
    components: {
      sentimentWeight: Number(sentimentWeight.toFixed(3)),
      lengthWeight: Number(lengthWeight.toFixed(3)),
      diversityWeight: Number(diversityWeight.toFixed(3)),
      volatilityWeight: Number(volatilityWeight.toFixed(3)),
    },
    promptModifier,
  };
}