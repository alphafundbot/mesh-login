// src/config/DevOriginBinder.ts

// For now, reading from a simple environment variable or returning a hardcoded array.
import { logTelemetryEvent } from '../monitoring/LoginTelemetry'; // Centralized telemetry logging

// In a more advanced implementation, this would read from .env.local, devOrigins.json,
// or interact with a StrategistCalendar module for dynamic origins.

export function getAllowedOrigins(): string[] {
  // Example: Read from an environment variable that contains a comma-separated list
  const envOrigins = process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS;

  if (envOrigins) {
    logTelemetryEvent('dev_origin_binder:allowed_origins_from_env', { origins: envOrigins.split(',').map(origin => origin.trim()) });
    return envOrigins.split(',').map(origin => origin.trim());
  }

  // Example: Hardcoded array of trusted origins
  return [
    'https://localhost:3000', // Default Next.js dev origin
    'https://9003-firebase-thin-wallet-1754708969246.cluster-aj77uug3sjd4iut4ev6a4jbtf2.cloudworkstations.dev', // Example from previous interaction
    // Add other trusted origins here
 ];
  logTelemetryEvent('dev_origin_binder:allowed_origins_hardcoded', { origins: hardcodedOrigins });
 return hardcodedOrigins;
}