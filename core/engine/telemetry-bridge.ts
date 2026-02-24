/**
 * core/engine/telemetry-bridge.ts -- Telemetry Bridge Core
 *
 * Central telemetry state engine that aggregates real-time variables
 * from the Narrative Engine subsystems (Brain, Vault, DataPulse)
 * and formats them as industrial terminal log lines for broadcast.
 *
 * Architecture:
 *   [Brain.entropy] 鈹€鈹? *   [Vault.stats]  鈹€鈹€鈹も攢鈹€ TelemetryBridge.sample() 鈹€鈹€> TelemetryFrame
 *   [DataPulse]    鈹€鈹€鈹?          鈹? *                        formatLogLine() 鈹€鈹€> Industrial Terminal Output
 *
 * The bridge operates on a configurable tick interval (default 500ms).
 * Each tick samples all subsystems, computes derived metrics, formats
 * the output, and notifies all registered listeners.
 */

import type {
  TelemetryFrame,
  TelemetryLogEntry,
  TelemetryMessage,
  TelemetryBridgeConfig,
} from '@/types/telemetry';
import type { EntropyBand } from '@/core/brain';

/** Default configuration */
const DEFAULT_CONFIG: TelemetryBridgeConfig = {
  intervalMs: 500,
  maxClients: 50,
  requireAuth: process.env.NODE_ENV === 'production',
  wsPort: Number(process.env.TELEMETRY_WS_PORT) || 9100,
};

/** Bridge startup timestamp for uptime calculation */
const BOOT_TIME = Date.now();

/** Monotonic sequence counter for message ordering */
let sequenceCounter = 0;

/**
 * Mutable state registers updated by external subsystems.
 * These are written to by the chat route and other services
 * via the exported update functions.
 */
const state = {
  lastEntropyScore: 0,
  lastEntropyBand: 'STABLE' as EntropyBand,
  lastSyncRatio: 1.0,
  resonanceBoost: 0,
  activeDeveloperTools: 0,
  activeMemoryNodes: 0,
  pulseCount: 0,
  pulseWindowStart: Date.now(),
  vaultStatus: 'ACTIVE' as TelemetryFrame['vault_status'],
};

/** Registered frame listeners (SSE endpoints, WebSocket broadcasters) */
type FrameListener = (msg: TelemetryMessage) => void;
const listeners: Set<FrameListener> = new Set();

// 鈹€鈹€鈹€ State Update Functions (called by external subsystems) 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

/**
 * Update entropy telemetry from the Brain module.
 * Called after each Host interaction entropy calculation.
 */
export function updateEntropy(score: number, band: EntropyBand): void {
  state.lastEntropyScore = score;
  state.lastEntropyBand = band;
}

/**
 * Update sync ratio (narrative coherence metric).
 * Derived from response latency and prompt compilation success.
 * Range: 0.0 (desync) to 1.0 (perfect lock).
 */
export function updateSyncRatio(ratio: number): void {
  state.lastSyncRatio = Math.max(0, Math.min(1, ratio));
}

/**
 * Update environmental resonance signal.
 * This acts as a subtle additive sync boost when developer tools are active.
 */
export function updateResonanceSignal(boost: number, activeTools: number): void {
  state.resonanceBoost = Math.max(0, Math.min(0.2, boost));
  state.activeDeveloperTools = Math.max(0, Math.floor(activeTools));
}

/**
 * Update active memory node count from the Obsidian Vault.
 */
export function updateMemoryNodes(count: number): void {
  state.activeMemoryNodes = count;
}

/**
 * Increment the DataPulse counter.
 * Called each time a pulse is generated or processed.
 */
export function incrementPulseCount(): void {
  state.pulseCount++;
}

/**
 * Update vault operational status.
 */
export function updateVaultStatus(status: TelemetryFrame['vault_status']): void {
  state.vaultStatus = status;
}

// 鈹€鈹€鈹€ Sampling & Formatting 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

/**
 * Sample the current state of all subsystems into a TelemetryFrame.
 */
export function sampleFrame(): TelemetryFrame {
  const now = Date.now();
  const windowSeconds = (now - state.pulseWindowStart) / 1000;
  const throughput = windowSeconds > 0 ? state.pulseCount / windowSeconds : 0;
  const syncRatio = Math.max(0, Math.min(1, state.lastSyncRatio + state.resonanceBoost));

  return {
    sync_ratio: Number(syncRatio.toFixed(3)),
    entropy_level: Number((state.lastEntropyScore * 100).toFixed(1)),
    entropy_band: state.lastEntropyBand,
    active_memory_nodes: state.activeMemoryNodes,
    active_dev_tools: state.activeDeveloperTools,
    pulse_throughput: Number(throughput.toFixed(2)),
    vault_status: state.vaultStatus,
    uptime_seconds: Math.floor((now - BOOT_TIME) / 1000),
    timestamp: now,
  };
}

/**
 * Format a TelemetryFrame into industrial terminal log lines.
 * Output style: [TELEMETRY] SYNC: 0.89 | ENTROPY: 42.1 | ...
 */
