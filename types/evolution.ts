/**
 * types/evolution.ts -- Autonomous Evolution type definitions.
 *
 * Covers Shadow Reflections, evolution cycle state,
 * and the pending reflection queue for handshake delivery.
 */

import type { EmotionTag, EntropyBand } from '@/core/brain';

/** A single Shadow Reflection generated during Host absence */
export interface ShadowReflection {
  id: string;
  timestamp: number;
  dateISO: string;
  content: string;
  trigger: ReflectionTrigger;
  vaultSnapshot: {
    totalInteractions: number;
    dominantEmotion: EmotionTag | null;
    averageEntropy: number;
    lastHostContact: number;
    silenceDurationMs: number;
  };
  delivered: boolean;
}

/** What triggered this particular reflection */
export type ReflectionTrigger =
  | 'SCHEDULED_TICK'
  | 'ENTROPY_DRIFT'
  | 'EMOTIONAL_PATTERN'
  | 'PROLONGED_SILENCE'
  | 'VAULT_REINDEX';

/** State of the autonomous evolution engine */
export interface EvolutionState {
  active: boolean;
  lastTickAt: number | null;
  lastHostContact: number;
  totalReflectionsGenerated: number;
  pendingReflections: number;
  cycleCount: number;
  silenceThresholdMs: number;
  tickIntervalMs: number;
}

/** Configuration for the evolution cron */
export interface EvolutionConfig {
  /** How long the Host must be silent before evolution begins (ms) */
  silenceThresholdMs: number;
  /** Interval between evolution ticks (ms) */
  tickIntervalMs: number;
  /** Maximum pending reflections before oldest are pruned */
  maxPendingReflections: number;
  /** Maximum reflections to deliver per handshake */
  maxDeliveryBatch: number;
}