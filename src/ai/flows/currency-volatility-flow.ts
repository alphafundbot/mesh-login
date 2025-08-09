
'use server';

/**
 * @fileOverview A flow for analyzing currency rate fluctuations for significant volatility.
 *
 * - analyzeCurrencyVolatility - A function that handles the volatility analysis.
 * - CurrencyVolatilityInput - The input type for the analyzeCurrencyVolatility function.
 * - CurrencyVolatilityOutput - The return type for the analyzeCurrencyVolatility function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
    CurrencyVolatilityInput,
    CurrencyVolatilityOutput,
    CurrencyVolatilityInputSchema,
    CurrencyVolatilityOutputSchema
} from '@/lib/types/currency';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseConfig';
import { proxyGemini } from '@/ai/client/geminiProxy';


export async function analyzeCurrencyVolatility(input: CurrencyVolatilityInput): Promise<CurrencyVolatilityOutput> {
  // This check is important because this flow can be called from server components
  // where the client-side Firebase SDK (and thus `firestore`) is not initialized.
  if (!firestore) {
    console.warn("Firestore is not initialized. Skipping cache check for currency volatility.");
    return currencyVolatilityFlow(input);
  }
  
  const cacheRef = doc(firestore, "currency_volatility_cache", "latest_analysis");
  try {
    const cacheDoc = await getDoc(cacheRef);
    if (cacheDoc.exists()) {
        const cacheData = cacheDoc.data();
        const now = new Date();
        const cacheTime = cacheData.timestamp.toDate();
        // Cache is valid for 1 hour
        if (now.getTime() - cacheTime.getTime() < 60 * 60 * 1000) {
            return cacheData.analysis as CurrencyVolatilityOutput;
        }
    }
  } catch (error) {
    console.error("Failed to read from volatility cache:", error);
    // Proceed to generate new data if cache read fails
  }

  const result = await currencyVolatilityFlow(input);

  try {
    await setDoc(cacheRef, {
        analysis: result,
        timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error("Failed to write to volatility cache:", error);
  }

  return result;
}

const handlebarsPromptTemplate = `You are a financial analyst AI specializing in foreign exchange markets. Your task is to analyze current currency rates against recent historical data to detect significant volatility.

A currency is considered volatile if its current rate shows a significant deviation (e.g., more than 2-3 standard deviations) from the established historical trend or if there is a sharp, unexpected movement.

Analyze the provided data and determine if any currency is volatile.
- If volatility is detected, set 'isVolatile' to true, identify the volatile currencies, and provide a concise analysis explaining the potential market implications.
- If the market appears stable, set 'isVolatile' to false and provide a confirmation of stability in the 'analysis' field.

Base Currency: {{baseCurrency}}

Historical Data:
{{#each historicalRates}}
Date: {{this.date}}
{{#each this.rates}}
- {{this.currency}}: {{this.rate}}
{{/each}}
{{/each}}

Current Rates:
{{#each currentRates}}
- {{this.currency}}: {{this.rate}}
{{/each}}
`;


const currencyVolatilityFlow = ai.defineFlow(
  {
    name: 'currencyVolatilityFlow',
    inputSchema: CurrencyVolatilityInputSchema,
    outputSchema: CurrencyVolatilityOutputSchema,
  },
  async (input) => {
    // This flow is now aligned with the MPC Sovereignty Protocol.
    // Instead of calling Genkit's `prompt` directly, which led to quota exhaustion,
    // we manually construct the prompt and send it through our centralized,
    // secure `proxyGemini` function. This enforces quota management at the MPC layer.
    
    let promptString = handlebarsPromptTemplate.replace('{{baseCurrency}}', input.baseCurrency);
    
    const historicalRatesString = input.historicalRates.map(h => 
      `Date: ${h.date}\n` + h.rates.map(r => `- ${r.currency}: ${r.rate}`).join('\n')
    ).join('\n');
    promptString = promptString.replace(/{{#each historicalRates}}[\s\S]*?{{\/each}}/, historicalRatesString);

    const currentRatesString = input.currentRates.map(c => `- ${c.currency}: ${c.rate}`).join('\n');
    promptString = promptString.replace(/{{#each currentRates}}[\s\S]*?{{\/each}}/, currentRatesString);
    
    // The prompt is now a simple string, which we can send to our proxy.
    // The proxy will then call the Gemini API via the secure MPC client.
    const output = await proxyGemini(promptString);
    
    // The proxy returns the raw JSON output from the Gemini API.
    // We need to parse it to fit our expected schema.
    if (output && output.candidates && output.candidates[0] && output.candidates[0].content) {
        const content = output.candidates[0].content.parts[0].text;
        // Attempt to parse the string content into our structured output.
        try {
            // A simple JSON parse might work if the model returns clean JSON.
            const parsedOutput = JSON.parse(content.replace(/```json|```/g, '').trim());
            return CurrencyVolatilityOutputSchema.parse(parsedOutput);
        } catch (e) {
            console.error("Failed to parse Gemini output into schema:", e);
            // This fallback is imperfect. A more robust solution would involve
            // asking the model to retry with a specific JSON format.
            return {
                isVolatile: content.toLowerCase().includes("volatile"),
                analysis: content,
                volatileCurrencies: []
            };
        }
    }

    throw new Error("Invalid or empty response from Gemini proxy.");
  }
);
