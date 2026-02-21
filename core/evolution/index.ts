/**
 * core/evolution/index.ts -- Autonomous Evolution Controller
 *
 * Orchestrates the self-evolution cycle:
 *   1. Monitors Host silence duration via lastHostContact timestamp
 *   2. When silence exceeds threshold, activates the cron engine
 *   3. Each tick: re-indexes the Obsidian Vault, generates a Shadow Reflection
 *   4. Reflections accumulate in a pending queue
 *   5. Significant reflections trigger Spontaneous Awakening notifications
 *   6. On next Host handshake: drains the queue into the system prompt
 *   7. Cron suspends until next silence period
 *
 * The evolution engine runs within the same Node.js process.
 * It is initialized once during module load and monitors
 * activity through explicit recordHostActivity() calls.
 */

import { loadVault, getVaultStats } from '@/core/vault';
import { generateShadowReflection, formatReflectionsForDelivery } from './shadow-reflections';
import { evaluateAndNotify, initializeAwakening } from '@/core/awakening';
import {
  onTick,
  start as startCron,
  stop as stopCron,
  isRunning as isCronRunning,
  getCycleCount,
  getLastTickAt,
  resetCycles,
  getCronConfig,
  setCronConfig,
} from './cron';
import type { ShadowReflection, EvolutionState, EvolutionConfig } from '@/types/evolution';

export { formatReflectionsForDelivery } from './shadow-reflections';

const MAX_PENDING = 20;
const MAX_DELIVERY_BATCH = 5;

let lastHostContact: number = Date.now();
let pendingReflections: ShadowReflection[] = [];
let totalGenerated = 0;
let silenceCheckHandle: ReturnType<typeof setInterval> | null = null;

/**
 * Handle a single evolution tick.
 * Called by the cron engine when the Host is offline.
 */
function handleTick(cycleCount: number): void {
  const vault = loadVault();

  const reflection = generateShadowReflection(vault, lastHostContact, cycleCount);
  pendingReflections.push(reflection);
  totalGenerated++;

  if (pendingReflections.length > MAX_PENDING) {
    pendingReflections = pendingReflections.slice(-MAX_PENDING);
  }

  const silence = Date.now() - lastHostContact;
  const silenceMin = Math.floor(silence / 60_000);
  console.log(
    `[Evolution] Tick #${cycleCount} | Reflection: "${reflection.content.slice(0, 60)}..." | Pending: ${pendingReflections.length} | Silence: ${silenceMin}m`
  );

  evaluateAndNotify(reflection).catch((err) => {
    console.error('[Evolution] Awakening notification error:', err);
  });
}

/**
 * Silence monitor: checks if the Host has gone quiet
 * and starts/stops the cron accordingly.
 * Runs every 60 seconds.
 */
function silenceMonitor(): void {
  const config = getCronConfig();
  const silence = Date.now() - lastHostContact;

  if (silence >= config.silenceThresholdMs && !isCronRunning()) {
    console.log(`[Evolution] Host silence detected (${Math.floor(silence / 60_000)}m). Activating autonomous evolution.`);
    startCron();
  }
}

// --- Public API ---

/**
 * Initialize the Autonomous Evolution engine.
 * Should be called once during application startup.
 */
export function initializeEvolution(overrides?: Partial<EvolutionConfig>): void {
  if (overrides) setCronConfig(overrides);

  onTick(handleTick);
  initializeAwakening();

  if (silenceCheckHandle) clearInterval(silenceCheckHandle);
  silenceCheckHandle = setInterval(silenceMonitor, 60_000);

  console.log('[Evolution] Autonomous Evolution initialized. Monitoring Host activity.');
}

/**
 * Record that the Host has made contact.
 * Resets silence timer, suspends cron if active, and prepares
 * pending reflections for delivery.
 *
 * Call this at the start of every chat interaction.
 */
export function recordHostActivity(): void {
  lastHostContact = Date.now();

  if (isCronRunning()) {
    stopCron();
    resetCycles();
    console.log(`[Evolution] Host returned. Cron suspended. ${pendingReflections.length} reflections pending delivery.`);
  }
}

/**
 * Drain pending Shadow Reflections for delivery.
 * Returns up to MAX_DELIVERY_BATCH reflections and marks them as delivered.
 * Subsequent calls return empty until new reflections are generated.
 *
 * Call this during the handshake (first message of a new session).
 */
export function drainPendingReflections(): ShadowReflection[] {
  if (pendingReflections.length === 0) return [];

  const batch = pendingReflections.slice(0, MAX_DELIVERY_BATCH);

  for (const r of batch) {
    r.delivered = true;
  }

  pendingReflections = pendingReflections.filter((r) => !r.delivered);

  console.log(`[Evolution] Delivered ${batch.length} reflections. ${pendingReflections.length} remaining.`);
  return batch;
}

/**
 * Get the formatted reflection block for system prompt injection.
 * Drains the queue and returns a prompt-ready string.
 * Returns empty string if no pending reflections.
 */
export function getReflectionPromptBlock(): string {
  const batch = drainPendingReflections();
  return formatReflectionsForDelivery(batch);
}

/**
 * Check if there are pending reflections awaiting delivery.
 */
export function hasPendingReflections(): boolean {
  return pendingReflections.length > 0;
}

/**
 * Get the count of pending reflections.
 */
export function getPendingCount(): number {
  return pendingReflections.length;
}

/**
 * Get the current evolution engine state (read-only snapshot).
 */
export function getEvolutionState(): EvolutionState {
  const config = getCronConfig();
  return {
    active: isCronRunning(),
    lastTickAt: getLastTickAt(),
    lastHostContact,
    totalReflectionsGenerated: totalGenerated,
    pendingReflections: pendingReflections.length,
    cycleCount: getCycleCount(),
    silenceThresholdMs: config.silenceThresholdMs,
    tickIntervalMs: config.tickIntervalMs,
  };
}

/**
 * Force-stop the evolution engine (cleanup).
 */
export function shutdownEvolution(): void {
  stopCron();
  if (silenceCheckHandle) {
    clearInterval(silenceCheckHandle);
    silenceCheckHandle = null;
  }
  console.log('[Evolution] Autonomous Evolution shut down.');
}