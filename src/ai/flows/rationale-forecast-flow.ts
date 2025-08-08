
'use server';

/**
 * @fileOverview A flow for forecasting which rationale types are likely to emerge based on historical momentum and strategist feedback.
 *
 * - forecastRationales - A function that handles the rationale forecast analysis.
 * - RationaleForecastInput - The input type for the forecastRationales function.
 * - RationaleForecastOutput - The return type for the forecastRationales function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from '@/lib/firebase';

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

const getForecastPerformance = ai.defineTool(
    {
        name: 'getForecastPerformance',
        description: 'Retrieves and summarizes the performance of recent, historical forecasts to improve future predictions.',
        inputSchema: z.object({
            limit: z.number().optional().default(10).describe('The number of recent forecasts to analyze.'),
        }),
        outputSchema: z.object({
            averageAccuracy: z.number().describe('The average accuracy score across all analyzed forecasts.'),
            insights: z.array(z.string()).describe('A summary of key insights, such as consistently over- or under-predicted rationale tags.'),
        })
    },
    async ({ limit }) => {
        const q = query(
            collection(db, "forecast_analysis"),
            orderBy("timestamp", "desc"),
            limit(limit)
        );
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return { averageAccuracy: -1, insights: ["No historical forecast data available."] };
        }

        const commentaries: any[] = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.commentary) {
                commentaries.push({ ...data.commentary, forecast: data.forecast });
            }
        });

        if (commentaries.length === 0) {
            return { averageAccuracy: -1, insights: ["No replay commentary found in recent forecasts."] };
        }

        const totalAccuracy = commentaries.reduce((acc, c) => acc + c.accuracyScore, 0);
        const averageAccuracy = totalAccuracy / commentaries.length;

        const divergenceCounts: Record<string, { predicted: string, actual: string, count: number }> = {};
        commentaries.forEach(c => {
            c.divergenceMap.forEach((div: any) => {
                const key = `${div.rationaleTag}-${div.predicted}-${div.actual}`;
                if (!divergenceCounts[key]) {
                    divergenceCounts[key] = { ...div, count: 0 };
                }
                divergenceCounts[key].count++;
            });
        });
        
        const insights: string[] = [];
        Object.values(divergenceCounts).filter(d => d.count > 1).forEach(d => {
            insights.push(`The rationale '${d.rationaleTag}' has been consistently mis-predicted. Forecasted as '${d.predicted}' but resulted in '${d.actual}' ${d.count} times.`);
        });
        if (insights.length === 0 && commentaries.length > 0) {
            insights.push("Forecasts have generally been stable with no consistent divergence patterns noted.");
        }


        return { averageAccuracy, insights };
    }
);


const prompt = ai.definePrompt({
  name: 'rationaleForecastPrompt',
  tools: [getForecastPerformance],
  input: {schema: RationaleForecastInputSchema},
  output: {schema: RationaleForecastOutputSchema},
  prompt: `You are a predictive analyst AI specializing in human-machine systems and strategist behavior. Your task is to forecast which override rationale types will become more or less prominent.

First, call the getForecastPerformance tool to understand how well past forecasts have performed. Use these historical insights to calibrate your new predictions. For example, if a rationale type was consistently under-predicted, you may need to increase its escalation probability.

Then, analyze the provided cluster momentum data and strategist feedback. Consider:
1.  **High Positive Momentum (riskDelta > 0)**: These clusters are growing in importance. They have a high escalation probability.
2.  **High Negative Momentum (riskDelta < 0)**: These clusters are becoming less relevant. They have a high suppression likelihood.
3.  **High Frequency**: Frequent clusters, even with low momentum, are significant and may persist.
4.  **Strategist Feedback**: If strategists consistently reject recommendations related to a certain activity, they may be more likely to override it manually. High rejection rates on an AI suggestion can signal an increase in related manual overrides.
5.  **Historical Performance**: Adjust your forecast based on the insights from past performance. Explicitly state in your justification how historical accuracy influenced your prediction.

For each significant rationale cluster, provide:
- The rationale tag.
- An "escalationProbability" score (0.0 to 1.0).
- A "suppressionLikelihood" score (0.0 to 1.0).
- A concise justification for your prediction, explicitly referencing momentum, frequency, strategist feedback, and historical forecast performance where applicable.

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

