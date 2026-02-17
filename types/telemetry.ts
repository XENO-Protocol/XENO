/**
 * types/telemetry.ts -- Telemetry Bridge type definitions.
 */

import type { EntropyBand } from '@/core/brain';

/** Core telemetry variables broadcast every tick */
export interface TelemetryFrame {
  sync_ratio: number;
  entropy_level: number;
  entropy_band: EntropyBand;
  active_memory_nodes: number;
  pulse_throughput: number;
  vault_status: 'SEALED' | 'ACTIVE' | 'DEGRADED';
  uptime_seconds: number;
  timestamp: number;
}

/** Formatted telemetry log line for terminal display */
export interface TelemetryLogEntry {
  raw: string;
  level: 'INFO' | 'WARN' | 'CRITICAL' | 'DEBUG';
  source: 'SYNC' | 'ENTROPY' | 'VAULT' | 'PULSE' | 'BRIDGE';
  timestamp: number;
}

/** WebSocket message envelope */
export interface TelemetryMessage {
  type: 'frame' | 'log' | 'heartbeat' | 'auth_ack' | 'error';
  seq: number;
  payload: TelemetryFrame | TelemetryLogEntry | { status: string } | { error: string };
  timestamp: number;
}

/** Client authentication token for WebSocket handshake */
export interface TelemetryAuthPayload {
  token: string;
  clientId: string;
}

/** Telemetry Bridge configuration */
export interface TelemetryBridgeConfig {
  intervalMs: number;
  maxClients: number;
  requireAuth: boolean;
  wsPort: number;
}