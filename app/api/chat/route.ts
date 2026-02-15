import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { XENO_SYSTEM_PROMPT } from '@/core/personality';
import { getRelevantMemories } from '@/core/memory';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
const MEMORY_INSTRUCTION = `Use these only when they apply. Reference coldly. Do not list memories.`;
export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OPENAI_API_KEY is not set' }, { status: 500 });
  try {
    const body = (await req.json()) as { messages?: Array<{ role: string; content: string }> };
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const lastUser = messages.filter(m=>m.role==='user').pop()?.content ?? '';
    const memories = getRelevantMemories(lastUser, 5);
    const memoryBlock = memories.length > 0 ? `\n\n## Relevant past experiences\n${memories.map(m=>`- ${m.content}`).join('\n')}${MEMORY_INSTRUCTION}` : '';
    const systemContent = XENO_SYSTEM_PROMPT + memoryBlock;
    const fullMessages = [{ role: 'system' as const, content: systemContent }, ...messages];
    const res = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: fullMessages, stream: false, max_tokens: 256, temperature: 0.7 });
    const content = res.choices[0]?.message?.content?.trim() ?? '';
    return NextResponse.json({ content });
  } catch (e) { console.error(e); return NextResponse.json({ error: e instanceof Error ? e.message : 'Chat failed' }, { status: 500 }); }
}