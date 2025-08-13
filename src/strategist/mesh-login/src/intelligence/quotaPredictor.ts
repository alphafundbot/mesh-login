// src/intelligence/quotaPredictor.ts
import { logTelemetryEvent } from '../monitoring/LoginTelemetry'; // Assuming centralized telemetry logging path

export function predictQuotaExhaustion(history: number[]): string {
  logTelemetryEvent('quota:prediction_start', { metadata: { historyLength: history.length } });
  if (history.length === 0) {
    return "Not enough data to predict quota exhaustion."
  }
  const avgRate = history.reduce((a, b) => a + b, 0) / history.length;
  if (avgRate === 0) {
    return "No usage detected; exhaustion not projected."
  }
  const remaining = 50 - history.length;
  const projectedTime = remaining / avgRate;
  const message = `Projected exhaustion in ${projectedTime.toFixed(2)} hours.`;
  logTelemetryEvent('quota:prediction_end', { metadata: { projectedTime, message } });
  return message;
}
