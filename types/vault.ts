/**
 * types/vault.ts -- Obsidian Vault type definitions.
 * Covers encrypted storage records, emotional tag entries,
 * and time-series timeline events.
 */

import type { EmotionTag } from '@/core/brain';
import type { EntropyBand } from '@/core/brain';

/** A single emotional tag extracted from a narrative exchange */
export interface EmotionalTag {
  /** Primary detected emotion */
  emotion: EmotionTag;
  /** Entropy score at time of extraction (0.0-1.0) */
  entropyScore: number;
  /** Entropy band classification */
  entropyBand: EntropyBand;
  /** Secondary emotions detected (if any) */
  secondary: EmotionTag[];
  /** Keywords that triggered the classification */
  triggerKeywords: string[];
  /** Confidence of the primary classification (0.0-1.0) */
  confidence: number;
}

/** A timestamped entry in the emotional timeline */
export interface TimelineEntry {
  /** Unique identifier */
  id: string;
  /** UNIX timestamp (ms) of the interaction */
  timestamp: number;
  /** ISO 8601 date string for readability */
  dateISO: string;
  /** The emotional tag extracted from this interaction */
  tag: EmotionalTag;
  /** Truncated Host input that produced this entry (max 200 chars) */
  hostInputPreview: string;
  /** Truncated XENO response preview (max 200 chars) */
  xenoResponsePreview: string;
  /** Session identifier to group entries by conversation */
  sessionId: string;
}

/** Encrypted data envelope stored on disk */
export interface EncryptedEnvelope {
  /** AES-256-GCM initialization vector (hex) */
  iv: string;
  /** AES-256-GCM authentication tag (hex) */
  authTag: string;
  /** Encrypted payload (hex) */
  ciphertext: string;
  /** Algorithm identifier for forward compatibility */
  algorithm: 'aes-256-gcm';
  /** Schema version for migration support */
  version: number;
  /** Timestamp of encryption operation */
  encryptedAt: number;
}

/** The decrypted vault data structure */
export interface VaultData {
  /** Timeline of emotional state entries */
  timeline: TimelineEntry[];
  /** Aggregate statistics */
  stats: {
    totalInteractions: number;
    dominantEmotion: EmotionTag | null;
    averageEntropy: number;
    lastUpdated: number;
  };
}