// src/app/api/gemini/route.ts
import { generateGeminiContent } from '@/server/mpc/geminiClient';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebaseConfig'; // Import Firebase Auth
import { getIdTokenResult } from 'firebase/auth'; // Import function to get ID token and claims
import { canUserPerform } from '@/lib/roles'; // Import canUserPerform

// Define the required action for using the Gemini API (adjust as needed based on roles.ts)
const REQUIRED_ACTION = 'useGeminiApi'; // Example: define a new action

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    const idToken = authHeader?.split('Bearer ')[1];

    if (!idToken) {
      return new NextResponse('Unauthorized', { status: 401 });
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
