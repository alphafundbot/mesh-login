
'use server';

/**
 * @fileOverview A flow for generating AI commentary on the accuracy of a historical forecast.
 *
 * - generateReplayCommentary - A function that handles the forecast vs. actuals analysis.
 * - ReplayCommentaryInput - The input type for the function.
 * - ReplayCommentaryOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastedRationaleSchema = z.object({
    rationaleTag: z.string(),
    escalationProbability: z.number(),
    suppressionLikelihood: z.number(),
    justification: z.string(),
});

const ReplayCommentaryInputSchema = z.object({
  originalForecast: z.object({
    forecasts: z.array(ForecastedRationaleSchema),
  }),
  actualLogs: z.string().describe("The action logs from the period that was forecasted."),
});
export type ReplayCommentaryInput = z.infer<typeof ReplayCommentaryInputSchema>;


const ReplayCommentaryOutputSchema = z.object({
    accuracyScore: z.number().min(0).max(1).describe("A score from 0.0 to 1.0 indicating the overall accuracy of the forecast."),
    divergenceMap: z.array(z.object({
        rationaleTag: z.string(),
        predicted: z.string(),
        actual: z.string(),
        impact: z.string(),
    })).describe("An analysis of where the forecast diverged most significantly from reality."),
    strategicNotes: z.string().describe("High-level synthesis of why the forecast was or was not accurate, noting any major strategic pivots, successful predictions, or missed signals."),
});
export type ReplayCommentaryOutput = z.infer<typeof ReplayCommentaryOutputSchema>;

export async function generateReplayCommentary(input: ReplayCommentaryInput): Promise<ReplayCommentaryOutput> {
  return replayCommentaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'replayCommentaryPrompt',
  input: {schema: ReplayCommentaryInputSchema},
  output: {schema: ReplayCommentaryOutputSchema},
  prompt: `You are a master strategist AI specializing in analyzing and comparing predictive forecasts against real-world outcomes. Your task is to generate "Replay Commentary" by comparing an original rationale forecast with the actual action logs from that period.

Your analysis must include:
1.  **Accuracy Score**: A single score from 0.0 (completely wrong) to 1.0 (perfectly accurate) representing how well the forecast predicted events.
2.  **Divergence Map**: Identify the most significant differences between prediction and reality. For each, describe the predicted behavior, the actual outcome, and the strategic impact of the difference.
3.  **Strategic Notes**: Provide a high-level summary. What did the forecast get right? Where did it fail? Were there any surprising events (anomalies, strategic pivots) that the forecast missed entirely?

## Original Forecast
{{#each originalForecast.forecasts}}
- **Rationale**: {{rationaleTag}}
  - **Predicted Escalation**: {{escalationProbability}}
  - **Predicted Suppression**: {{suppressionLikelihood}}
  - **Justification**: "{{justification}}"
{{/each}}

## Actual Action Logs for the Forecast Period
\`\`\`
{{{actualLogs}}}
\`\`\`

Generate the Replay Commentary.`,
});

const replayCommentaryFlow = ai.defineFlow(
  {
    name: 'replayCommentaryFlow',
    inputSchema: ReplayCommentaryInputSchema,
    outputSchema: ReplayCommentaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
