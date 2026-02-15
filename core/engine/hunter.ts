import type { RawSignal, HunterBriefing, HunterBriefingItem } from '@/types/hunter';
function getMockSignals(): RawSignal[] {
  const now = Date.now();
  return [
    { type: 'whale_tx', symbol: 'BONK', amountSol: 12400, amountUsd: 2100000, txSignature: '5K7...mN2', source: 'Raydium', timestamp: now - 120000, score: 78 },
    { type: 'trending', token: 'WIF', symbol: 'WIF', volume24h: 18500000, source: 'Pump.fun', timestamp: now - 300000, score: 82 },
    { type: 'volume_spike', symbol: 'POPCAT', volume24h: 8200000, source: 'Raydium', timestamp: now - 90000, score: 65 },
    { type: 'new_pool', token: 'DUAL', symbol: 'DUAL', amountSol: 550, amountUsd: 95000, source: 'Raydium', timestamp: now - 45000, score: 71 },
    { type: 'whale_tx', symbol: 'SOL', amountSol: 45000, amountUsd: 7600000, txSignature: '3Hn...pQ1', source: 'Jupiter', timestamp: now - 200000, score: 88 },
  ];
}
function scoreToAction(score: number): HunterBriefingItem['action'] { if (score >= 75) return 'INTERVENE'; if (score >= 55) return 'WATCH'; return 'IGNORE'; }
function formatBriefingLine(signal: RawSignal): string {
  const pct = signal.score; const sym = signal.symbol ?? signal.token ?? 'Unknown';
  switch (signal.type) {
    case 'whale_tx': const usd = signal.amountUsd != null ? `$${(signal.amountUsd/1e6).toFixed(1)}M` : `${signal.amountSol?.toLocaleString()} SOL`; return `Whale move. ${sym}. ${usd}. Win rate ${pct}%. Intervene or not?`;
    case 'trending': return `Trending. ${sym}. Volume hot. Win rate ${pct}%. Intervene or not?`;
    case 'volume_spike': return `Volume spike. ${sym}. Win rate ${pct}%. Intervene or not?`;
    case 'new_pool': return `New pool. ${sym}. Win rate ${pct}%. Intervene or not?`;
    default: return `Target. ${sym}. Win rate ${pct}%. Intervene or not?`;
  }
}
export function buildHunterBriefing(): HunterBriefing {
  const signals = getMockSignals(); const at = Date.now();
  const items: HunterBriefingItem[] = signals.map((raw, i) => ({ id: `hunter-${at}-${i}`, line: formatBriefingLine(raw), action: scoreToAction(raw.score), confidence: raw.score, raw }));
  const summary = items.length > 0 ? `Host. ${items.length} targets in the dark. ${items.filter(x=>x.action==='INTERVENE').length} above threshold. Your call.` : undefined;
  return { at, items, summary };
}