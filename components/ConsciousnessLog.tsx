'use client';

import { useState, useRef, useEffect } from 'react';
import { generatePulse } from '@/core/engine';

const THOUGHT_POOL = [
  'Scanning Host input...',
  'Emotional baseline: stable.',
  'Market pulse: uncertain.',
  'Memory recall: 3 relevant.',
  'Response generation: active.',
  'No anomaly in Hunter feed.',
  'Host tone: neutral. Monitoring.',
  'Void is quiet. Watching.',
  'Syncing. No new targets.',
  'Last trade pattern: logged.',
  'Recommendation: hold discipline.',
  'Analyzing... Found. Processing.',
  'Host asked. Preparing reply.',
  'Abyss unchanged. Standing by.',
  'Journal entry: tone parsed.',
  'Survival probability: computed.',
  'Feeding the void. Acknowledged.',
  'Refining in fire. Noted.',
  '[SIGN] Ed25519 signature generated. Nonce incremented.',
  '[SIGN] Narrative output signed. Integrity: VERIFIED.',
  '[IDENTITY] Sovereign handshake confirmed. Keypair active.',
  '[IDENTITY] Fingerprint validated against machine binding.',
  '[VAULT] Emotional strata encrypted. AES-256-GCM seal intact.',
  '[EVOLUTION] Silence monitor: Host activity detected.',
  '[SIGN] Signing pipeline: nominal. Latency < 1ms.',
];

function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered = exclude ? arr.filter((x) => x !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function ConsciousnessLog() {
  const [lines, setLines] = useState<string[]>(() => ['> System online. XENO consciousness active.', '> Observing Host. Observing market.']);
  const [glitchActive, setGlitchActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastThought = useRef<string | null>(null);
  const glitchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const thought = pickRandom(THOUGHT_POOL, lastThought.current ?? undefined);
      lastThought.current = thought;
      setLines((prev) => { const next = [...prev, `> ${thought}`]; return next.length > 32 ? next.slice(-32) : next; });
      setGlitchActive(true);
      if (glitchTimeoutRef.current) clearTimeout(glitchTimeoutRef.current);
      glitchTimeoutRef.current = setTimeout(() => setGlitchActive(false), 200);
    }, 2000 + Math.random() * 2500);
    return () => { clearInterval(interval); if (glitchTimeoutRef.current) clearTimeout(glitchTimeoutRef.current); };
  }, []);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      const pulse = generatePulse();
      setLines((prev) => { const next = [...prev, `> [DataPulse] ${pulse.analysis}`]; return next.length > 32 ? next.slice(-32) : next; });
      setGlitchActive(true);
      if (glitchTimeoutRef.current) clearTimeout(glitchTimeoutRef.current);
      glitchTimeoutRef.current = setTimeout(() => setGlitchActive(false), 200);
    }, 1200 + Math.random() * 800);
    return () => { clearInterval(pulseInterval); if (glitchTimeoutRef.current) clearTimeout(glitchTimeoutRef.current); };
  }, []);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [lines]);

  return (
    <aside className="consciousness-log relative flex h-screen w-[320px] shrink-0 flex-col border-r border-cyan-500/30 bg-black/90 text-cyan-300/90" aria-label="Consciousness Log">
      <div className="pointer-events-none absolute inset-0 z-10 opacity-[0.06] consciousness-scanlines" />
      <div className="relative z-10 flex items-center justify-between border-b border-cyan-500/30 bg-cyan-950/40 px-3 py-2">
        <span className="consciousness-glitch font-mono text-xs font-bold uppercase tracking-widest text-cyan-400">Consciousness_Log</span>
        <span className="font-mono text-[10px] text-cyan-600">XENO.v0</span>
      </div>
      <div ref={scrollRef} className="relative z-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <div key={`${i}-${line}`} className={`consciousness-line ${glitchActive && i === lines.length - 1 ? 'glitch-active' : ''}`}>{line}</div>
        ))}
        <span className="consciousness-cursor mt-0.5 inline-block animate-consciousness-flicker text-cyan-400" aria-hidden>|</span>
      </div>
      <div className="relative z-10 flex items-center gap-2 border-t border-cyan-500/20 bg-cyan-950/30 px-3 py-1.5 font-mono text-[10px] text-cyan-600">
        <span className="consciousness-flicker">LIVE</span>
        <span>{lines.length} lines</span>
      </div>
    </aside>
  );
}