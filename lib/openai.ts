/**
 * Shared OpenAI client instance.
 * All API routes import from here to avoid redundant instantiation.
 */

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.warn('[XENO] OPENAI_API_KEY is not set. LLM calls will fail.');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});