import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { XENO_TRADE_EVALUATE_SYSTEM_PROMPT } from '@/core/personality';
import { getRelevantMemories } from '@/core/memory';

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY is not set' },
      { status: 500 }
    );
  }

  try {
    const body = (await req.json()) as {
      tokenAddress?: string;
      riskLevel?: string;
    };
    const tokenAddress = typeof body.tokenAddress === 'string' ? body.tokenAddress.trim() : '';
    const riskLevel = typeof body.riskLevel === 'string' ? body.riskLevel.trim() : '';

    if (!tokenAddress) {
      return NextResponse.json(
        { error: 'Missing or invalid tokenAddress' },
        { status: 400 }
      );
    }

    const query = [tokenAddress, riskLevel, 'trade', 'loss', 'meme', 'risk'].filter(Boolean).join(' ');
    const memories = getRelevantMemories(query, 5);
    const memoryBlock =
      memories.length > 0
        ? `Host's relevant past (failures / patterns):\n${memories.map((m) => `- ${m.content}`).join('\n')}`
        : "No specific past experiences loaded for this context.";

    const userContent = `Token: ${tokenAddress}\nRisk level: ${riskLevel || 'unspecified'}\n\n${memoryBlock}\n\nRespond with a single cold feedback string. No bullet points, no JSON.`;

    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: XENO_TRADE_EVALUATE_SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      stream: false,
      max_tokens: 280,
      temperature: 0.6,
    });

    const feedback = res.choices[0]?.message?.content?.trim() ?? '';

    return NextResponse.json({ feedback });
  } catch (e) {
    console.error('[Trade evaluate]', e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Evaluation failed' },
      { status: 500 }
    );
  }
}