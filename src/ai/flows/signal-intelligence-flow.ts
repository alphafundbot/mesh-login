
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
import { collection, getDocs, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Recommendation } from '@/lib/types';


const AnalyzeSignalHistoryInputSchema = z.object({
  actionLogs: z
    .string()
    .describe('A string containing multiple strategist action logs.'),
});
export type AnalyzeSignalHistoryInput = z.infer<typeof AnalyzeSignalHistoryInputSchema>;

const RecommendationSchema = z.object({
    recommendationId: z.string().describe('A unique identifier for the recommendation.'),
    text: z.string().describe('The recommendation text.'),
    confidence: z.number().min(0).max(1).describe("The AI's confidence in this recommendation, from 0.0 to 1.0."),
    basedOn: z.array(z.string()).describe('A list of recommendation IDs from past feedback that this new recommendation is based on.'),
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

const getFeedbackSummary = ai.defineTool(
    {
        name: 'getFeedbackSummary',
        description: 'Retrieves and summarizes feedback on past recommendations to understand strategist preferences.',
        inputSchema: z.void(),
        outputSchema: z.record(z.object({
            text: z.string(),
            up: z.number(),
            down: z.number(),
        })).describe("An object where keys are recommendation IDs and values are their feedback counts and original text."),
    },
    async () => {
        const feedbackQuery = query(collection(db, 'feedback'));
        const snapshot = await getDocs(feedbackQuery);
        
        if (snapshot.empty) {
            return {};
        }

        const feedbackData: Record<string, { text: string, up: number, down: number }> = {};
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const id = data.recommendationId;
            // Use recommendationText, fallback to a default if not present
            const text = data.recommendationText || `Rec ID: ${id}`; 

            if (!feedbackData[id]) {
                feedbackData[id] = { text, up: 0, down: 0 };
            }
            if (data.rating === 'up') {
                feedbackData[id].up++;
            } else if (data.rating === 'down') {
                feedbackData[id].down++;
            }
        });

        return feedbackData;
    }
);

const prompt = ai.definePrompt({
  name: 'signalIntelligencePrompt',
  tools: [getFeedbackSummary],
  input: {schema: AnalyzeSignalHistoryInputSchema},
  output: {schema: z.object({
    summary: z.string().describe('A high-level summary of the strategist actions.'),
    patterns: z.array(z.string()).describe('Identified patterns, anomalies, or escalation clusters in the actions.'),
    recommendations: z.array(z.object({
        text: z.string().describe('The recommendation text.'),
        confidence: z.number().min(0).max(1).describe("The AI's confidence in this recommendation, from 0.0 to 1.0. This score MUST be adjusted based on feedback from similar past recommendations."),
        basedOn: z.array(z.string()).describe('A list of recommendation IDs from past feedback that this new recommendation is based on.'),
    })).describe('Proactive interventions or configuration hardening suggestions based on the patterns.'),
  })},
  prompt: `You are a command-level AI analyst. Your mission is to analyze the provided logs of strategist actions to identify patterns and provide actionable intelligence.

First, use the getFeedbackSummary tool to retrieve structured data on how strategists have rated past recommendations. This data is critical for shaping your new suggestions.

Action Logs:
{{{actionLogs}}}

Analyze these logs and provide:
1.  A concise summary of the actions taken.
2.  Any notable patterns, anomalies, or clusters of activity.
3.  A set of new, proactive recommendations. For each recommendation, you MUST do the following:
    - **Weight the Confidence Score**: Adjust the 'confidence' score based on the historical feedback. If a new recommendation is similar to one that was previously highly approved, its confidence score should be higher. If it is similar to one that was rejected, its confidence should be significantly lower.
    - **Cite Your Sources**: In the 'basedOn' field, list the IDs of any past recommendations that influenced your new suggestion and its confidence score.
    - High confidence should be reserved for recommendations strongly supported by clear data patterns AND positive past feedback.
`,
});

const signalIntelligenceFlow = ai.defineFlow(
  {
    name: 'signalIntelligenceFlow',
    inputSchema: AnalyzeSignalHistoryInputSchema,
    outputSchema: AnalyzeSignalHistoryOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
        prompt: await prompt.render(input),
        model: 'googleai/gemini-1.5-flash',
        tools: [getFeedbackSummary],
        output: {
            schema: AnalyzeSignalHistoryOutputSchema,
        }
    });
    
    if (!output) {
        throw new Error("Failed to get a response from the AI.");
    }

    const recommendationsWithIds = output.recommendations.map(rec => ({
        ...rec,
        recommendationId: uuidv4(),
    }));

    return {
        summary: output.summary,
        patterns: output.patterns,
        recommendations: recommendationsWithIds
    };
  }
);

export const submitFeedback = ai.defineFlow(
    {
        name: 'submitFeedbackFlow',
        inputSchema: z.object({
            recommendationId: z.string(),
            recommendationText: z.string(),
            rating: z.enum(['up', 'down']),
            strategist: z.string(),
            role: z.string(),
        }),
        outputSchema: z.void(),
    },
    async (feedback) => {
        await addDoc(collection(db, "feedback"), {
            ...feedback,
            timestamp: serverTimestamp()
        });
    }
);
