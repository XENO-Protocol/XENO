/**
 * Chat -- Message types for dialogue.
 */

export interface MessageIdentity {
  mode: 'SOVEREIGN' | 'RESTRICTED';
  fingerprint: string;
  signature: string;
  nonce: number;
  sovereign: boolean;
}

export type IntegrityStatus = 'VERIFIED' | 'UNSIGNED' | 'COMPROMISED';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  done?: boolean;
  identity?: MessageIdentity;
  integrity?: IntegrityStatus;
}