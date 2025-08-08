import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { servicesConfig } from '@/config/services';

export const ai = genkit({
  plugins: [googleAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-1.5-flash-latest"
  })],
});
