/**
 * core/identity/handshake.ts -- Message Signing & Verification Protocol
 */

import { signMessage, verifySignature } from '@/lib/identity';
import type { SovereignKeypair, SignedEnvelope, VerificationResult } from '@/types/identity';

let lastVerifiedNonce = 0;

/** Sign a Narrative Engine output before delivery to the Host. */
export function signNarrativeOutput(
  content: string,
  keypair: SovereignKeypair
): SignedEnvelope {
  return signMessage(content, keypair);
}

/**
 * Verify an incoming signed envelope.
 * Checks: structural completeness, cryptographic validity, nonce monotonicity.
 */
export function verifyNarrativeEnvelope(
  envelope: SignedEnvelope,
  expectedFingerprint?: string
): VerificationResult {
  if (!envelope || typeof envelope.content !== 'string') {
    return {
      valid: false,
      publicKey: '',
      fingerprint: '',
      reason: 'STRUCTURAL_FAILURE: envelope is null or content is not a string',
    };
  }

  if (expectedFingerprint && envelope.fingerprint !== expectedFingerprint) {
    return {
      valid: false,
      publicKey: envelope.signerPublicKey || '',
      fingerprint: envelope.fingerprint || '',
      reason: 'FINGERPRINT_MISMATCH: expected ' + expectedFingerprint + ', got ' + envelope.fingerprint,
    };
  }

  if (typeof envelope.nonce === 'number' && envelope.nonce <= lastVerifiedNonce) {
    return {
      valid: false,
      publicKey: envelope.signerPublicKey || '',
      fingerprint: envelope.fingerprint || '',
      reason: 'REPLAY_DETECTED: nonce ' + envelope.nonce + ' <= last verified ' + lastVerifiedNonce,
    };
  }

  const result = verifySignature(envelope);

  if (result.valid && typeof envelope.nonce === 'number') {
    lastVerifiedNonce = envelope.nonce;
  }

  return result;
}

/** Create an unsigned (RESTRICTED_MODE) response envelope. */
export function createRestrictedEnvelope(content: string): SignedEnvelope {
  return {
    content,
    signature: '',
    signerPublicKey: '',
    fingerprint: 'RESTRICTED',
    signedAt: Date.now(),
    nonce: 0,
  };
}

/** Check if an envelope was created in RESTRICTED_MODE. */
export function isRestrictedEnvelope(envelope: SignedEnvelope): boolean {
  return envelope.fingerprint === 'RESTRICTED' && envelope.signature === '';
}

/** Reset the nonce counter (used on identity re-initialization). */
export function resetNonceTracker(): void {
  lastVerifiedNonce = 0;
}