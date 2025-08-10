// src/intelligence/overrideDiffEngine.ts
import { logTelemetryEvent } from '../monitoring/LoginTelemetry'; // Centralized telemetry logging

export function diffOverrideLogs(logA: any, logB: any): string[] {
  logTelemetryEvent('overrideDiff:compare_logs', { metadata: { logA, logB } });
  const diffs = [];
  for (const key in logA) {
    if (logA[key] !== logB[key]) {
      diffs.push(`Changed ${key}: '${logA[key]}' → '${logB[key]}'`);
    }
  }
  logTelemetryEvent('overrideDiff:differences_found', { metadata: { diffCount: diffs.length, diffs } });
  return diffs;
}