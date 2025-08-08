'use server';

/**
 * @fileOverview A flow for comparing two historical snapshots and generating an AI-powered diff.
 *
 * - diffSnapshots - A function that handles the snapshot comparison process.
 * - SnapshotDiffInput - The input type for the diffSnapshots function.
 * - SnapshotDiffOutput - The return type for the diffSnapshots function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SnapshotDiffInputSchema = z.object({
  snapshotALogs: z.string().describe('The logs from the first snapshot (A).'),
  snapshotBLogs: z.string().describe('The logs from the second snapshot (B).'),
});
export type SnapshotDiffInput = z.infer<typeof SnapshotDiffInputSchema>;

const SnapshotDiffOutputSchema = z.object({
  comparisonSummary: z.string().describe('A high-level summary of the strategic divergence between the two snapshots.'),
  keyDifferences: z.array(z.string()).describe('A list of specific, key differences in actions, patterns, or outcomes.'),
  strategicShift: z.string().describe('An analysis of how strategist behavior or system response evolved between the two points in time.'),
});
export type SnapshotDiffOutput = z.infer<typeof SnapshotDiffOutputSchema>;

export async function diffSnapshots(input: SnapshotDiffInput): Promise<SnapshotDiffOutput> {
  return snapshotDiffFlow(input);
}

const prompt = ai.definePrompt({
  name: 'snapshotDiffPrompt',
  input: {schema: SnapshotDiffInputSchema},
  output: {schema: SnapshotDiffOutputSchema},
  prompt: `You are a master systems analyst specializing in temporal event correlation. You are given two sets of logs from two different time periods (Snapshot A and Snapshot B). Your task is to compare them and produce a detailed analysis of the differences.

Analyze the logs to identify:
1.  A high-level summary of the strategic divergence.
2.  A list of specific, key differences (e.g., different override actions, new error types, faster/slower resolution).
3.  An analysis of the strategic shift: How did the strategist's approach or the system's response change between A and B?

---
Snapshot A Logs:
{{{snapshotALogs}}}
---
Snapshot B Logs:
{{{snapshotBLogs}}}
---
`,
});

const snapshotDiffFlow = ai.defineFlow(
  {
    name: 'snapshotDiffFlow',
    inputSchema: SnapshotDiffInputSchema,
    outputSchema: SnapshotDiffOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
        prompt: await prompt.render(input),
        model: 'googleai/gemini-1.5-flash',
        output: {
            schema: SnapshotDiffOutputSchema,
        }
    });
    return output!;
  }
);
