'use server';

/**
 * @fileOverview A flow for validating system configurations using AI, specializing in medical compliance.
 *
 * - validateConfiguration - A function that handles the configuration validation process.
 * - ValidateConfigurationInput - The input type for the validateConfiguration function.
 * - ValidateConfigurationOutput - The return type for the validateConfiguration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateConfigurationInputSchema = z.object({
  config: z
    .string()
    .describe('The configuration file content to validate, likely a compliance matrix.'),
});
export type ValidateConfigurationInput = z.infer<typeof ValidateConfigurationInputSchema>;

const ValidateConfigurationOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the configuration is valid and compliant.'),
  suggestions: z.string().describe('Suggestions for improving the configuration, reasons for failure, or a confirmation of compliance.'),
});
export type ValidateConfigurationOutput = z.infer<typeof ValidateConfigurationOutputSchema>;

export async function validateConfiguration(input: ValidateConfigurationInput): Promise<ValidateConfigurationOutput> {
  return configValidatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'configValidatorPrompt',
  input: {schema: ValidateConfigurationInputSchema},
  output: {schema: ValidateConfigurationOutputSchema},
  prompt: `You are a top-tier security and compliance analyst specializing in medical system configurations. Your task is to analyze the provided configuration, such as a compliance matrix, and determine if it is valid, secure, and compliant with standards like HIPAA and GDPR.

The configuration should be valid JSON. More importantly, it must be secure and well-formed.

Based on your analysis, set 'isValid' to true or false.
- If it's invalid or non-compliant, provide a detailed, actionable explanation in the 'suggestions' field explaining exactly what is wrong and how to fix it.
- If it is valid and compliant, confirm this in the 'suggestions' field and suggest potential improvements for security, performance, or readability.

Analyze the following configuration:
\`\`\`json
{{{config}}}
\`\`\`
`,
});

const configValidatorFlow = ai.defineFlow(
  {
    name: 'configValidatorFlow',
    inputSchema: ValidateConfigurationInputSchema,
    outputSchema: ValidateConfigurationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
