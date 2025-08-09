// pages/api/gemini.ts
import { generateGeminiContent } from '../../server/mpc/geminiClient';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body;
  try {
    const output = await generateGeminiContent(prompt);
    res.status(200).json({ output });
  } catch (err) {
    console.error('Gemini MPC error:', err);
    res.status(500).json({ error: 'MPC Gemini failure' });
  }
}