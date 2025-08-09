/**
 * @fileoverview Centralized configuration for all external services.
 * Loads credentials from environment variables and provides a typed object.
 * This is the single source of truth for all service configurations.
 */
import { getEnv } from '@/lib/utils';

export interface GcpConfig {
    geminiApiKey: string;
}

export interface ServicesConfig {
    gcp: GcpConfig
}

const gcpConfigValues: GcpConfig = {
    geminiApiKey: getEnv('GEMINI_API_KEY'),
}

export const servicesConfig: ServicesConfig = {
    gcp: gcpConfigValues
};
