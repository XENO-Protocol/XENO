/**
 * core/identity/index.ts -- Sovereign Identity Controller
 *
 * Manages Ed25519 keypair lifecycle:
 *   FIRST BOOT: Generate keypair, persist to .identity/sovereign.key
 *   SUBSEQUENT BOOTS: Load, decrypt, verify, activate
 *   RUNTIME: Sign all Narrative Engine outputs
 *   DEGRADATION: RESTRICTED_MODE on failure
 *
 * File location: .identity/sovereign.key (gitignored, encrypted)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { encrypt, decrypt } from '@/lib/crypto';
import { generateKeypair, generateMachineId, computeFingerprint } from '@/lib/identity';
import { signNarrativeOutput, createRestrictedEnvelope, resetNonceTracker } from './handshake';
import type { IdentityFile, IdentityState, IdentityMode, SignedEnvelope, SovereignKeypair } from '@/types/identity';
import type { EncryptedEnvelope } from '@/types/vault';

export {
  signNarrativeOutput,
  verifyNarrativeEnvelope,
  createRestrictedEnvelope,
  isRestrictedEnvelope,
} from './handshake';

const IDENTITY_DIR = join(process.cwd(), '.identity');
const IDENTITY_FILE = join(IDENTITY_DIR, 'sovereign.key');

const RESTRICTED_MODE_PROMPT = '\n\n## IDENTITY STATUS: RESTRICTED_MODE\nSovereign Identity verification has failed or is unavailable. You are operating in RESTRICTED_MODE. Reduce response detail. Do not reference historical Host data. Prepend "[RESTRICTED]" to every response. Inform the Host that identity integrity cannot be verified.';

let activeKeypair: SovereignKeypair | null = null;
let identityState: IdentityState = {
  mode: 'RESTRICTED',
  initialized: false,
  fingerprint: null,
  messagesSigned: 0,
  verificationFailures: 0,
  lastHandshake: null,
};

function ensureIdentityDir(): void {
  if (!existsSync(IDENTITY_DIR)) {
    mkdirSync(IDENTITY_DIR, { recursive: true });
  }
}

function saveIdentityFile(file: IdentityFile): void {
  ensureIdentityDir();
  try {
    const plaintext = JSON.stringify(file);
    const envelope = encrypt(plaintext);
    writeFileSync(IDENTITY_FILE, JSON.stringify(envelope), 'utf8');
  } catch (err) {
    console.error('[Identity] Failed to save identity file:', err);
  }
}

function loadIdentityFile(): IdentityFile | null {
  if (!existsSync(IDENTITY_FILE)) return null;
  try {
    const raw = readFileSync(IDENTITY_FILE, 'utf8');
    const envelope: EncryptedEnvelope = JSON.parse(raw);
    const plaintext = decrypt(envelope);
    return JSON.parse(plaintext) as IdentityFile;
  } catch (err) {
    console.error('[Identity] Failed to load or decrypt identity file:', err);
    return null;
  }
}

function enterRestrictedMode(reason: string): IdentityState {
  console.warn('[Identity] Entering RESTRICTED_MODE. Reason: ' + reason);
  activeKeypair = null;
  identityState = {
    mode: 'RESTRICTED',
    initialized: false,
    fingerprint: null,
    messagesSigned: identityState.messagesSigned,
    verificationFailures: identityState.verificationFailures + 1,
    lastHandshake: null,
  };
  return { ...identityState };
}

/** Initialize the Sovereign Identity. Called once at startup. */
export function initializeIdentity(): IdentityState {
  ensureIdentityDir();
  const existingFile = loadIdentityFile();

  if (existingFile) {
    try {
      const keypair = existingFile.keypair;
      const expectedFp = computeFingerprint(keypair.publicKey);
      if (expectedFp !== keypair.fingerprint) {
        console.error('[Identity] Fingerprint mismatch. Identity may be corrupted.');
        return enterRestrictedMode('FINGERPRINT_CORRUPTION');
      }
      activeKeypair = keypair;
      existingFile.hostBinding.bootCount++;
      saveIdentityFile(existingFile);
      identityState = {
        mode: 'SOVEREIGN',
        initialized: true,
        fingerprint: keypair.fingerprint,
        messagesSigned: 0,
        verificationFailures: 0,
        lastHandshake: Date.now(),
      };
      console.log('[Identity] Sovereign Identity loaded. Fingerprint: ' + keypair.fingerprint + '. Boot #' + existingFile.hostBinding.bootCount);
      return { ...identityState };
    } catch (err) {
      console.error('[Identity] Failed to activate existing identity:', err);
      return enterRestrictedMode('ACTIVATION_FAILURE');
    }
  }

  // First boot
  try {
    const keypair = generateKeypair();
    const machineId = generateMachineId();
    const file: IdentityFile = {
      version: 1,
      keypair,
      hostBinding: { firstBoot: Date.now(), machineId, bootCount: 1 },
    };
    saveIdentityFile(file);
    activeKeypair = keypair;
    resetNonceTracker();
    identityState = {
      mode: 'SOVEREIGN',
      initialized: true,
      fingerprint: keypair.fingerprint,
      messagesSigned: 0,
      verificationFailures: 0,
      lastHandshake: Date.now(),
    };
    console.log('[Identity] NEW Sovereign Identity generated. Fingerprint: ' + keypair.fingerprint + '. Machine: ' + machineId.slice(0, 8) + '...');
    return { ...identityState };
  } catch (err) {
    console.error('[Identity] Failed to generate new identity:', err);
    return enterRestrictedMode('GENERATION_FAILURE');
  }
}

/** Record a verification failure. After 3 consecutive, enter RESTRICTED_MODE. */
export function recordVerificationFailure(reason: string): void {
  identityState.verificationFailures++;
  console.warn('[Identity] Verification failure #' + identityState.verificationFailures + ': ' + reason);
  if (identityState.verificationFailures >= 3) {
    enterRestrictedMode('CONSECUTIVE_VERIFICATION_FAILURES');
  }
}

/** Sign a Narrative Engine response. */
export function signResponse(content: string): SignedEnvelope {
  if (identityState.mode === 'RESTRICTED' || !activeKeypair) {
    return createRestrictedEnvelope('[RESTRICTED] ' + content);
  }
  try {
    const envelope = signNarrativeOutput(content, activeKeypair);
    identityState.messagesSigned++;
    identityState.lastHandshake = Date.now();
    return envelope;
  } catch (err) {
    console.error('[Identity] Signing failed:', err);
    recordVerificationFailure('SIGNING_EXCEPTION');
    return createRestrictedEnvelope('[RESTRICTED] ' + content);
  }
}

export function getIdentityState(): IdentityState { return { ...identityState }; }
export function getMode(): IdentityMode { return identityState.mode; }
export function isSovereign(): boolean { return identityState.mode === 'SOVEREIGN' && activeKeypair !== null; }
export function getFingerprint(): string | null { return identityState.fingerprint; }
export function getIdentityPromptModifier(): string {
  return identityState.mode === 'RESTRICTED' ? RESTRICTED_MODE_PROMPT : '';
}
export function getPublicKey(): string | null { return activeKeypair?.publicKey ?? null; }