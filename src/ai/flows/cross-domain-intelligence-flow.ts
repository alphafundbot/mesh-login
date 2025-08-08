'use server';

/**
 * @fileOverview A flow for analyzing logs across multiple domains to generate system-wide intelligence metrics.
 *
 * - analyzeCrossDomainIntelligence - A function that handles the cross-domain analysis.
 * - CrossDomainIntelligenceInput - The input type for the analyzeCrossDomainIntelligence function.
 * - CrossDomainIntelligenceOutput - The return type for the analyzeCrossDomainIntelligence function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CrossDomainIntelligenceInputSchema = z.object({
    domainLogs: z.record(z.string()).describe('A record where keys are domain names and values are their corresponding logs.'),
});
export type CrossDomainIntelligenceInput = z.infer<typeof CrossDomainIntelligenceInputSchema>;

const DomainMetricsSchema = z.object({
    domain: z.string().describe('The name of the domain.'),
    stability: z.number().describe('A score from 0-100 representing system stability. Higher is better. Derived from errors, rollbacks, and downtime.'),
    security: z.number().describe('A score from 0-100 representing security posture. Higher is better. Derived from unauthorized access, scans, and compliance failures.'),
    activity: z.number().describe('A score from 0-100 representing operational activity. Higher means more actions. Derived from deployments, config updates, and user actions.'),
});

const CrossDomainIntelligenceOutputSchema = z.object({
    metrics: z.array(DomainMetricsSchema),
});
export type CrossDomainIntelligenceOutput = z.infer<typeof CrossDomainIntelligenceOutputSchema>;


export async function analyzeCrossDomainIntelligence(input: CrossDomainIntelligenceInput): Promise<CrossDomainIntelligenceOutput> {
  return crossDomainIntelligenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'crossDomainIntelligencePrompt',
  input: {schema: CrossDomainIntelligenceInputSchema},
  output: {schema: CrossDomainIntelligenceOutputSchema},
  prompt: `You are a master systems analyst. You are provided with logs from multiple operational domains. Your task is to analyze these logs and generate a quantitative score (0-100) for each domain across three key metrics: Stability, Security, and Activity.

- **Stability**: Assess this based on errors, rollbacks, downtime, and successful deployments. High errors and frequent rollbacks decrease the score.
- **Security**: Assess this based on compliance failures, unauthorized access attempts, port scans, and successful security scans. More threats decrease the score.
- **Activity**: Assess this based on the volume of actions like deployments, config updates, and user logins. This is a measure of operational tempo, not good/bad.

Return a list of metrics for each domain.

Here are the logs:
{{#each domainLogs}}
---
Domain: {{@key}}
Logs:
{{{this}}}
---
{{/each}}
`,
});

const crossDomainIntelligenceFlow = ai.defineFlow(
  {
    name: 'crossDomainIntelligenceFlow',
    inputSchema: CrossDomainIntelligenceInputSchema,
    outputSchema: CrossDomainIntelligenceOutputSchema,
  },
  async input => {
    const {output} = await ai.generate({
        prompt: await prompt.render(input),
        model: 'googleai/gemini-1.5-flash',
        output: {
            schema: CrossDomainIntelligenceOutputSchema,
        }
    });
    return output!;
  }
);
