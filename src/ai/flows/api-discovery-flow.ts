'use server';

/**
 * @fileOverview A flow for discovering external APIs from public registries and syncing them.
 *
 * - syncKnownPlatforms - Fetches API metadata from APIs.guru and prepares it for cataloging.
 * - PlatformMeta - The return type for the platform metadata.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';
import { collection, writeBatch } from 'firebase/firestore';
import { firestore } from '@/lib/firebaseConfig';
import { isBrowser } from '@/lib/env-check';

export interface PlatformMeta { 
    id: string; 
    name: string; 
    swaggerUrl?: string;
}

const PlatformMetaSchema = z.object({
  id: z.string().describe('The unique identifier for the API, typically the host.'),
  name: z.string().describe('The title of the API.'),
  swaggerUrl: z.string().optional().describe('The URL to the OpenAPI/Swagger specification.'),
});

const PlatformSyncOutputSchema = z.array(PlatformMetaSchema);

export async function syncKnownPlatforms(): Promise<PlatformMeta[]> {
  const response = await axios.get('https://api.apis.guru/v2/list.json');
  const apiList = response.data;

  const entries = Object.entries(apiList).map(([key, value]: [string, any]) => {
    const preferred = value.preferred || Object.keys(value.versions)[0];
    const apiDetails = value.versions[preferred].info;
    const swaggerUrl = value.versions[preferred].swaggerUrl || value.versions[preferred].openapiUrl;

    return {
      id: key,
      name: apiDetails.title,
      swaggerUrl: swaggerUrl,
    };
  }).slice(0, 100); // Limit to 100 to avoid excessive writes

  // Only write to Firestore on the server-side, where it's properly initialized
  if (!isBrowser() && firestore) {
      const batch = writeBatch(firestore);
      const platformsRef = collection(firestore, 'platforms');
      
      entries.forEach((platform) => {
          const docRef = doc(platformsRef, platform.id);
          batch.set(docRef, platform, { merge: true });
      });
      
      await batch.commit();
  }

  return entries;
}
