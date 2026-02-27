/**
 * types/hardware.ts -- Hardware Resonance type definitions.
 */

export type HardwareBand = 'LOW_LOAD' | 'NOMINAL' | 'HIGH_LOAD';

export interface HardwareResonanceState {
  active: boolean;
  cpuLoad: number;
  cpuFrequencyGHz: number;
  neuralPulse: number;
  band: HardwareBand;
  sampleAt: number;
}