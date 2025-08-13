'use server';

/**
 * @fileOverview A flow for analyzing source code files to generate intelligence about their function and quality.
 *
 * - analyzeCode - A function that handles the code analysis process.
 * - CodeAnalysisInput - The input type for the analyzeCode function.
 * - CodeAnalysisOutput - The return type for the analyzeCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const CodeAnalysisInputSchema = z.object({
  filePath: z.string().describe('The absolute path of the file being analyzed.'),
  fileContent: z.string().describe('The full source code content of the file.'),
});
export type CodeAnalysisInput = z.infer<typeof CodeAnalysisInputSchema>;

export const CodeAnalysisOutputSchema = z.object({
  purpose: z.string().describe("A high-level summary of the file's purpose and its role within the system."),
  dependencies: z.array(z.string()).describe("A list of identified internal dependencies (e.g., other project flows, components, or services)."),
  qualityAssessment: z.string().describe("An AI-driven assessment of the code's quality, mentioning complexity, potential issues, or areas for improvement."),
  performanceMapping: z.string().describe("A hypothesis on which business or system metrics (e.g., forecast accuracy, user feedback) could be used to evaluate this code's real-world performance."),
});
export type CodeAnalysisOutput = z.infer<typeof CodeAnalysisOutputSchema>;

const prompt = ai.definePrompt({
  name: 'codeIntelligencePrompt',
  input: {schema: CodeAnalysisInputSchema},
  output: {schema: CodeAnalysisOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a master software architect AI. Your task is to analyze a source code file from your own codebase and generate a structured intelligence report about it.

Analyze the file provided and generate the following insights:
- **Purpose**: What is the primary role of this file in the Stratagem.ai mesh? What problem does it solve?
- **Dependencies**: What other internal project files (flows, components, services) does this code appear to interact with?
- **Quality Assessment**: Briefly assess the code. Is it clean, complex, brittle, or robust? Are there any potential anti-patterns or risks?
- **Performance Mapping**: How could we measure the effectiveness of this code? Hypothesize which high-level metrics (e.g., forecast accuracy, strategist feedback scores, system stability) would be affected by this code's performance.

File Path: {{{filePath}}}
\`\`\`typescript
{{{fileContent}}}
\`\`\`
`,
});

const codeIntelligenceFlow = ai.defineFlow(
  {
    name: 'codeIntelligenceFlow',
    inputSchema: CodeAnalysisInputSchema,
    outputSchema: CodeAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to get a response from the AI for code analysis.");
    }
    return output;
  }
);

export async function analyzeCode(input: CodeAnalysisInput): Promise<CodeAnalysisOutput> {
  return codeIntelligenceFlow(input);
}