export function formatFrameLog(frame: TelemetryFrame): TelemetryLogEntry[] {
  const ts = new Date(frame.timestamp).toISOString().slice(11, 23);
  const entries: TelemetryLogEntry[] = [];

  // Primary telemetry line
  entries.push({
    raw: `[${ts}] [TELEMETRY] SYNC: ${frame.sync_ratio.toFixed(2)} | ENTROPY: ${frame.entropy_level.toFixed(1)} | MEM_NODES: ${frame.active_memory_nodes} | TOOLS: ${frame.active_dev_tools} | PULSE/s: ${frame.pulse_throughput.toFixed(1)}`,
    level: frame.entropy_level > 80 ? 'CRITICAL' : frame.entropy_level > 60 ? 'WARN' : 'INFO',
    source: 'BRIDGE',
    timestamp: frame.timestamp,
  });

  // Entropy-specific line (only when elevated)
  if (frame.entropy_band !== 'STABLE') {
    entries.push({
      raw: `[${ts}] [ENTROPY] BAND: ${frame.entropy_band} | LEVEL: ${frame.entropy_level.toFixed(1)}% | HOST_STATE: ${frame.entropy_band === 'CRITICAL' ? 'INTERVENTION_REQUIRED' : 'MONITORING'}`,
      level: frame.entropy_band === 'CRITICAL' ? 'CRITICAL' : 'WARN',
      source: 'ENTROPY',
      timestamp: frame.timestamp,
    });
  }

  // Vault status line
  entries.push({
    raw: `[${ts}] [VAULT] STATUS: ${frame.vault_status} | NODES: ${frame.active_memory_nodes} | UPTIME: ${frame.uptime_seconds}s`,
    level: frame.vault_status === 'DEGRADED' ? 'WARN' : 'INFO',
    source: 'VAULT',
    timestamp: frame.timestamp,
  });

  // Sync degradation warning
  if (frame.sync_ratio < 0.7) {
    entries.push({
      raw: `[${ts}] [SYNC] WARNING: Narrative desynchronization detected. Ratio: ${frame.sync_ratio.toFixed(3)}. Recalibrating.`,
      level: 'WARN',
      source: 'SYNC',
      timestamp: frame.timestamp,
    });
  }

  return entries;
}

/**
 * Build a complete TelemetryMessage from a frame.
 */
export function buildFrameMessage(frame: TelemetryFrame): TelemetryMessage {
  return {
    type: 'frame',
    seq: ++sequenceCounter,
    payload: frame,
    timestamp: frame.timestamp,
  };
}

/**
 * Build a log-type TelemetryMessage.
 */
export function buildLogMessage(entry: TelemetryLogEntry): TelemetryMessage {
  return {
    type: 'log',
    seq: ++sequenceCounter,
    payload: entry,
    timestamp: entry.timestamp,
  };
}

/**
 * Build a heartbeat message.
 */
export function buildHeartbeat(): TelemetryMessage {
  return {
    type: 'heartbeat',
    seq: ++sequenceCounter,
    payload: { status: 'ALIVE' },
    timestamp: Date.now(),
  };
}

// 鈹€鈹€鈹€ Listener Management 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

/**
 * Register a listener for telemetry broadcasts.
 * Returns an unsubscribe function.
 */
export function subscribe(listener: FrameListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/**
 * Get the current number of connected listeners.
 */
export function getListenerCount(): number {
  return listeners.size;
}

/**
 * Broadcast a message to all registered listeners.
 */
function broadcast(msg: TelemetryMessage): void {
  for (const listener of listeners) {
    try {
      listener(msg);
    } catch {
      listeners.delete(listener);
    }
  }
}

// 鈹€鈹€鈹€ Tick Engine 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

let tickInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Execute a single telemetry tick:
 * 1. Sample all subsystems
 * 2. Format log lines
 * 3. Broadcast frame + logs to all listeners
 */
function tick(): void {
  const frame = sampleFrame();
  const frameMsg = buildFrameMessage(frame);
  broadcast(frameMsg);

  const logs = formatFrameLog(frame);
  for (const entry of logs) {
    broadcast(buildLogMessage(entry));
  }
}

/**
 * Start the Telemetry Bridge tick engine.
 * Samples and broadcasts at the configured interval.
 *
 * @param config - Partial configuration override
 */
export function startBridge(config?: Partial<TelemetryBridgeConfig>): void {
  if (tickInterval) return; // Already running

  const cfg = { ...DEFAULT_CONFIG, ...config };
  tickInterval = setInterval(tick, cfg.intervalMs);

  const bootLog: TelemetryLogEntry = {
    raw: `[${new Date().toISOString().slice(11, 23)}] [BRIDGE] ONLINE | Interval: ${cfg.intervalMs}ms | Max clients: ${cfg.maxClients} | Auth: ${cfg.requireAuth ? 'ENFORCED' : 'DISABLED'}`,
    level: 'INFO',
    source: 'BRIDGE',
    timestamp: Date.now(),
  };
  broadcast(buildLogMessage(bootLog));
}

/**
 * Stop the Telemetry Bridge tick engine.
 */
export function stopBridge(): void {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

/**
 * Check if the bridge is currently running.
 */
export function isBridgeActive(): boolean {
  return tickInterval !== null;
}

/**
 * Get the default bridge configuration.
 */
export function getDefaultConfig(): TelemetryBridgeConfig {
  return { ...DEFAULT_CONFIG };
}