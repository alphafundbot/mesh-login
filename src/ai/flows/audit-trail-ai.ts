'use server';

/**
 * @fileOverview A flow for summarizing audit logs and identifying unusual activity patterns.
 *
 * - auditTrailAISummarization - A function that handles the audit log summarization process.
 * - AuditTrailAISummarizationInput - The input type for the auditTrailAISummarization function.
 * - AuditTrailAISummarizationOutput - The return type for the auditTrailAISummarization function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const AuditTrailAISummarizationInputSchema = z.object({
  auditLogs: z
    .string()
    .describe('The audit logs to summarize.'),
});
export type AuditTrailAISummarizationInput = z.infer<typeof AuditTrailAISummarizationInputSchema>;

const AuditTrailAISummarizationOutputSchema = z.object({
  summary: z.string().describe('A summary of the audit logs.'),
  unusualActivities: z.string().describe('Identified unusual activity patterns.'),
});
export type AuditTrailAISummarizationOutput = z.infer<typeof AuditTrailAISummarizationOutputSchema>;

export async function auditTrailAISummarization(input: AuditTrailAISummarizationInput): Promise<AuditTrailAISummarizationOutput> {
  return auditTrailAISummarizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'auditTrailAISummarizationPrompt',
  input: {schema: AuditTrailAISummarizationInputSchema},
  output: {schema: AuditTrailAISummarizationOutputSchema},
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are a security analyst specializing in identifying unusual activity patterns.

You will use the provided audit logs to identify and summarize the security events, and any unusual activity patterns.

Audit Logs: {{{auditLogs}}}`,
});

const auditTrailAISummarizationFlow = ai.defineFlow(
  {
    name: 'auditTrailAISummarizationFlow',
    inputSchema: AuditTrailAISummarizationInputSchema,
    outputSchema: AuditTrailAISummarizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
