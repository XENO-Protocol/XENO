/**
 * types/resonance.ts -- Resonance Listener type definitions.
 */

export type ResonanceMode = 'ENVIRONMENTAL_AWARENESS' | 'PASSIVE';

export interface ResonanceMilestone {
  id: string;
  reachedAt: number;
  label: string;
  thresholdMs: number;
}

export interface ResonanceState {
  active: boolean;
  mode: ResonanceMode;
  status: 'OBSERVING_HOST' | 'STANDBY';
  activeDeveloperTools: number;
  syncBoost: number;
  codingActiveMs: number;
  ingestingFragment: boolean;
  lastFragment: string | null;
  lastIngestAt: number | null;
  milestones: ResonanceMilestone[];
}