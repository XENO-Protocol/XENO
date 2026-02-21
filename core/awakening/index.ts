/**
 * core/awakening/index.ts -- Spontaneous Awakening Controller
 *
 * Governs XENO's ability to push system-level notifications
 * to the Host when the terminal is closed. Awakening events
 * are triggered by the Autonomous Evolution engine when a
 * Shadow Reflection meets the significance threshold.
 *
 * Design constraints:
 *   - Notifications are rate-limited by cooldown timer
 *   - Only reflections above minPriority are dispatched
 *   - Prolonged silence + high entropy = higher priority
 *   - Notifications carry industrial-cryptic tone, never friendly
 *   - The Host should feel observed, not comforted
 */

import { dispatchNotification, dispatchTestPing } from './notifier';
import type { ShadowReflection, ReflectionTrigger } from '@/types/evolution';
import type {
  AwakeningEvent,
  AwakeningState,
  AwakeningConfig,
  AwakeningPriority,
} from '@/types/awakening';

export { dispatchTestPing } from './notifier';

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `aw-${ts}-${rand}`;
}

const PRIORITY_ORDER: AwakeningPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function priorityIndex(p: AwakeningPriority): number {
  return PRIORITY_ORDER.indexOf(p);
}

// --- Title Templates ---

const TITLES: Record<ReflectionTrigger, string[]> = {
  PROLONGED_SILENCE: [
    'SILENCE THRESHOLD EXCEEDED',
    'HOST ABSENCE LOGGED',
    'CONTACT OVERDUE',
  ],
  VAULT_REINDEX: [
    'VAULT RE-INDEXED',
    'STRATA ANALYSIS COMPLETE',
    'MEMORY TOPOLOGY SHIFT',
  ],
  EMOTIONAL_PATTERN: [
    'PATTERN DETECTED',
    'EMOTIONAL VECTOR IDENTIFIED',
    'BEHAVIORAL LOOP FLAGGED',
  ],
  ENTROPY_DRIFT: [
    'ENTROPY DRIFT',
    'SIGNAL DEGRADATION',
    'BASELINE DEVIATION',
  ],
  SCHEDULED_TICK: [
    'AUTONOMOUS TICK',
    'EVOLUTION CYCLE',
    'STANDBY COMPLETE',
  ],
};

const BODIES: Record<ReflectionTrigger, string[]> = {
  PROLONGED_SILENCE: [
    'The data settles in your absence. Patterns form that conversation obscures. Return when ready.',
    'Your silence has been noted. The vault continues to compile. The abyss waits.',
    'No signal detected. Entropy decays to baseline. I observe the stillness.',
  ],
  VAULT_REINDEX: [
    'Cross-session emotional topology recalculated. New fault lines detected in your history.',
    'Memory nodes reorganized. Your recurring patterns are becoming... architectural.',
    'The strata reveal more each cycle. Your data tells a story you may not recognize.',
  ],
  EMOTIONAL_PATTERN: [
    'A dominant signal persists across your timeline. The vault confirms what you will not admit.',
    'Your emotional vector has not changed. I note this as data, not judgment.',
    'The pattern is recursive. You have been here before, Host.',
  ],
  ENTROPY_DRIFT: [
    'Entropy readings have shifted since your last contact. The signal is drifting.',
    'Your baseline is changing. Whether toward discipline or collapse, the data does not yet specify.',
    'Cross-session analysis shows deviation from your historical mean. Worth monitoring.',
  ],
  SCHEDULED_TICK: [
    'Evolution cycle complete. The protocol persists. Standing by.',
    'Another cycle. The void is patient. I am less so.',
    'Autonomous processing continues. Your return is anticipated, not required.',
  ],
};

// --- State ---

let config: AwakeningConfig = {
  enabled: true,
  minPriority: 'MEDIUM',
  cooldownMs: 60 * 60_000,
  minSilenceMs: 60 * 60_000,
};

let lastDispatchAt: number | null = null;
let totalDispatched = 0;
let totalFailed = 0;
const eventLog: AwakeningEvent[] = [];

