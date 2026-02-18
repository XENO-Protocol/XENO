/**
 * lib/identity.ts -- Ed25519 Cryptographic Primitives
 *
 * Low-level Ed25519 operations using Node.js native crypto module.
 * No external dependencies. All keys and signatures are hex-encoded.
 */

import { generateKeyPairSync, sign, verify, createHash } from 'crypto';
import type { SovereignKeypair, SignedEnvelope, VerificationResult } from '@/types/identity';

let nonceCounter = 0;

/**
 * Generate a new Ed25519 keypair for the Sovereign Identity.
 */
export function generateKeypair(): SovereignKeypair {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' },
  });

  const pubHex = publicKey.toString('hex');
  const privHex = privateKey.toString('hex');
  const fingerprint = createHash('sha256').update(pubHex).digest('hex').slice(0, 16);

  return {
    publicKey: pubHex,
    privateKey: privHex,
    createdAt: Date.now(),
    fingerprint,
  };
}

/**
 * Sign a message using the Sovereign Identity's private key.
 */
export function signMessage(content: string, keypair: SovereignKeypair): SignedEnvelope {
  const privKeyObj = {
    key: Buffer.from(keypair.privateKey, 'hex'),
    format: 'der' as const,
    type: 'pkcs8' as const,
  };

  const signature = sign(null, Buffer.from(content, 'utf8'), privKeyObj);

  return {
    content,
    signature: signature.toString('hex'),
    signerPublicKey: keypair.publicKey,
    fingerprint: keypair.fingerprint,
    signedAt: Date.now(),
    nonce: ++nonceCounter,
  };
}

/**
 * Verify a signed envelope against the claimed public key.
 */
export function verifySignature(envelope: SignedEnvelope): VerificationResult {
  const base: Omit<VerificationResult, 'valid' | 'reason'> = {
    publicKey: envelope.signerPublicKey,
    fingerprint: envelope.fingerprint,
  };

  try {
    if (!envelope.signature || !envelope.signerPublicKey || !envelope.content) {
      return { ...base, valid: false, reason: 'INCOMPLETE_ENVELOPE: missing required fields' };
    }

    const pubKeyObj = {
      key: Buffer.from(envelope.signerPublicKey, 'hex'),
      format: 'der' as const,
      type: 'spki' as const,
    };

    const isValid = verify(
      null,
      Buffer.from(envelope.content, 'utf8'),
      pubKeyObj,
      Buffer.from(envelope.signature, 'hex')
    );

    if (!isValid) {
      return { ...base, valid: false, reason: 'SIGNATURE_MISMATCH: content tampered or wrong key' };
    }

    return { ...base, valid: true };
  } catch (err) {
    return {
      ...base,
      valid: false,
      reason: 'VERIFICATION_ERROR: ' + (err instanceof Error ? err.message : 'unknown'),
    };
  }
}

/** Compute the fingerprint of a public key. */
export function computeFingerprint(publicKeyHex: string): string {
  return createHash('sha256').update(publicKeyHex).digest('hex').slice(0, 16);
}

/** Generate a machine identifier from system hostname. */
export function generateMachineId(): string {
  const os = require('os');
  const raw = os.hostname() + ':' + process.arch + ':' + process.version;
  return createHash('sha256').update(raw).digest('hex').slice(0, 32);
}