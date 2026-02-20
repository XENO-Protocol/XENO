'use client';

import { useEffect, useState } from 'react';

interface IntegrityAlertProps {
  fingerprint: string;
  signature: string;
  nonce: number;
}

/**
 * Full-width [INTEGRITY_COMPROMISED] alert banner.
 * Renders with glitch animation when integrity verification fails.
 * Auto-dismisses after 10 seconds but persists in the message stream.
 */
export function IntegrityAlert({ fingerprint, signature, nonce }: IntegrityAlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 10_000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="my-2 border border-red-500/60 bg-red-950/30 px-3 py-2 font-mono text-xs">
      <div className="flex items-center gap-2 text-red-400 animate-pulse">
        <span className="text-base font-bold">[!]</span>
        <span className="font-bold tracking-widest uppercase">INTEGRITY_COMPROMISED</span>
      </div>
      <div className="mt-1 text-red-500/70 text-[10px] leading-relaxed">
        <div>Narrative Engine output failed signature verification.</div>
        <div>FP: {fingerprint} | SIG: {signature.slice(0, 12)}... | NONCE: {nonce}</div>
        <div className="mt-0.5 text-red-600/50">
          Possible causes: key rotation, process restart, tampering.
          Sovereign Identity may require re-initialization.
        </div>
      </div>
    </div>
  );
}