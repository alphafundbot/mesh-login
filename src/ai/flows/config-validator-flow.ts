'use server';

/**
 * @fileOverview A flow for validating system configurations using AI.
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
    .describe('The configuration file content to validate.'),
});
export type ValidateConfigurationInput = z.infer<typeof ValidateConfigurationInputSchema>;

const ValidateConfigurationOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the configuration is valid or not.'),
  suggestions: z.string().describe('Suggestions for improving the configuration or reasons for failure.'),
});
export type ValidateConfigurationOutput = z.infer<typeof ValidateConfigurationOutputSchema>;

export async function validateConfiguration(input: ValidateConfigurationInput): Promise<ValidateConfigurationOutput> {
  return configValidatorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'configValidatorPrompt',
  input: {schema: ValidateConfigurationInputSchema},
  output: {schema: ValidateConfigurationOutputSchema},
  prompt: `You are a system configuration validator. Your task is to analyze the provided configuration and determine if it is valid.

The configuration should be valid JSON. It should also be a secure and well-formed configuration.

Based on your analysis, set 'isValid' to true or false. Provide a detailed explanation in the 'suggestions' field. If it's invalid, explain why. If it is valid, suggest potential improvements for security, performance, or readability.

Configuration:
{{{config}}}
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
