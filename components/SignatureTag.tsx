'use client';

import type { MessageIdentity, IntegrityStatus } from '@/types/chat';

interface SignatureTagProps {
  identity: MessageIdentity;
  integrity: IntegrityStatus;
}

/**
 * Renders a compact cryptographic signature badge below XENO responses.
 * Visual treatment: monospace, dimmed cyan, truncated signature hash.
 * Integrity status drives the color and icon.
 */
export function SignatureTag({ identity, integrity }: SignatureTagProps) {
  const sigHash = identity.signature
    ? identity.signature.slice(0, 16) + '...' + identity.signature.slice(-8)
    : 'NONE';

  const fpDisplay = identity.fingerprint.slice(0, 16);

  const statusConfig = {
    VERIFIED: { label: 'VERIFIED', color: 'text-cyan-500/70', icon: '#' },
    UNSIGNED: { label: 'UNSIGNED', color: 'text-yellow-500/70', icon: '?' },
    COMPROMISED: { label: 'INTEGRITY_COMPROMISED', color: 'text-red-500 animate-pulse', icon: '!' },
  }[integrity];

  return (
    <div className="mt-1 font-mono text-[10px] leading-tight select-all">
      <div className={`flex items-center gap-1.5 ${statusConfig.color}`}>
        <span className="opacity-60">[{statusConfig.icon}]</span>
        <span className="opacity-50">SIG:</span>
        <span className="tracking-wider">{sigHash}</span>
        <span className="opacity-30">|</span>
        <span className="opacity-50">FP:</span>
        <span>{fpDisplay}</span>
        <span className="opacity-30">|</span>
        <span className="opacity-50">N:</span>
        <span>{identity.nonce}</span>
        <span className="opacity-30">|</span>
        <span className={integrity === 'COMPROMISED' ? 'font-bold' : 'opacity-70'}>
          {statusConfig.label}
        </span>
      </div>
      {identity.mode === 'RESTRICTED' && (
        <div className="text-yellow-600/60 mt-0.5">
          [RESTRICTED_MODE] Identity degraded. Signature unverifiable.
        </div>
      )}
    </div>
  );
}