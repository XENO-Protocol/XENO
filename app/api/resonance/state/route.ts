import { NextResponse } from 'next/server';
import { getResonanceState, initializeResonanceListener } from '@/core/resonance';

initializeResonanceListener();

export async function GET() {
  const resonance = getResonanceState();
  return NextResponse.json({
    mode: resonance.mode,
    status: resonance.status,
    syncBoost: resonance.syncBoost,
    activeDeveloperTools: resonance.activeDeveloperTools,
    codingActiveMs: resonance.codingActiveMs,
    ingestingFragment: resonance.ingestingFragment,
    lastFragment: resonance.lastFragment,
    milestones: resonance.milestones,
  });
}