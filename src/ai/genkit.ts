import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { servicesConfig } from '@/config/services';

export const ai = genkit({
  plugins: [googleAI({
    apiKey: servicesConfig.gcp.geminiApiKey,
  })],
  model: 'googleai/gemini-1.5-flash-latest',
});
