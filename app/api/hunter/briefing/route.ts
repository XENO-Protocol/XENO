import { NextResponse } from 'next/server';
import { buildHunterBriefing } from '@/core/engine';
export async function GET() {
  try { const briefing = buildHunterBriefing(); return NextResponse.json(briefing); }
  catch (e) { console.error(e); return NextResponse.json({ error: e instanceof Error ? e.message : 'Briefing failed' }, { status: 500 }); }
}