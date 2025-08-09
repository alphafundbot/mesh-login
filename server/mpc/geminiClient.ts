// server/mpc/geminiClient.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import axios from 'axios';

const client = new SecretManagerServiceClient();

async function getGeminiKey(): Promise<string> {
  const [version] = await client.accessSecretVersion({
    name: 'projects/YOUR_PROJECT_ID/secrets/GEMINI_API_KEY/versions/latest'
  });
  return version.payload?.data?.toString() || '';
}

export async function generateGeminiContent(prompt: string): Promise<any> {
  const apiKey = await getGeminiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await axios.post(url, { contents: [{ parts: [{ text: prompt }] }] });
  return response.data;
}