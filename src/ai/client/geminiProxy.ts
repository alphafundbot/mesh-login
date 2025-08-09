// src/ai/client/geminiProxy.ts
export async function proxyGemini(prompt: string): Promise<any> {
  const res = await fetch('/api/gemini', {
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
