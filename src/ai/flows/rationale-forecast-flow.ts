
'use server';

/**
 * @fileOverview A flow for forecasting which rationale types are likely to emerge based on historical momentum.
 *
 * - forecastRationales - A function that handles the rationale forecast analysis.
 * - RationaleForecastInput - The input type for the forecastRationales function.
 * - RationaleForecastOutput - The return type for the forecastRationales function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClusterMomentumVectorSchema = z.object({
    tag: z.string().describe('The tag identifying the rationale cluster.'),
    riskScore: z.number().describe('The current risk score of the cluster.'),
    riskDelta: z.number().describe('The change in risk score from the previous period.'),
    recentFrequency: z.number().describe('The number of overrides in this cluster in the current period.'),
});

const RationaleForecastInputSchema = z.object({
  clusterMomentumVectors: z
    .array(ClusterMomentumVectorSchema)
    .describe('An array of momentum vectors for various rationale clusters.'),
   strategistFeedbackSummary: z.record(z.object({
       up: z.number(),
       down: z.number()
   })).describe('A summary of strategist feedback on past recommendations, where keys are recommendation texts or IDs.')
});
export type RationaleForecastInput = z.infer<typeof RationaleForecastInputSchema>;

const ForecastedRationaleSchema = z.object({
    rationaleTag: z.string().describe('The rationale cluster tag being forecasted.'),
    escalationProbability: z.number().min(0).max(1).describe('The probability that this rationale type will see increased use or escalate in severity.'),
    suppressionLikelihood: z.number().min(0).max(1).describe('The likelihood that this rationale type will be suppressed or decrease in use.'),
    justification: z.string().describe('The reasoning for the forecast, based on momentum, frequency, and strategist feedback.'),
});

const RationaleForecastOutputSchema = z.object({
    forecasts: z.array(ForecastedRationaleSchema).describe('An array of forecasts for different rationale types.'),
});
export type RationaleForecastOutput = z.infer<typeof RationaleForecastOutputSchema>;

export async function forecastRationales(input: RationaleForecastInput): Promise<RationaleForecastOutput> {
  return rationaleForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rationaleForecastPrompt',
  input: {schema: RationaleForecastInputSchema},
  output: {schema: RationaleForecastOutputSchema},
  prompt: `You are a predictive analyst AI specializing in human-machine systems and strategist behavior. Your task is to forecast which override rationale types will become more or less prominent.

You are given a set of rationale clusters with their current risk scores, momentum (risk delta), and recent frequency. You also have a summary of strategist feedback on past AI recommendations.

Analyze this data to predict the future trajectory of each rationale type. Consider:
1.  **High Positive Momentum (riskDelta > 0)**: These clusters are growing in importance. They have a high escalation probability.
2.  **High Negative Momentum (riskDelta < 0)**: These clusters are becoming less relevant. They have a high suppression likelihood.
3.  **High Frequency**: Frequent clusters, even with low momentum, are significant and may persist.
4.  **Strategist Feedback**: If strategists consistently reject recommendations related to a certain activity, they may be more likely to override it manually.

For each significant rationale cluster, provide:
- The rationale tag.
- An "escalationProbability" score (0.0 to 1.0).
- A "suppressionLikelihood" score (0.0 to 1.0).
- A concise justification for your prediction.

Focus on the most dynamic or impactful rationale types.

## Cluster Momentum Data
{{#each clusterMomentumVectors}}
- **Tag**: {{tag}}
  - Risk Score: {{riskScore}}
  - Risk Delta: {{riskDelta}}
  - Frequency: {{recentFrequency}}
{{/each}}

## Strategist Feedback Summary
{{#each strategistFeedbackSummary}}
- **Recommendation Topic**: {{@key}}
  - Approvals: {{this.up}}
  - Rejections: {{this.down}}
{{/each}}
`,
});

const rationaleForecastFlow = ai.defineFlow(
  {
    name: 'rationaleForecastFlow',
    inputSchema: RationaleForecastInputSchema,
    outputSchema: RationaleForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
