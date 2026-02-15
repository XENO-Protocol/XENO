import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { XENO_JOURNAL_SYSTEM_PROMPT } from '@/core/personality';
import type { JournalResult } from '@/types';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OPENAI_API_KEY is not set' }, { status: 500 });
  try {
    const { entry } = (await req.json()) as { entry: string };
    if (!entry || typeof entry !== 'string') return NextResponse.json({ error: 'Missing or invalid entry' }, { status: 400 });
    const res = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: XENO_JOURNAL_SYSTEM_PROMPT }, { role: 'user', content: `Host journal:\n\n${entry.trim()}` }], stream: false, max_tokens: 256, temperature: 0.6 });
    const raw = res.choices[0]?.message?.content?.trim() ?? '';
    const cleaned = raw.replace(/^```json\s*/i,'').replace(/\s*```\s*$/i,'').trim();
    let parsed: JournalResult;
    try { parsed = JSON.parse(cleaned) as JournalResult; } catch { return NextResponse.json({ error: 'Invalid model response' }, { status: 502 }); }
    return NextResponse.json({ survivalProbability: Math.min(100,Math.max(0,Number(parsed.survivalProbability)||0)), survivalLabel: String(parsed.survivalLabel??'Unknown').slice(0,40), encouragement: String(parsed.encouragement??'Syncing.').slice(0,500) });
  } catch (e) { console.error(e); return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 }); }
}