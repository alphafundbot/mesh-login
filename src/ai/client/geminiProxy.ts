// src/ai/client/geminiProxy.ts
export async function proxyGemini(prompt: string): Promise<any> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to proxy Gemini request');
  }
  return data.output;
}