// src/app/api/gemini/route.ts
import { generateGeminiContent } from '@/server/mpc/geminiClient';
import { NextRequest, NextResponse } from 'next/server';
import { canUserPerform } from '@/lib/roles';
import { auth } from 'firebase-admin';

// Define the required action for using the Gemini API
const REQUIRED_ACTION = 'useGeminiApi';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized: Missing or invalid token', { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(idToken);
    const userRole = (decodedToken.role || 'Analyst') as any;

    if (!canUserPerform(userRole, REQUIRED_ACTION)) {
      return new NextResponse('Forbidden: Insufficient permissions', { status: 403 });
    }

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
