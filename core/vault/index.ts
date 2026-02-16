/**
 * core/vault/index.ts -- The Obsidian Vault
 *
 * Persistent encrypted storage layer for Host emotional telemetry.
 * Data is encrypted at rest using AES-256-GCM via lib/crypto.ts
 * and stored as a single JSON file on the local filesystem.
 *
 * File location: .vault/obsidian.enc (gitignored)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { encrypt, decrypt } from '@/lib/crypto';
import { extractEmotionalTag } from './emotional-tags';
import {
  createTimelineEntry,
  appendToTimeline,
  generateHistorySummary,
  queryRecent,
  queryByEmotion,
  queryTimeRange,
  createEmptyVault,
} from './timeline';
import type { VaultData, EncryptedEnvelope } from '@/types/vault';
import type { EntropyResult } from '@/core/brain';

export { extractEmotionalTag } from './emotional-tags';
export {
  createTimelineEntry,
  appendToTimeline,
  generateHistorySummary,
  queryRecent,
  queryByEmotion,
  queryTimeRange,
  getSessionId,
} from './timeline';

/** Vault file path constants */
const VAULT_DIR = join(process.cwd(), '.vault');
const VAULT_FILE = join(VAULT_DIR, 'obsidian.enc');

/** In-memory cache of the decrypted vault data */
let vaultCache: VaultData | null = null;

/** Ensure the .vault directory exists. */
function ensureVaultDir(): void {
  if (!existsSync(VAULT_DIR)) {
    mkdirSync(VAULT_DIR, { recursive: true });
  }
}

/**
 * Load the vault from disk. If the file does not exist or is corrupt,
 * initializes a fresh empty vault.
 */
export function loadVault(): VaultData {
  if (vaultCache) return vaultCache;
  ensureVaultDir();
  if (!existsSync(VAULT_FILE)) {
    vaultCache = createEmptyVault();
    return vaultCache;
  }
  try {
    const raw = readFileSync(VAULT_FILE, 'utf8');
    const envelope: EncryptedEnvelope = JSON.parse(raw);
    const plaintext = decrypt(envelope);
    vaultCache = JSON.parse(plaintext) as VaultData;
    return vaultCache;
  } catch (err) {
    console.error('[Vault] Failed to load or decrypt vault. Initializing fresh vault.', err);
    vaultCache = createEmptyVault();
    return vaultCache;
  }
}

/** Persist the current vault state to disk (encrypted). */
function flushVault(): void {
  if (!vaultCache) return;
  ensureVaultDir();
  try {
    const plaintext = JSON.stringify(vaultCache);
    const envelope = encrypt(plaintext);
    writeFileSync(VAULT_FILE, JSON.stringify(envelope), 'utf8');
  } catch (err) {
    console.error('[Vault] Failed to encrypt and write vault to disk.', err);
  }
}

/**
 * Record an interaction in the Obsidian Vault.
 *
 * @param hostInput - The Host's raw message
 * @param xenoResponse - XENO's narrative response
 * @param entropy - The EntropyResult from the brain module
 */
export function recordInteraction(
  hostInput: string,
  xenoResponse: string,
  entropy: EntropyResult
): void {
  const vault = loadVault();
  const tag = extractEmotionalTag(hostInput, xenoResponse, entropy);
  const entry = createTimelineEntry(tag, hostInput, xenoResponse);
  appendToTimeline(vault, entry);
  flushVault();
}

/**
 * Get the vault's emotional history summary for prompt injection.
 */
export function getVaultHistorySummary(recentCount: number = 5): string {
  const vault = loadVault();
  return generateHistorySummary(vault, recentCount);
}

/** Get aggregate vault statistics. */
export function getVaultStats(): VaultData['stats'] {
  const vault = loadVault();
  return { ...vault.stats };
}

/** Get the total number of recorded interactions. */
export function getInteractionCount(): number {
  const vault = loadVault();
  return vault.stats.totalInteractions;
}