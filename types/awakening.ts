/**
 * types/awakening.ts -- Spontaneous Awakening type definitions.
 *
 * Covers system-level notification events, trigger conditions,
 * and the awakening engine state.
 */

import type { ReflectionTrigger } from './evolution';

/** Significance level that determines whether a notification fires */
export type AwakeningPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** A single awakening event dispatched to the Host */
export interface AwakeningEvent {
  id: string;
  timestamp: number;
  dateISO: string;
  title: string;
  body: string;
  priority: AwakeningPriority;
  reflectionTrigger: ReflectionTrigger;
  silenceDurationMs: number;
  delivered: boolean;
  deliveryError: string | null;
}

/** Runtime state of the awakening engine */
export interface AwakeningState {
  enabled: boolean;
  totalDispatched: number;
  totalFailed: number;
  lastDispatchAt: number | null;
  cooldownMs: number;
  minPriority: AwakeningPriority;
}

/** Configuration for the awakening engine */
export interface AwakeningConfig {
  /** Enable/disable system notifications */
  enabled: boolean;
  /** Minimum priority level to trigger a notification */
  minPriority: AwakeningPriority;
  /** Cooldown between notifications to avoid spamming (ms) */
  cooldownMs: number;
  /** Minimum silence duration before notifications are allowed (ms) */
  minSilenceMs: number;
}