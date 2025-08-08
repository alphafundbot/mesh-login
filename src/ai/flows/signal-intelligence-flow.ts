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
import { v4 as uuidv4 } from 'uuid';


const AnalyzeSignalHistoryInputSchema = z.object({
  actionLogs: z
    .string()
    .describe('A string containing multiple strategist action logs.'),
});
export type AnalyzeSignalHistoryInput = z.infer<typeof AnalyzeSignalHistoryInputSchema>;

const RecommendationSchema = z.object({
    recommendationId: z.string().describe('A unique identifier for the recommendation.'),
    text: z.string().describe('The recommendation text.'),
});

const AnalyzeSignalHistoryOutputSchema = z.object({
  summary: z.string().describe('A high-level summary of the strategist actions.'),
  patterns: z.array(z.string()).describe('Identified patterns, anomalies, or escalation clusters in the actions.'),
  recommendations: z.array(RecommendationSchema).describe('Proactive interventions or configuration hardening suggestions based on the patterns.'),
});
export type AnalyzeSignalHistoryOutput = z.infer<typeof AnalyzeSignalHistoryOutputSchema>;

export async function analyzeSignalHistory(input: AnalyzeSignalHistoryInput): Promise<AnalyzeSignalHistoryOutput> {
  return signalIntelligenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'signalIntelligencePrompt',
  input: {schema: AnalyzeSignalHistoryInputSchema},
  output: {schema: z.object({
    summary: z.string().describe('A high-level summary of the strategist actions.'),
    patterns: z.array(z.string()).describe('Identified patterns, anomalies, or escalation clusters in the actions.'),
    recommendations: z.array(z.string()).describe('Proactive interventions or configuration hardening suggestions based on the patterns.'),
  })},
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
    
    if (!output) {
        throw new Error("Failed to get a response from the AI.");
    }

    const recommendationsWithIds = output.recommendations.map(rec => ({
        recommendationId: uuidv4(),
        text: rec
    }));

    return {
        summary: output.summary,
        patterns: output.patterns,
        recommendations: recommendationsWithIds
    };
  }
);
