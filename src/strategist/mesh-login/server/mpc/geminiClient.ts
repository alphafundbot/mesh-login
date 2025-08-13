// server/mpc/geminiClient.ts
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import axios from 'axios';

// This is a placeholder. In a real production environment, you would
// dynamically get the project ID from the execution environment.
const GCP_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "stratagem-ai-project";

const client = new SecretManagerServiceClient();

async function getGeminiKey(): Promise<string> {
  // This check is to prevent calls during local dev if the secret is not set up.
  // In a real deployed environment, the secret should always be present.
  if (!process.env.GEMINI_API_KEY && process.env.NODE_ENV === 'development') {
      console.warn("GEMINI_API_KEY not found in local env, using placeholder. This will fail if not mocked.");
      return "mock-api-key";
  }
  if(process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }

  const name = `projects/${GCP_PROJECT_ID}/secrets/GEMINI_API_KEY/versions/latest`;
  try {
    const [version] = await client.accessSecretVersion({ name });
    const secretPayload = version.payload?.data?.toString();
    if (!secretPayload) {
      throw new Error('Secret payload is empty.');
    }
    return secretPayload;
  } catch (error) {
    console.error(`Failed to access secret: ${name}`, error);
    throw new Error('Could not retrieve Gemini API key from Secret Manager.');
  }
}

export async function generateGeminiContent(prompt: string): Promise<any> {
  const apiKey = await getGeminiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data;
  } catch (error: any) {
    // Log the detailed error for server-side debugging
    console.error("Error calling Gemini API:", error.response?.data || error.message);
    // Re-throw a more generic error to the client
    throw new Error(`Gemini API request failed with status: ${error.response?.status}`);
  }
}

// Function to get Firebase config from environment variables
export function getFirebaseConfig() {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  // Basic validation (optional, but recommended)
  for (const key in firebaseConfig) {
    if (!firebaseConfig[key as keyof typeof firebaseConfig]) {
      console.warn(`Firebase config missing environment variable: ${key}. Ensure secrets are configured in Google Secret Manager and apphosting.yaml.`);
    }
  }

  return firebaseConfig;
}
