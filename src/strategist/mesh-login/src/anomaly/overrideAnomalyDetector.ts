// src/anomaly/overrideAnomalyDetector.ts
export function detectOverrideAnomalies(logs: any[]): string[] {
  return logs.filter(log => log.signal.includes('drift') || log.commentary?.some((c: string) => c.includes('invalid'))).map(log => `Anomaly at ${log.timestamp}`);
}
