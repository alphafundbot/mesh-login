// src/monitoring/anomalyClassifier.ts
export function classifyAnomalies(raw: string[]): Record<string, string[]> {
  return raw.reduce((acc, entry) => {
    const type = entry.includes('drift') ? 'drift' : 'other';
    (acc[type] = acc[type] || []).push(entry);
    return acc;
  }, {} as Record<string, string[]>);
}
