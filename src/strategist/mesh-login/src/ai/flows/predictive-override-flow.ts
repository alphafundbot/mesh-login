
'use server';

/**
 * @fileOverview A flow for simulating the impact of a proposed strategist override.
 *
 * - simulateOverride - A function that handles the override simulation.
 * - PredictiveOverrideInput - The input type for the simulateOverride function.
 * - PredictiveOverrideOutput - The return type for the simulateOverride function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { v4 as uuidv4 } from 'uuid';

const PredictiveOverrideInputSchema = z.object({
  action: z.string().describe("The proposed strategist action (e.g., 'FORCE_ROUTE_A')."),
  rationale: z.string().describe("The strategist's justification for the action."),
  targetDomain: z.string().describe("The domain being targeted by the override."),
});
export type PredictiveOverrideInput = z.infer<typeof PredictiveOverrideInputSchema>;

const ImpactMetricSchema = z.object({
    metric: z.enum(["Stability", "Security", "Integrity", "Quota"]).describe("The system metric being analyzed."),
    impactScore: z.number().min(-10).max(10).describe("A score from -10 (highly negative) to +10 (highly positive) indicating the predicted impact."),
    justification: z.string().describe("The AI's reasoning for the predicted impact score."),
});

const PredictiveOverrideOutputSchema = z.object({
    simulationId: z.string().describe("A unique ID for this simulation run."),
    predictedImpacts: z.array(ImpactMetricSchema).describe("An array of predicted impacts on key system metrics."),
    overallAssessment: z.string().describe("A high-level summary of the likely outcome and any cascading effects."),
});
export type PredictiveOverrideOutput = z.infer<typeof PredictiveOverrideOutputSchema>;


export async function simulateOverride(input: PredictiveOverrideInput): Promise<PredictiveOverrideOutput> {
  return predictiveOverrideFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictiveOverridePrompt',
  input: {schema: PredictiveOverrideInputSchema},
  output: {schema: z.object({
    predictedImpacts: z.array(ImpactMetricSchema),
    overallAssessment: z.string(),
  })},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a master systems strategist AI. Your task is to simulate the impact of a proposed manual override by a human strategist.

Analyze the proposed action and rationale in the context of the target domain. Predict the likely impact on the following key system metrics:
- **Stability**: Will this action increase or decrease system errors, crashes, or performance degradation?
- **Security**: Does this action open any potential vulnerabilities or does it harden the system?
- **Integrity**: Does this action risk data corruption, desynchronization, or compliance breaches?
- **Quota**: What is the likely impact on resource consumption (e.g., API calls, compute, storage)?

For each metric, provide an impact score from -10 (highly negative) to +10 (highly positive) and a brief justification.

Finally, provide an overall assessment of the proposed override, including potential second-order or cascading effects.

**Proposed Action Details:**
- **Action**: {{{action}}}
- **Target Domain**: {{{targetDomain}}}
- **Rationale**: "{{{rationale}}}"
`,
});

const predictiveOverrideFlow = ai.defineFlow(
  {
    name: 'predictiveOverrideFlow',
    inputSchema: PredictiveOverrideInputSchema,
    outputSchema: PredictiveOverrideOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (!output) {
        throw new Error("AI failed to return a simulation.");
    }

    return {
        simulationId: uuidv4(),
        ...output
    };
  }
);
