/**
 * core/brain 鈥?Behavioral analysis utilities.
 * Provides lightweight heuristic functions for emotion detection
 * and decision-quality scoring without requiring LLM calls.
 */

export type EmotionTag =
  | 'neutral'
  | 'greedy'
  | 'fearful'
  | 'overconfident'
  | 'desperate'
  | 'disciplined'
  | 'anxious'
  | 'euphoric';

interface EmotionResult {
  primary: EmotionTag;
  confidence: number; // 0-1
  keywords: string[];
}

const EMOTION_LEXICON: Record<EmotionTag, string[]> = {
  greedy: ['moon', 'lambo', '100x', 'all in', 'yolo', 'ape', 'fomo', 'pump', 'rich', 'diamond hands'],
  fearful: ['crash', 'dump', 'rug', 'scam', 'lost', 'scared', 'worried', 'bleeding', 'red', 'down bad'],
  overconfident: ['easy', 'guaranteed', 'cant lose', 'free money', 'obvious', 'sure thing', 'no brainer'],
  desperate: ['please', 'help', 'need', 'last chance', 'everything', 'broke', 'rekt', 'done', 'finished'],
  disciplined: ['plan', 'stop loss', 'risk', 'position size', 'exit', 'strategy', 'manage', 'cut', 'ratio'],
  anxious: ['maybe', 'unsure', 'dont know', 'should i', 'what if', 'nervous', 'cant sleep', 'stress'],
  euphoric: ['lets go', 'amazing', 'incredible', 'best', 'winning', 'profit', 'made it', 'genius'],
  neutral: [],
};

/**
 * Detect the dominant emotional state from raw text input.
 * Uses keyword intersection scoring against a fixed lexicon.
 */
export function detectEmotion(text: string): EmotionResult {
  const lower = text.toLowerCase();
  const scores: { tag: EmotionTag; score: number; matched: string[] }[] = [];

  for (const [tag, keywords] of Object.entries(EMOTION_LEXICON) as [EmotionTag, string[]][]) {
    if (tag === 'neutral') continue;
    const matched = keywords.filter((kw) => lower.includes(kw));
    if (matched.length > 0) {
      scores.push({ tag, score: matched.length, matched });
    }
  }

  if (scores.length === 0) {
    return { primary: 'neutral', confidence: 0.5, keywords: [] };
  }

  scores.sort((a, b) => b.score - a.score);
  const top = scores[0];
  const totalKeywords = Object.values(EMOTION_LEXICON).flat().length;
  const confidence = Math.min(1, 0.4 + (top.score / Math.max(totalKeywords * 0.1, 1)) * 0.6);

  return { primary: top.tag, confidence: Number(confidence.toFixed(2)), keywords: top.matched };
}

/**
 * Score the quality of a trading decision description.
 * Higher score = more disciplined / rational indicators found.
 * Returns 0-100.
 */
export function scoreDecisionQuality(text: string): number {
  const lower = text.toLowerCase();
  const positiveSignals = ['stop loss', 'take profit', 'risk reward', 'position size', 'exit plan', 'strategy', 'manage risk', 'cut loss', 'discipline'];
  const negativeSignals = ['yolo', 'all in', 'no plan', 'fomo', 'ape', 'hope', 'pray', 'gambling', 'revenge trade'];

  let score = 50;
  for (const s of positiveSignals) {
    if (lower.includes(s)) score += 6;
  }
  for (const s of negativeSignals) {
    if (lower.includes(s)) score -= 8;
  }

  return Math.max(0, Math.min(100, score));
}