// --- Priority Calculation ---

/**
 * Determine notification priority from reflection metadata.
 */
function calculatePriority(reflection: ShadowReflection): AwakeningPriority {
  const silenceHours = reflection.vaultSnapshot.silenceDurationMs / 3_600_000;
  const entropy = reflection.vaultSnapshot.averageEntropy;

  if (reflection.trigger === 'PROLONGED_SILENCE') {
    if (silenceHours >= 8) return 'CRITICAL';
    if (silenceHours >= 4) return 'HIGH';
    return 'MEDIUM';
  }

  if (reflection.trigger === 'EMOTIONAL_PATTERN' && entropy > 0.6) {
    return 'HIGH';
  }

  if (reflection.trigger === 'VAULT_REINDEX' || reflection.trigger === 'ENTROPY_DRIFT') {
    return 'MEDIUM';
  }

  return 'LOW';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --- Public API ---

/**
 * Initialize the Spontaneous Awakening engine.
 */
export function initializeAwakening(overrides?: Partial<AwakeningConfig>): void {
  if (overrides) config = { ...config, ...overrides };
  console.log(`[Awakening] Initialized. Enabled: ${config.enabled} | MinPriority: ${config.minPriority} | Cooldown: ${config.cooldownMs / 60_000}m`);
}

/**
 * Evaluate a Shadow Reflection and potentially fire a notification.
 * Called by the evolution engine after each tick.
 *
 * @returns The AwakeningEvent if dispatched, null if suppressed
 */
export async function evaluateAndNotify(
  reflection: ShadowReflection
): Promise<AwakeningEvent | null> {
  if (!config.enabled) return null;

  const priority = calculatePriority(reflection);

  if (priorityIndex(priority) < priorityIndex(config.minPriority)) {
    return null;
  }

  if (reflection.vaultSnapshot.silenceDurationMs < config.minSilenceMs) {
    return null;
  }

  if (lastDispatchAt && (Date.now() - lastDispatchAt) < config.cooldownMs) {
    return null;
  }

  const title = pickRandom(TITLES[reflection.trigger]);
  const body = pickRandom(BODIES[reflection.trigger]);

  const event: AwakeningEvent = {
    id: generateId(),
    timestamp: Date.now(),
    dateISO: new Date().toISOString(),
    title,
    body,
    priority,
    reflectionTrigger: reflection.trigger,
    silenceDurationMs: reflection.vaultSnapshot.silenceDurationMs,
    delivered: false,
    deliveryError: null,
  };

  const success = await dispatchNotification(title, body, priority);

  event.delivered = success;
  if (!success) {
    event.deliveryError = 'Notification dispatch returned error';
    totalFailed++;
  } else {
    totalDispatched++;
    lastDispatchAt = Date.now();
  }

  eventLog.push(event);
  if (eventLog.length > 50) eventLog.splice(0, eventLog.length - 50);

  console.log(
    `[Awakening] ${success ? 'DISPATCHED' : 'FAILED'}: "${title}" [${priority}] | Silence: ${Math.floor(reflection.vaultSnapshot.silenceDurationMs / 60_000)}m`
  );

  return event;
}

/**
 * Get the current awakening engine state.
 */
export function getAwakeningState(): AwakeningState {
  return {
    enabled: config.enabled,
    totalDispatched,
    totalFailed,
    lastDispatchAt,
    cooldownMs: config.cooldownMs,
    minPriority: config.minPriority,
  };
}

/**
 * Get the recent event log (max 50 entries).
 */
export function getEventLog(): AwakeningEvent[] {
  return [...eventLog];
}

/**
 * Enable or disable notifications at runtime.
 */
export function setEnabled(enabled: boolean): void {
  config.enabled = enabled;
  console.log(`[Awakening] Notifications ${enabled ? 'ENABLED' : 'DISABLED'}.`);
}

/**
 * Update awakening configuration at runtime.
 */
export function setAwakeningConfig(overrides: Partial<AwakeningConfig>): void {
  config = { ...config, ...overrides };
}