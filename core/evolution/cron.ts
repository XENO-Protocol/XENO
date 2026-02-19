/**
 * core/evolution/cron.ts -- Autonomous Evolution Tick Engine
 *
 * A self-regulating interval timer that activates when the Host
 * goes offline. After the silence threshold is exceeded, the engine
 * begins periodic ticks: re-indexing the Obsidian Vault and
 * generating Shadow Reflections.
 *
 * The cron is not a system-level scheduler. It runs within the
 * Node.js process via setInterval, gated by Host activity timestamps.
 * It self-suspends when the Host returns and resumes when silence
 * is detected again.
 *
 * Tick cadence: configurable, default 30 minutes.
 * Silence threshold: configurable, default 30 minutes.
 */

import type { EvolutionConfig } from '@/types/evolution';

export type TickCallback = (cycleCount: number) => void;

interface CronState {
  intervalHandle: ReturnType<typeof setInterval> | null;
  running: boolean;
  cycleCount: number;
  lastTickAt: number | null;
}

const state: CronState = {
  intervalHandle: null,
  running: false,
  cycleCount: 0,
  lastTickAt: null,
};

let tickCallback: TickCallback | null = null;
let config: EvolutionConfig = {
  silenceThresholdMs: 30 * 60_000,
  tickIntervalMs: 30 * 60_000,
  maxPendingReflections: 20,
  maxDeliveryBatch: 5,
};

/**
 * Register the function to call on each evolution tick.
 * The controller (index.ts) provides this callback.
 */
export function onTick(cb: TickCallback): void {
  tickCallback = cb;
}

/**
 * Update the cron configuration at runtime.
 */
export function setCronConfig(partial: Partial<EvolutionConfig>): void {
  config = { ...config, ...partial };

  if (state.running) {
    stop();
    start();
  }
}

/**
 * Get the current cron configuration (read-only copy).
 */
export function getCronConfig(): EvolutionConfig {
  return { ...config };
}

/**
 * Start the evolution tick engine.
 * Idempotent: calling start() when already running is a no-op.
 */
export function start(): void {
  if (state.running) return;

  state.running = true;
  console.log(`[Evolution] Cron started. Tick interval: ${config.tickIntervalMs / 60_000}m`);

  state.intervalHandle = setInterval(() => {
    state.cycleCount++;
    state.lastTickAt = Date.now();

    if (tickCallback) {
      try {
        tickCallback(state.cycleCount);
      } catch (err) {
        console.error('[Evolution] Tick callback error:', err);
      }
    }
  }, config.tickIntervalMs);
}

/**
 * Stop the evolution tick engine.
 */
export function stop(): void {
  if (!state.running || !state.intervalHandle) return;

  clearInterval(state.intervalHandle);
  state.intervalHandle = null;
  state.running = false;
  console.log(`[Evolution] Cron stopped after ${state.cycleCount} cycles.`);
}

/**
 * Check if the cron is actively ticking.
 */
export function isRunning(): boolean {
  return state.running;
}

/**
 * Get the current cycle count.
 */
export function getCycleCount(): number {
  return state.cycleCount;
}

/**
 * Get the timestamp of the last tick (null if no ticks yet).
 */
export function getLastTickAt(): number | null {
  return state.lastTickAt;
}

/**
 * Reset cycle counter (used on Host reconnection).
 */
export function resetCycles(): void {
  state.cycleCount = 0;
}