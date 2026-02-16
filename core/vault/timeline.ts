/**
 * core/vault/timeline.ts -- Emotional State Time-Series Log
 *
 * Manages an append-only time-series of EmotionalTag entries.
 * Each interaction produces a TimelineEntry that records the Host's
 * emotional state, entropy metrics, and message previews.
 *
 * The timeline enables XENO to recall emotional patterns across
 * sessions: recurring states, trend direction, and historical baselines.
 */

import type { EmotionalTag, TimelineEntry, VaultData } from '@/types/vault';
import type { EmotionTag } from '@/core/brain';

/** Maximum preview length for stored message snippets */
const PREVIEW_MAX = 200;

/** Maximum timeline entries before oldest are pruned */
const MAX_TIMELINE_SIZE = 1000;

/** Generate a unique timeline entry ID */
function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `tl-${ts}-${rand}`;
}

/** Generate a session ID (persists across a single server process lifecycle) */
let currentSessionId: string | null = null;
export function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = `ses-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return currentSessionId;
}

/**
 * Truncate a string to a maximum length, appending ellipsis if truncated.
 */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 3) + '...';
}

/**
 * Create a new TimelineEntry from an interaction.
 *
 * @param tag - The extracted EmotionalTag for this interaction
 * @param hostInput - The Host's raw message
 * @param xenoResponse - XENO's narrative response
 * @returns A fully populated TimelineEntry
 */
export function createTimelineEntry(
  tag: EmotionalTag,
  hostInput: string,
  xenoResponse: string
): TimelineEntry {
  const now = Date.now();
  return {
    id: generateId(),
    timestamp: now,
    dateISO: new Date(now).toISOString(),
    tag,
    hostInputPreview: truncate(hostInput.trim(), PREVIEW_MAX),
    xenoResponsePreview: truncate(xenoResponse.trim(), PREVIEW_MAX),
    sessionId: getSessionId(),
  };
}

/**
 * Append an entry to the vault timeline, enforcing size limits.
 * Evicts oldest entries when MAX_TIMELINE_SIZE is exceeded.
 */
export function appendToTimeline(vault: VaultData, entry: TimelineEntry): void {
  vault.timeline.push(entry);
  if (vault.timeline.length > MAX_TIMELINE_SIZE) {
    vault.timeline = vault.timeline.slice(-MAX_TIMELINE_SIZE);
  }
  recalculateStats(vault);
}

/** Recalculate aggregate statistics from the current timeline. */
function recalculateStats(vault: VaultData): void {
  const tl = vault.timeline;
  vault.stats.totalInteractions = tl.length;
  vault.stats.lastUpdated = Date.now();
  if (tl.length === 0) {
    vault.stats.dominantEmotion = null;
    vault.stats.averageEntropy = 0;
    return;
  }
  const sumEntropy = tl.reduce((acc, e) => acc + e.tag.entropyScore, 0);
  vault.stats.averageEntropy = Number((sumEntropy / tl.length).toFixed(3));
  const freq: Record<string, number> = {};
  for (const e of tl) {
    freq[e.tag.emotion] = (freq[e.tag.emotion] || 0) + 1;
  }
  let maxCount = 0;
  let dominant: EmotionTag | null = null;
  for (const [tag, count] of Object.entries(freq)) {
    if (count > maxCount) { maxCount = count; dominant = tag as EmotionTag; }
  }
  vault.stats.dominantEmotion = dominant;
}

/** Query timeline entries within a time range. */
export function queryTimeRange(vault: VaultData, fromMs: number, toMs: number = Date.now()): TimelineEntry[] {
  return vault.timeline.filter((e) => e.timestamp >= fromMs && e.timestamp <= toMs);
}

/** Query the most recent N timeline entries. */
export function queryRecent(vault: VaultData, count: number): TimelineEntry[] {
  return vault.timeline.slice(-count);
}

/** Filter timeline entries by a specific emotion. */
export function queryByEmotion(vault: VaultData, emotion: EmotionTag): TimelineEntry[] {
  return vault.timeline.filter((e) => e.tag.emotion === emotion);
}

/**
 * Generate a human-readable summary of the Host's emotional history.
 * Intended for injection into the system prompt for cross-session awareness.
 */
export function generateHistorySummary(vault: VaultData, recentCount: number = 5): string {
  if (vault.timeline.length === 0) return '';
  const recent = queryRecent(vault, recentCount);
  const stats = vault.stats;
  const lines = [
    '## Host Emotional History (Obsidian Vault)',
    'Total recorded interactions: ' + stats.totalInteractions,
    'Dominant emotion across history: ' + (stats.dominantEmotion || 'insufficient data'),
    'Average entropy: ' + stats.averageEntropy.toFixed(2),
    '',
    'Recent emotional states:',
  ];
  for (const entry of recent) {
    lines.push('- [' + entry.tag.emotion + '] entropy=' + entry.tag.entropyScore.toFixed(2) + ' band=' + entry.tag.entropyBand + ' | "' + entry.hostInputPreview + '"');
  }
  lines.push('');
  lines.push('Use this history to identify recurring patterns. Reference specific past states when they mirror the current interaction.');
  return lines.join('\n');
}

/** Create a fresh, empty VaultData structure. */
export function createEmptyVault(): VaultData {
  return {
    timeline: [],
    stats: {
      totalInteractions: 0,
      dominantEmotion: null,
      averageEntropy: 0,
      lastUpdated: Date.now(),
    },
  };
}