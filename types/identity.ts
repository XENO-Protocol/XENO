/**
 * types/identity.ts -- Sovereign Identity type definitions.
 */

/** Ed25519 keypair stored in the identity vault */
export interface SovereignKeypair {
  publicKey: string;
  privateKey: string;
  createdAt: number;
  fingerprint: string;
}

/** Signed message envelope attached to every Narrative Engine output */
export interface SignedEnvelope {
  content: string;
  signature: string;
  signerPublicKey: string;
  fingerprint: string;
  signedAt: number;
  nonce: number;
}

/** Result of a signature verification operation */
export interface VerificationResult {
  valid: boolean;
  publicKey: string;
  fingerprint: string;
  reason?: string;
}

/** Identity operational modes */
export type IdentityMode = 'SOVEREIGN' | 'RESTRICTED';

/** Runtime identity state */
export interface IdentityState {
  mode: IdentityMode;
  initialized: boolean;
  fingerprint: string | null;
  messagesSigned: number;
  verificationFailures: number;
  lastHandshake: number | null;
}

/** Identity file structure persisted to disk */
export interface IdentityFile {
  version: number;
  keypair: SovereignKeypair;
  hostBinding: {
    firstBoot: number;
    machineId: string;
    bootCount: number;
  };
}