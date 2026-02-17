/**
 * core/engine/telemetry-bridge.ts -- Telemetry Bridge Core
 *
 * Central telemetry state engine that aggregates real-time variables
 * from the Narrative Engine subsystems (Brain, Vault, DataPulse)
 * and formats them as industrial terminal log lines for broadcast.
 */

import type {
  TelemetryFrame,
  TelemetryLogEntry,
  TelemetryMessage,
  TelemetryBridgeConfig,
} from '@/types/telemetry';
import type { EntropyBand } from '@/core/brain';

const DEFAULT_CONFIG: TelemetryBridgeConfig = {
  intervalMs: 500,
  maxClients: 50,
  requireAuth: process.env.NODE_ENV === 'production',
  wsPort: Number(process.env.TELEMETRY_WS_PORT) || 9100,
};

const BOOT_TIME = Date.now();
let sequenceCounter = 0;

const state = {
  lastEntropyScore: 0,
  lastEntropyBand: 'STABLE' as EntropyBand,
  lastSyncRatio: 1.0,
  activeMemoryNodes: 0,
  pulseCount: 0,
  pulseWindowStart: Date.now(),
  vaultStatus: 'ACTIVE' as TelemetryFrame['vault_status'],
};

type FrameListener = (msg: TelemetryMessage) => void;
const listeners: Set<FrameListener> = new Set();

// State update functions
export function updateEntropy(score: number, band: EntropyBand): void {
  state.lastEntropyScore = score;
  state.lastEntropyBand = band;
}
export function updateSyncRatio(ratio: number): void {
  state.lastSyncRatio = Math.max(0, Math.min(1, ratio));
}
export function updateMemoryNodes(count: number): void {
  state.activeMemoryNodes = count;
}
export function incrementPulseCount(): void {
  state.pulseCount++;
}
export function updateVaultStatus(status: TelemetryFrame['vault_status']): void {
  state.vaultStatus = status;
}

// Sampling
export function sampleFrame(): TelemetryFrame {
  const now = Date.now();
  const windowSeconds = (now - state.pulseWindowStart) / 1000;
  const throughput = windowSeconds > 0 ? state.pulseCount / windowSeconds : 0;
  return {
    sync_ratio: Number(state.lastSyncRatio.toFixed(3)),
    entropy_level: Number((state.lastEntropyScore * 100).toFixed(1)),
    entropy_band: state.lastEntropyBand,
    active_memory_nodes: state.activeMemoryNodes,
    pulse_throughput: Number(throughput.toFixed(2)),
    vault_status: state.vaultStatus,
    uptime_seconds: Math.floor((now - BOOT_TIME) / 1000),
    timestamp: now,
  };
}

// Industrial terminal formatting
export function formatFrameLog(frame: TelemetryFrame): TelemetryLogEntry[] {
  const ts = new Date(frame.timestamp).toISOString().slice(11, 23);
  const entries: TelemetryLogEntry[] = [];
  entries.push({
    raw: '[' + ts + '] [TELEMETRY] SYNC: ' + frame.sync_ratio.toFixed(2) + ' | ENTROPY: ' + frame.entropy_level.toFixed(1) + ' | MEM_NODES: ' + frame.active_memory_nodes + ' | PULSE/s: ' + frame.pulse_throughput.toFixed(1),
    level: frame.entropy_level > 80 ? 'CRITICAL' : frame.entropy_level > 60 ? 'WARN' : 'INFO',
    source: 'BRIDGE',
    timestamp: frame.timestamp,
  });
  if (frame.entropy_band !== 'STABLE') {
    entries.push({
      raw: '[' + ts + '] [ENTROPY] BAND: ' + frame.entropy_band + ' | LEVEL: ' + frame.entropy_level.toFixed(1) + '% | HOST_STATE: ' + (frame.entropy_band === 'CRITICAL' ? 'INTERVENTION_REQUIRED' : 'MONITORING'),
      level: frame.entropy_band === 'CRITICAL' ? 'CRITICAL' : 'WARN',
      source: 'ENTROPY',
      timestamp: frame.timestamp,
    });
  }
  entries.push({
    raw: '[' + ts + '] [VAULT] STATUS: ' + frame.vault_status + ' | NODES: ' + frame.active_memory_nodes + ' | UPTIME: ' + frame.uptime_seconds + 's',
    level: frame.vault_status === 'DEGRADED' ? 'WARN' : 'INFO',
    source: 'VAULT',
    timestamp: frame.timestamp,
  });
  if (frame.sync_ratio < 0.7) {
    entries.push({
      raw: '[' + ts + '] [SYNC] WARNING: Narrative desynchronization detected. Ratio: ' + frame.sync_ratio.toFixed(3) + '. Recalibrating.',
      level: 'WARN',
      source: 'SYNC',
      timestamp: frame.timestamp,
    });
  }
  return entries;
}

export function buildFrameMessage(frame: TelemetryFrame): TelemetryMessage {
  return { type: 'frame', seq: ++sequenceCounter, payload: frame, timestamp: frame.timestamp };
}
export function buildLogMessage(entry: TelemetryLogEntry): TelemetryMessage {
  return { type: 'log', seq: ++sequenceCounter, payload: entry, timestamp: entry.timestamp };
}
export function buildHeartbeat(): TelemetryMessage {
  return { type: 'heartbeat', seq: ++sequenceCounter, payload: { status: 'ALIVE' }, timestamp: Date.now() };
}

// Listener management
export function subscribe(listener: FrameListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function getListenerCount(): number {
  return listeners.size;
}
function broadcast(msg: TelemetryMessage): void {
  for (const listener of listeners) {
    try { listener(msg); } catch { listeners.delete(listener); }
  }
}

// Tick engine
let tickInterval: ReturnType<typeof setInterval> | null = null;

function tick(): void {
  const frame = sampleFrame();
  broadcast(buildFrameMessage(frame));
  for (const entry of formatFrameLog(frame)) {
    broadcast(buildLogMessage(entry));
  }
}

export function startBridge(config?: Partial<TelemetryBridgeConfig>): void {
  if (tickInterval) return;
  const cfg = { ...DEFAULT_CONFIG, ...config };
  tickInterval = setInterval(tick, cfg.intervalMs);
  const bootLog: TelemetryLogEntry = {
    raw: '[' + new Date().toISOString().slice(11, 23) + '] [BRIDGE] ONLINE | Interval: ' + cfg.intervalMs + 'ms | Max clients: ' + cfg.maxClients + ' | Auth: ' + (cfg.requireAuth ? 'ENFORCED' : 'DISABLED'),
    level: 'INFO',
    source: 'BRIDGE',
    timestamp: Date.now(),
  };
  broadcast(buildLogMessage(bootLog));
}

export function stopBridge(): void {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null; }
}
export function isBridgeActive(): boolean {
  return tickInterval !== null;
}
export function getDefaultConfig(): TelemetryBridgeConfig {
  return { ...DEFAULT_CONFIG };
}