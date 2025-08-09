
'use server';

/**
 * @fileOverview A simple flow to check the health of the Gemini API connection.
 *
 * - checkApiHealth - A function that performs a simple generation task and logs the result.
 * - HealthCheckOutput - The return type for the checkApiHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from '@/lib/firebaseConfig';

const HealthCheckOutputSchema = z.object({
  status: z.string().describe("The status of the API call, either 'OK' or 'Error'."),
  message: z.string().describe("A confirmation message or an error detail."),
});
export type HealthCheckOutput = z.infer<typeof HealthCheckOutputSchema>;

export async function checkApiHealth(): Promise<HealthCheckOutput> {
  let result: HealthCheckOutput;
  try {
    const { output } = await ai.generate({
      prompt: "Say 'Hello World'",
      model: 'googleai/gemini-1.5-flash',
      config: {
        temperature: 0,
      }
    });
    
    const textResponse = output?.text;

    if (textResponse) {
        result = { status: 'OK', message: `API responded successfully. The AI says: "${textResponse}"` };
    } else {
        result = { status: 'OK', message: 'API responded successfully, but the response format was unexpected.' };
    }
  } catch (e: any) {
    console.error("API Health Check Error:", e);
    result = { status: 'Error', message: e.message || "An unknown error occurred." };
  }

  try {
    await addDoc(collection(firestore, "health_checks"), {
      ...result,
      timestamp: serverTimestamp(),
    });
  } catch (dbError: any) {
    console.error("Failed to log health check to Firestore:", dbError);
    // Do not alter the original result if logging fails, just log the error.
  }
  
  return result;
}
