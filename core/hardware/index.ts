/**
 * core/hardware/index.ts -- Hardware Resonance bridge.
 *
 * Polls CPU load/frequency and projects it into a Neural Pulse signal.
 */

import si from 'systeminformation';
import type { HardwareBand, HardwareResonanceState } from '@/types';

const POLL_MS = Number(process.env.HARDWARE_RESONANCE_POLL_MS ?? 3000);

let timer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

const state: HardwareResonanceState = {
  active: false,
  cpuLoad: 0,
  cpuFrequencyGHz: 0,
  neuralPulse: 0,
  band: 'NOMINAL',
  sampleAt: Date.now(),
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function classifyBand(cpuLoad: number): HardwareBand {
  if (cpuLoad > 70) return 'HIGH_LOAD';
  if (cpuLoad < 10) return 'LOW_LOAD';
  return 'NOMINAL';
}

async function sampleHardware(): Promise<void> {
  try {
    const [loadInfo, speedInfo] = await Promise.all([
      si.currentLoad(),
      si.cpuCurrentSpeed(),
    ]);

    const cpuLoad = Number(clamp(loadInfo.currentLoad, 0, 100).toFixed(1));
    const avgGHz = Number(Math.max(0.1, speedInfo.avg).toFixed(2));
    const maxGHz = Number(Math.max(avgGHz, speedInfo.max || avgGHz).toFixed(2));

    // Neural Pulse is a bounded 0-100 synthetic signal from frequency + load.
    const freqFactor = clamp((avgGHz / maxGHz) * 65, 0, 65);
    const loadFactor = clamp(cpuLoad * 0.35, 0, 35);
    const neuralPulse = Number(clamp(freqFactor + loadFactor, 0, 100).toFixed(1));

    state.active = true;
    state.cpuLoad = cpuLoad;
    state.cpuFrequencyGHz = avgGHz;
    state.neuralPulse = neuralPulse;
    state.band = classifyBand(cpuLoad);
    state.sampleAt = Date.now();
  } catch (err) {
    console.error('[HardwareResonance] Sampling failed:', err);
    state.active = false;
    state.sampleAt = Date.now();
  }
}

export function initializeHardwareResonance(): void {
  if (initialized) return;
  initialized = true;
  timer = setInterval(() => {
    sampleHardware().catch((err) =>
      console.error('[HardwareResonance] Tick failure:', err)
    );
  }, POLL_MS);
  sampleHardware().catch((err) =>
    console.error('[HardwareResonance] Initial sample failure:', err)
  );
  console.log(`[HardwareResonance] Bridge active. Poll: ${POLL_MS}ms`);
}

export function getHardwareResonanceState(): HardwareResonanceState {
  return { ...state };
}