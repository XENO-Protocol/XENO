export type SignalType = 'trending'|'whale_tx'|'new_pool'|'volume_spike';
export interface RawSignal { type: SignalType; token?: string; symbol?: string; mint?: string; amountSol?: number; amountUsd?: number; volume24h?: number; txSignature?: string; source?: string; timestamp: number; score: number; }
export interface HunterBriefingItem { id: string; line: string; action: 'INTERVENE'|'WATCH'|'IGNORE'; confidence: number; raw: RawSignal; }
export interface HunterBriefing { at: number; items: HunterBriefingItem[]; summary?: string; }