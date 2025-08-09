// src/ai/client/geminiProxy.ts
export async function proxyGemini(prompt: string): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  const res = await fetch(`${baseUrl}/api/gemini`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  
  if (!res.ok) {
    let errorData;
    try {
        errorData = await res.json();
    } catch (e) {
        errorData = { error: "An unknown error occurred with the proxy." };
    }
    console.error("Proxy Gemini Error:", errorData);
    throw new Error(errorData.error || `Failed to proxy Gemini request with status: ${res.status}`);
  }
  
  const data = await res.json();
  return data.output;
}
