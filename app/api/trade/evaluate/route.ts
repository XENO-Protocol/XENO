import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { XENO_TRADE_EVALUATE_SYSTEM_PROMPT } from '@/core/personality';
import { getRelevantMemories } from '@/core/memory';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OPENAI_API_KEY is not set' }, { status: 500 });
  try {
    const body = (await req.json()) as { tokenAddress?: string; riskLevel?: string };
    const tokenAddress = typeof body.tokenAddress === 'string' ? body.tokenAddress.trim() : '';
    const riskLevel = typeof body.riskLevel === 'string' ? body.riskLevel.trim() : '';
    if (!tokenAddress) return NextResponse.json({ error: 'Missing tokenAddress' }, { status: 400 });
    const query = [tokenAddress, riskLevel, 'trade', 'loss', 'meme', 'risk'].filter(Boolean).join(' ');
    const memories = getRelevantMemories(query, 5);
    const memoryBlock = memories.length > 0 ? `Host past:\n${memories.map(m=>`- ${m.content}`).join('\n')}` : 'No past loaded.';
    const userContent = `Token: ${tokenAddress}\nRisk: ${riskLevel||'unspecified'}\n\n${memoryBlock}\n\nOne cold feedback string. No bullets, no JSON.`;
    const res = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: XENO_TRADE_EVALUATE_SYSTEM_PROMPT }, { role: 'user', content: userContent }], stream: false, max_tokens: 280, temperature: 0.6 });
    const feedback = res.choices[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ feedback });
  } catch (e) { console.error(e); return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 }); }
}