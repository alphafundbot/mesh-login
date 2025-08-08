
'use server';

/**
 * @fileOverview A flow for forecasting which domains are likely to experience high rates of strategist overrides.
 *
 * - forecastSuppression - A function that handles the suppression forecast analysis.
 * - SuppressionForecastInput - The input type for the forecastSuppression function.
 * - SuppressionForecastOutput - The return type for the forecastSuppression function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuppressionForecastInputSchema = z.object({
  actionLogs: z
    .string()
    .describe('A string containing multiple strategist action logs, including override actions with severity and domain details.'),
});
export type SuppressionForecastInput = z.infer<typeof SuppressionForecastInputSchema>;

const ForecastSchema = z.object({
    domain: z.string().describe('The domain being analyzed.'),
    predictedOverrideRate: z.number().min(0).max(1).describe('The forecasted rate of manual overrides as a score from 0.0 (low) to 1.0 (high) for the next operational period.'),
    justification: z.string().describe('The reasoning for the forecast, based on historical data trends, override density, and risk deltas.'),
});

const SuppressionForecastOutputSchema = z.object({
    forecasts: z.array(ForecastSchema).describe('An array of suppression forecasts for various domains.'),
});
export type SuppressionForecastOutput = z.infer<typeof SuppressionForecastOutputSchema>;

export async function forecastSuppression(input: SuppressionForecastInput): Promise<SuppressionForecastOutput> {
  return suppressionForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suppressionForecastPrompt',
  input: {schema: SuppressionForecastInputSchema},
  output: {schema: SuppressionForecastOutputSchema},
  prompt: `You are a predictive analyst AI specializing in human-machine systems. Your task is to forecast "auto-action suppression," which is when a human strategist manually overrides an automated system protocol.

You are given a history of action logs. Based on these logs, identify the domains most likely to experience high rates of strategist overrides in the next operational period.

Consider the following factors in your forecast:
1.  **Override Frequency**: Domains with historically high numbers of overrides.
2.  **Risk Delta / Trend**: Domains where the frequency or severity of overrides is increasing sharply.
3.  **Severity Density**: Domains with a high concentration of 'Critical' or 'Catastrophic' overrides, as these indicate significant system-strategist friction.

For each domain with a notable forecast, provide:
- The domain name.
- A predicted override rate as a score from 0.0 (unlikely) to 1.0 (highly likely).
- A concise justification for your prediction, citing the key factors.

Focus only on the domains with the most significant risk of future overrides.

Action Logs:
{{{actionLogs}}}
`,
});

const suppressionForecastFlow = ai.defineFlow(
  {
    name: 'suppressionForecastFlow',
    inputSchema: SuppressionForecastInputSchema,
    outputSchema: SuppressionForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
