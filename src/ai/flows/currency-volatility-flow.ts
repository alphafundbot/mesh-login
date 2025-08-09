
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

const prompt = ai.definePrompt({
  name: 'currencyVolatilityPrompt',
  input: {schema: CurrencyVolatilityInputSchema},
  output: {schema: CurrencyVolatilityOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a financial analyst AI specializing in foreign exchange markets. Your task is to analyze current currency rates against recent historical data to detect significant volatility.

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
`,
});

const currencyVolatilityFlow = ai.defineFlow(
  {
    name: 'currencyVolatilityFlow',
    inputSchema: CurrencyVolatilityInputSchema,
    outputSchema: CurrencyVolatilityOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
