'use server';

/**
 * @fileOverview A simple flow to check the health of the Gemini API connection.
 *
 * - checkApiHealth - A function that performs a simple generation task.
 * - HealthCheckOutput - The return type for the checkApiHealth function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const HealthCheckOutputSchema = z.object({
  status: z.string().describe("The status of the API call, either 'OK' or 'Error'."),
  message: z.string().describe("A confirmation message or an error detail."),
});
export type HealthCheckOutput = z.infer<typeof HealthCheckOutputSchema>;

export async function checkApiHealth(): Promise<HealthCheckOutput> {
  try {
    const { output } = await ai.generate({
      prompt: "Say 'Hello World'",
      model: 'googleai/gemini-1.5-flash-latest',
      config: {
        temperature: 0,
      }
    });
    
    if (output && typeof output === 'string') {
        return { status: 'OK', message: `API responded successfully. The AI says: "${output}"` };
    }
    
    const textResponse = output as {text: string};
    if (textResponse?.text) {
        return { status: 'OK', message: `API responded successfully. The AI says: "${textResponse.text}"` };
    }
    
    // Fallback in case of unexpected successful response structure
    return { status: 'OK', message: 'API responded successfully, but the response format was unexpected.' };

  } catch (e: any) {
    console.error("API Health Check Error:", e);
    return { status: 'Error', message: e.message || "An unknown error occurred." };
  }
}
