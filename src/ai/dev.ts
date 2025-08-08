import { config } from 'dotenv';
config();

import '@/ai/flows/audit-trail-ai.ts';
import '@/ai/flows/config-validator-flow.ts';
import '@/ai/flows/signal-intelligence-flow.ts';
import '@/ai/flows/cross-domain-intelligence-flow.ts';
import '@/ai/flows/rationale-tagging-flow.ts';
import '@/ai/flows/suppression-forecast-flow.ts';
import '@/ai/flows/snapshot-diff-flow.ts';
import '@/ai/flows/rationale-forecast-flow.ts';
import '@/ai/flows/replay-commentary-flow.ts';
