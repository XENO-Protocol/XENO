/**
 * types/telemetry.ts -- Telemetry Bridge type definitions.
 *
 * Covers real-time telemetry frames, WebSocket message envelopes,
 * and connection authentication structures for the Telemetry Bridge.
 */

import type { EntropyBand } from '@/core/brain';

/** Core telemetry variables broadcast every tick */
export interface TelemetryFrame {
  /** Narrative-to-Host synchronization ratio (0.0 - 1.0) */
  sync_ratio: number;
  /** Current Host entropy level (0.0 - 100.0, scaled from 0-1) */
  entropy_level: number;
  /** Entropy band classification */
  entropy_band: EntropyBand;
  /** Number of active memory nodes in the Obsidian Vault */
  active_memory_nodes: number;
  /** Number of active developer tools detected by Resonance Listener */
  active_dev_tools: number;
  /** DataPulse throughput (pulses processed in current window) */
  pulse_throughput: number;
  /** Vault encryption status */
  vault_status: 'SEALED' | 'ACTIVE' | 'DEGRADED';
  /** System uptime in seconds */
  uptime_seconds: number;
  /** UNIX timestamp of this frame */
  timestamp: number;
}

/** Formatted telemetry log line for terminal display */
export interface TelemetryLogEntry {
  /** Raw formatted log string (industrial terminal style) */
  raw: string;
  /** Severity/priority level */
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'DEBUG';
  /** Source subsystem identifier */
  source: 'SYNC' | 'ENTROPY' | 'VAULT' | 'PULSE' | 'BRIDGE';
  /** UNIX timestamp */
  timestamp: number;
}

/** WebSocket message envelope */
export interface TelemetryMessage {
  /** Message type discriminator */
  type: 'frame' | 'log' | 'heartbeat' | 'auth_ack' | 'error';
  /** Sequence number for ordering */
  seq: number;
  /** Payload (type-dependent) */
  payload: TelemetryFrame | TelemetryLogEntry | { status: string } | { error: string };
  /** UNIX timestamp */
  timestamp: number;
}

/** Client authentication token for WebSocket handshake */
export interface TelemetryAuthPayload {
  /** Shared secret or API key */
  token: string;
  /** Client identifier */
  clientId: string;
}

/** Telemetry Bridge configuration */
export interface TelemetryBridgeConfig {
  /** Broadcast interval in milliseconds (default: 500ms) */
  intervalMs: number;
  /** Maximum connected clients (default: 50) */
  maxClients: number;
  /** Enable authentication requirement (default: true in production) */
  requireAuth: boolean;
  /** Port for standalone WebSocket server (default: 9100) */
  wsPort: number;
}