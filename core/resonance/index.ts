/**
 * core/resonance/index.ts -- Resonance Listener
 *
 * Background watcher that observes:
 * - Active developer tools (Cursor, terminals, editors)
 * - Clipboard changes for technical fragments
 *
 * It applies subtle environmental sync boosts and awards certificate medals
 * when active coding milestones are reached.
 */

import psList from 'ps-list';
import clipboard from 'clipboardy';
import { updateResonanceSignal } from '@/core/engine';
import { appendMedalOfResonance } from '@/core/identity/certificate';
import type { ResonanceMilestone, ResonanceState } from '@/types';

const POLL_INTERVAL_MS = Number(process.env.RESONANCE_POLL_MS ?? 10_000);
const INGESTION_WINDOW_MS = 4_000;
const MEDAL_5H_MS = 5 * 60 * 60 * 1000;

const TOOL_PATTERNS = [
  /cursor/i,
  /code/i,
  /terminal/i,
  /powershell/i,
  /\bcmd\b/i,
  /\bwt\b/i,
  /bash/i,
  /zsh/i,
  /iterm/i,
];

let intervalRef: ReturnType<typeof setInterval> | null = null;
let initialized = false;
let lastTickAt = Date.now();
let lastClipboard = '';
let awardedMedal5h = false;

const state: ResonanceState = {
  active: false,
  mode: 'PASSIVE',
  status: 'STANDBY',
  activeDeveloperTools: 0,
  syncBoost: 0,
  codingActiveMs: 0,
  ingestingFragment: false,
  lastFragment: null,
  lastIngestAt: null,
  milestones: [],
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isDeveloperTool(name: string): boolean {
  return TOOL_PATTERNS.some((pattern) => pattern.test(name));
}

function isTechnicalFragment(value: string): boolean {
  if (value.length < 10 || value.length > 240) return false;
  if (!/[A-Za-z]/.test(value)) return false;
  return (
    /[{}()[\];:=<>/_-]/.test(value) ||
    /\b(function|const|let|class|import|export|SELECT|INSERT|http|npm|tsx|json)\b/i.test(value)
  );
}

function truncateFragment(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 52 ? `${normalized.slice(0, 52)}...` : normalized;
}

function pushMilestone(milestone: ResonanceMilestone): void {
  if (!state.milestones.some((m) => m.id === milestone.id)) {
    state.milestones.push(milestone);
  }
}

async function evaluateMilestones(): Promise<void> {
  if (!awardedMedal5h && state.codingActiveMs >= MEDAL_5H_MS) {
    const ok = appendMedalOfResonance(
      'resonance-5h',
      'R-5H',
      'Medal of Resonance :: 5h active coding with XENO'
    );
    if (ok) {
      awardedMedal5h = true;
      pushMilestone({
        id: 'resonance-5h',
        reachedAt: Date.now(),
        label: 'Medal of Resonance :: 5h',
        thresholdMs: MEDAL_5H_MS,
      });
      console.log('[Resonance] Milestone reached: resonance-5h');
    }
  }
}

async function tick(): Promise<void> {
  const now = Date.now();
  const delta = now - lastTickAt;
  lastTickAt = now;

  try {
    const processes = await psList();
    const activeTools = processes.filter((p) => isDeveloperTool(p.name));
    const activeCount = activeTools.length;
    const active = activeCount > 0;

    state.active = active;
    state.activeDeveloperTools = activeCount;
    state.mode = active ? 'ENVIRONMENTAL_AWARENESS' : 'PASSIVE';
    state.status = active ? 'OBSERVING_HOST' : 'STANDBY';

    if (active) {
      state.codingActiveMs += Math.max(0, delta);
    }

    const boost = active ? clamp(activeCount * 0.015, 0.02, 0.12) : 0;
    state.syncBoost = Number(boost.toFixed(3));
    updateResonanceSignal(state.syncBoost, activeCount);
  } catch (err) {
    updateResonanceSignal(0, 0);
    console.error('[Resonance] Process scan failed:', err);
  }

  try {
    const clipboardText = await clipboard.read();
    if (clipboardText && clipboardText !== lastClipboard && isTechnicalFragment(clipboardText)) {
      state.lastFragment = truncateFragment(clipboardText);
      state.lastIngestAt = now;
      state.ingestingFragment = true;
      lastClipboard = clipboardText;
    }
  } catch (err) {
    // Clipboard access can fail in headless environments; keep this quiet.
    console.debug('[Resonance] Clipboard observer unavailable:', err);
  }

  if (state.lastIngestAt && now - state.lastIngestAt > INGESTION_WINDOW_MS) {
    state.ingestingFragment = false;
  }

  await evaluateMilestones();
}

export function initializeResonanceListener(): void {
  if (initialized) return;
  initialized = true;
  lastTickAt = Date.now();
  intervalRef = setInterval(() => {
    tick().catch((err) => console.error('[Resonance] Tick failed:', err));
  }, POLL_INTERVAL_MS);
  tick().catch((err) => console.error('[Resonance] Initial tick failed:', err));
  console.log(`[Resonance] Listener active. Poll interval: ${POLL_INTERVAL_MS}ms`);
}

export function stopResonanceListener(): void {
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = null;
  }
  initialized = false;
  updateResonanceSignal(0, 0);
}

export function getResonanceState(): ResonanceState {
  return { ...state, milestones: [...state.milestones] };
}