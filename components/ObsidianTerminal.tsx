'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { Message, MessageIdentity, IntegrityStatus, HunterBriefing, JournalResult } from '@/types';
import { useTypewriter } from '@/hooks/useTypewriter';
import { HunterBriefing as HunterBriefingUI } from './HunterBriefing';
import { TradingJournal } from './TradingJournal';
import { ChatArea } from './ChatArea';

interface SovereignState {
  mode: 'SOVEREIGN' | 'RESTRICTED' | 'UNKNOWN';
  fingerprint: string | null;
  messagesSigned: number;
  integrityBreaches: number;
}

function deriveIntegrity(identity: MessageIdentity | undefined): IntegrityStatus {
  if (!identity) return 'UNSIGNED';
  if (!identity.sovereign || identity.mode === 'RESTRICTED') return 'UNSIGNED';
  if (!identity.signature || identity.signature.length === 0) return 'COMPROMISED';
  return 'VERIFIED';
}

export function ObsidianTerminal() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<HunterBriefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(true);
  const [journalEntry, setJournalEntry] = useState('');
  const [journalResult, setJournalResult] = useState<JournalResult | null>(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [sovereign, setSovereign] = useState<SovereignState>({
    mode: 'UNKNOWN',
    fingerprint: null,
    messagesSigned: 0,
    integrityBreaches: 0,
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchBriefing = async () => {
    setBriefingLoading(true);
    try {
      const res = await fetch('/api/hunter/briefing');
      const data = await res.json();
      if (res.ok) setBriefing(data);
    } catch { setBriefing(null); }
    finally { setBriefingLoading(false); }
  };

  useEffect(() => { fetchBriefing(); }, []);

  const evaluateJournal = async () => {
    const text = journalEntry.trim();
    if (!text || journalLoading) return;
    setJournalLoading(true);
    setJournalResult(null);
    try {
      const res = await fetch('/api/journal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entry: text }) });
      const data = await res.json();
      if (res.ok) setJournalResult(data);
    } catch { setJournalResult(null); }
    finally { setJournalLoading(false); }
  };

  const lastAssistant = messages.filter((m) => m.role === 'assistant').pop();
  const typewriterText = useTypewriter(
    lastAssistant?.content ?? '',
    !!lastAssistant && !lastAssistant.done,
    () => setMessages((prev) => prev.map((m, i) => i === prev.length - 1 && m.role === 'assistant' ? { ...m, done: true } : m))
  );

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typewriterText]);

  const send = async () => {
    const line = input.trim();
    if (!line || loading) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: line };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      const identity: MessageIdentity | undefined = data.identity
        ? {
            mode: data.identity.mode,
            fingerprint: data.identity.fingerprint ?? '',
            signature: data.identity.signature ?? '',
            nonce: data.identity.nonce ?? 0,
            sovereign: data.identity.sovereign ?? false,
          }
        : undefined;

      const integrity = deriveIntegrity(identity);

      setSovereign((prev) => ({
        mode: identity?.mode ?? prev.mode,
        fingerprint: identity?.fingerprint ?? prev.fingerprint,
        messagesSigned: prev.messagesSigned + (integrity === 'VERIFIED' ? 1 : 0),
        integrityBreaches: prev.integrityBreaches + (integrity === 'COMPROMISED' ? 1 : 0),
      }));

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.content ?? '', done: false, identity, integrity },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${e instanceof Error ? e.message : 'Unknown'}. Syncing.`,
          done: true,
          integrity: 'COMPROMISED' as IntegrityStatus,
        },
      ]);
      setSovereign((prev) => ({ ...prev, integrityBreaches: prev.integrityBreaches + 1 }));
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div className="absolute inset-0 opacity-[0.03] animate-pulse" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #22d3ee 0%, transparent 70%)', backgroundSize: '200% 200%' }} />
      </div>
      <div className="relative z-10 flex flex-col flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/40 ring-2 ring-cyan-400/20 shadow-lg shadow-cyan-500/10">
            <Image src="/xeno-avatar.png" alt="XENO" title="XENO -- The Cold Synthesizer" fill className="object-cover object-top" sizes="96px" priority />
          </div>
        </div>
        <div className="text-center text-cyan-400/70 text-sm font-mono mb-2">XENO Protocol -- Obsidian Terminal</div>
        <div className="flex items-center justify-center gap-3 font-mono text-[10px] mb-4">
          <span className={sovereign.mode === 'SOVEREIGN' ? 'text-cyan-500' : sovereign.mode === 'RESTRICTED' ? 'text-yellow-500' : 'text-gray-500'}>
            [{sovereign.mode === 'SOVEREIGN' ? '#' : sovereign.mode === 'RESTRICTED' ? '!' : '?'}] {sovereign.mode}
          </span>
          {sovereign.fingerprint && (
            <>
              <span className="text-cyan-700">|</span>
              <span className="text-cyan-600/60">FP: {sovereign.fingerprint.slice(0, 16)}</span>
            </>
          )}
          <span className="text-cyan-700">|</span>
          <span className="text-cyan-600/60">SIGNED: {sovereign.messagesSigned}</span>
          {sovereign.integrityBreaches > 0 && (
            <>
              <span className="text-red-700">|</span>
              <span className="text-red-500 animate-pulse">BREACHES: {sovereign.integrityBreaches}</span>
            </>
          )}
        </div>
        <HunterBriefingUI briefing={briefing} loading={briefingLoading} onRefresh={fetchBriefing} />
        <TradingJournal entry={journalEntry} onEntryChange={setJournalEntry} result={journalResult} loading={journalLoading} onEvaluate={evaluateJournal} />
        <ChatArea messages={messages} loading={loading} typewriterText={typewriterText} input={input} onInputChange={setInput} onSend={send} bottomRef={bottomRef} />
      </div>
    </main>
  );
}