
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

const CurrencyRateSchema = z.object({
  currency: z.string().describe('The currency code (e.g., EUR, JPY).'),
  rate: z.number().describe('The exchange rate against the base currency.'),
});

export const CurrencyVolatilityInputSchema = z.object({
  baseCurrency: z.string().describe('The base currency for the rates.'),
  historicalRates: z.array(z.object({
    date: z.string().describe('The date of the historical data point (e.g., YYYY-MM-DD).'),
    rates: z.array(CurrencyRateSchema),
  })).describe('An array of historical currency rates to establish a baseline.'),
  currentRates: z.array(CurrencyRateSchema).describe('The current currency rates to analyze.'),
});
export type CurrencyVolatilityInput = z.infer<typeof CurrencyVolatilityInputSchema>;

export const CurrencyVolatilityOutputSchema = z.object({
    isVolatile: z.boolean().describe('Whether significant volatility was detected in any currency.'),
    analysis: z.string().describe('A summary of the volatility analysis. If not volatile, confirms stability. If volatile, explains which currencies are affected and why it is significant.'),
    volatileCurrencies: z.array(z.string()).describe('A list of currency codes that are experiencing significant volatility.'),
});
export type CurrencyVolatilityOutput = z.infer<typeof CurrencyVolatilityOutputSchema>;

export async function analyzeCurrencyVolatility(input: CurrencyVolatilityInput): Promise<CurrencyVolatilityOutput> {
  return currencyVolatilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'currencyVolatilityPrompt',
  input: {schema: CurrencyVolatilityInputSchema},
  output: {schema: CurrencyVolatilityOutputSchema},
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
