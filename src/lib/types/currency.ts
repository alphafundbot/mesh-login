
import { z } from 'zod';

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
