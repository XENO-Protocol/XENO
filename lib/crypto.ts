/**
 * lib/crypto.ts -- AES-256-GCM encryption utilities for the Obsidian Vault.
 *
 * Uses Node.js native `crypto` module. No external dependencies.
 * Key derivation: PBKDF2 with SHA-512, 100,000 iterations.
 * IV: 12 bytes (96-bit), randomly generated per encryption operation.
 * Auth tag: 16 bytes (128-bit) for tamper detection.
 */

import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';
import type { EncryptedEnvelope } from '@/types/vault';

const ALGORITHM = 'aes-256-gcm' as const;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_DIGEST = 'sha512';
const SALT = 'xeno_protocol_obsidian_vault_v1';

/**
 * Derive a 256-bit encryption key from the configured secret.
 * Uses PBKDF2 with a fixed application-level salt.
 */
function deriveKey(): Buffer {
  const secret = process.env.VAULT_SECRET
    || process.env.OPENAI_API_KEY
    || 'xeno-default-key-change-me';

  return pbkdf2Sync(secret, SALT, PBKDF2_ITERATIONS, KEY_LENGTH, PBKDF2_DIGEST);
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 *
 * @param plaintext - The data to encrypt (typically JSON-serialized vault data)
 * @returns EncryptedEnvelope containing IV, auth tag, and ciphertext (all hex-encoded)
 */
export function encrypt(plaintext: string): EncryptedEnvelope {
  const key = deriveKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    ciphertext,
    algorithm: ALGORITHM,
    version: 1,
    encryptedAt: Date.now(),
  };
}

/**
 * Decrypt an EncryptedEnvelope back to plaintext.
 *
 * @param envelope - The encrypted data envelope
 * @returns Decrypted plaintext string
 * @throws Error if decryption fails (wrong key, tampered data, or corrupt envelope)
 */
export function decrypt(envelope: EncryptedEnvelope): string {
  if (envelope.algorithm !== ALGORITHM) {
    throw new Error(`Unsupported algorithm: ${envelope.algorithm}. Expected ${ALGORITHM}.`);
  }

  const key = deriveKey();
  const iv = Buffer.from(envelope.iv, 'hex');
  const authTag = Buffer.from(envelope.authTag, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  let plaintext = decipher.update(envelope.ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');

  return plaintext;
}

/**
 * Verify that an envelope can be decrypted without returning the data.
 *
 * @param envelope - The encrypted data envelope
 * @returns true if decryption succeeds, false otherwise
 */
export function verifyIntegrity(envelope: EncryptedEnvelope): boolean {
  try {
    decrypt(envelope);
    return true;
  } catch {
    return false;
  }
}