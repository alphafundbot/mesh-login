// src/intelligence/quotaPredictor.ts
export function predictQuotaExhaustion(history: number[]): string {
  if (history.length === 0) {
    return "Not enough data to predict quota exhaustion."
  }
  const avgRate = history.reduce((a, b) => a + b, 0) / history.length;
  if (avgRate === 0) {
    return "No usage detected; exhaustion not projected."
  }
  const remaining = 50 - history.length;
  const projectedTime = remaining / avgRate;
  return `Projected exhaustion in ${projectedTime.toFixed(2)} hours.`;
}
