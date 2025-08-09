'use server';

/**
 * @fileOverview A flow for tagging strategist rationales with relevant keywords.
 *
 * - tagRationale - A function that handles the rationale tagging process.
 * - RationaleTaggingInput - The input type for the tagRationale function.
 * - RationaleTaggingOutput - The return type for the tagRationale function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RationaleTaggingInputSchema = z.object({
  rationale: z
    .string()
    .describe('The strategist rationale to analyze and tag.'),
});
export type RationaleTaggingInput = z.infer<typeof RationaleTaggingInputSchema>;

const RationaleTaggingOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of 3-5 short, relevant keyword tags.'),
});
export type RationaleTaggingOutput = z.infer<typeof RationaleTaggingOutputSchema>;

export async function tagRationale(input: RationaleTaggingInput): Promise<RationaleTaggingOutput> {
  return rationaleTaggingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rationaleTaggingPrompt',
  input: {schema: RationaleTaggingInputSchema},
  output: {schema: RationaleTaggingOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a master systems analyst. Your task is to extract relevant, concise tags from a strategist's rationale for overriding a system protocol.

The tags should be short (1-2 words) and capture the core concepts of the rationale. Generate between 3 and 5 tags.

Rationale:
"{{{rationale}}}"

Extract the key tags.`,
});

const rationaleTaggingFlow = ai.defineFlow(
  {
    name: 'rationaleTaggingFlow',
    inputSchema: RationaleTaggingInputSchema,
    outputSchema: RationaleTaggingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
