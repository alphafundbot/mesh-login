'use server';

/**
 * @fileOverview A flow for discovering external APIs from public registries.
 *
 * - discoverApis - A function that fetches API metadata from APIs.guru.
 * - ApiMetadata - The return type for the discoverApis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

const ApiMetadataSchema = z.object({
  id: z.string().describe('The unique identifier for the API, typically the host.'),
  title: z.string().describe('The title of the API.'),
  description: z.string().describe('A short description of the API.'),
  version: z.string().describe('The latest version of the API.'),
});

const ApiDiscoveryOutputSchema = z.array(ApiMetadataSchema);
export type ApiDiscoveryOutput = z.infer<typeof ApiDiscoveryOutputSchema>;

export async function discoverApis(): Promise<ApiDiscoveryOutput> {
  return apiDiscoveryFlow();
}

const apiDiscoveryFlow = ai.defineFlow(
  {
    name: 'apiDiscoveryFlow',
    inputSchema: z.void(),
    outputSchema: ApiDiscoveryOutputSchema,
  },
  async () => {
    try {
      const response = await axios.get('https://api.apis.guru/v2/list.json');
      const apiList = response.data;

      const discoveredApis = Object.entries(apiList).map(([key, value]: [string, any]) => {
        const preferred = value.preferred || Object.keys(value.versions)[0];
        const apiDetails = value.versions[preferred].info;
        return {
          id: key,
          title: apiDetails.title,
          description: apiDetails.description || 'No description available.',
          version: apiDetails.version,
        };
      });

      // Limit to first 50 for performance
      return discoveredApis.slice(0, 50);
    } catch (error) {
      console.error("Failed to fetch APIs from APIs.guru:", error);
      throw new Error("Could not connect to the API registry.");
    }
  }
);
