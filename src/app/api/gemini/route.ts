// src/app/api/gemini/route.ts
import { generateGeminiContent } from '@/server/mpc/geminiClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    const output = await generateGeminiContent(prompt);
    return NextResponse.json({ output });
  } catch (err: any) {
    console.error('Gemini MPC error:', err);
    // It's good practice to not expose detailed internal errors.
    const message = err.message || 'An internal server error occurred';
    return NextResponse.json({ error: 'MPC Gemini failure', details: message }, { status: 500 });
  }
}
