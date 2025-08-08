'use server';

/**
 * @fileOverview A flow for analyzing strategist action logs to provide insights.
 *
 * - analyzeSignalHistory - A function that handles the analysis of action logs.
 * - AnalyzeSignalHistoryInput - The input type for the analyzeSignalHistory function.
 * - AnalyzeSignalHistoryOutput - The return type for the analyzeSignalHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSignalHistoryInputSchema = z.object({
  actionLogs: z
    .string()
    .describe('A string containing multiple strategist action logs.'),
});
export type AnalyzeSignalHistoryInput = z.infer<typeof AnalyzeSignalHistoryInputSchema>;

const AnalyzeSignalHistoryOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the strategist actions.'),
  patterns: z.string().describe('Identified patterns, anomalies, or escalation clusters in the actions.'),
  recommendations: z.string().describe('Proactive interventions or configuration hardening suggestions based on the patterns.'),
});
export type AnalyzeSignalHistoryOutput = z.infer<typeof AnalyzeSignalHistoryOutputSchema>;

export async function analyzeSignalHistory(input: AnalyzeSignalHistoryInput): Promise<AnalyzeSignalHistoryOutput> {
  return signalIntelligenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'signalIntelligencePrompt',
  input: {schema: AnalyzeSignalHistoryInputSchema},
  output: {schema: AnalyzeSignalHistoryOutputSchema},
  prompt: `You are a command-level AI analyst. Your mission is to analyze the provided logs of strategist actions to identify patterns and provide actionable intelligence.

Action Logs:
{{{actionLogs}}}

Analyze these logs and provide:
1.  A concise summary of the actions taken.
2.  Any notable patterns, anomalies, or clusters of activity (e.g., frequent escalations by one role, repeated actions on a specific module).
3.  Proactive recommendations for system hardening, policy changes, or further investigation based on the detected patterns.
`,
});

const signalIntelligenceFlow = ai.defineFlow(
  {
    name: 'signalIntelligenceFlow',
    inputSchema: AnalyzeSignalHistoryInputSchema,
    outputSchema: AnalyzeSignalHistoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
