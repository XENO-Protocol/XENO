export { buildHunterBriefing } from './hunter';
export { generatePulse } from './stream';
export type { PulseData, PulseResult } from './stream';
export {
  startBridge,
  stopBridge,
  isBridgeActive,
  subscribe,
  sampleFrame,
  updateEntropy,
  updateSyncRatio,
  updateMemoryNodes,
  updateVaultStatus,
  incrementPulseCount,
  formatFrameLog,
  buildFrameMessage,
  buildLogMessage,
  buildHeartbeat,
} from './telemetry-bridge';