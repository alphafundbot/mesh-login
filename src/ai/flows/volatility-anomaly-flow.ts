
'use server';

/**
 * @fileOverview A flow for detecting anomalous spikes in forecast volatility.
 *
 * - detectVolatilityAnomalies - A function that handles the anomaly detection.
 * - VolatilityAnomalyInput - The input type for the detectVolatilityAnomalies function.
 * - VolatilityAnomalyOutput - The return type for the detectVolatilityAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from '@/lib/firebase';

const ForecastAnalysisSchema = z.object({
    id: z.string(),
    timestamp: z.string(),
    volatilityScore: z.number(),
});

const VolatilityAnomalyInputSchema = z.object({
  historicalData: z
    .array(ForecastAnalysisSchema)
    .describe('An array of historical forecast analyses containing volatility scores.'),
});
export type VolatilityAnomalyInput = z.infer<typeof VolatilityAnomalyInputSchema>;

const AnomalySchema = z.object({
    forecastId: z.string().describe('The ID of the forecast where the anomaly was detected.'),
    timestamp: z.string().describe('The timestamp of the anomalous forecast.'),
    volatilityScore: z.number().describe('The anomalous volatility score.'),
    insight: z.string().describe('An AI-generated insight explaining the potential cause and significance of the anomaly.'),
});

const VolatilityAnomalyOutputSchema = z.object({
    anomalies: z.array(AnomalySchema).describe('An array of detected volatility anomalies.'),
});
export type VolatilityAnomalyOutput = z.infer<typeof VolatilityAnomalyOutputSchema>;

export async function detectVolatilityAnomalies(input: VolatilityAnomalyInput): Promise<VolatilityAnomalyOutput> {
  return volatilityAnomalyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'volatilityAnomalyPrompt',
  input: {schema: VolatilityAnomalyInputSchema},
  output: {schema: VolatilityAnomalyOutputSchema},
  prompt: `You are a quantitative analyst AI specializing in detecting anomalies in time-series data. You are given a historical series of forecast volatility scores. Your task is to identify any significant spikes or rapid upward trends that deviate from the established baseline.

A volatility score represents how much a forecast diverged from reality. A sudden spike indicates a significant, unexpected event or a failure in the forecasting model.

Analyze the following data. For each point that you identify as an anomaly based on a significant increase from its preceding data points, generate a concise insight. The insight should hypothesize the potential cause (e.g., "Sudden spike suggests an unmodeled external event," or "Rapid increase indicates a potential degradation in the forecasting model's predictive power for this context.").

Do not flag sustained periods of high volatility, only the initial spikes.

Historical Volatility Data:
{{#each historicalData}}
- Forecast ID: {{id}}
  - Timestamp: {{timestamp}}
  - Volatility Score: {{volatilityScore}}
{{/each}}
`,
});

const volatilityAnomalyFlow = ai.defineFlow(
  {
    name: 'volatilityAnomalyFlow',
    inputSchema: VolatilityAnomalyInputSchema,
    outputSchema: VolatilityAnomalyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
