// src/quota/reallocationEngine.ts
export function reallocateQuota(domainUsage: Record<string, number>, totalQuota: number): Record<string, number> {
  const totalUsed = Object.values(domainUsage).reduce((a, b) => a + b, 0);
  const scale = totalQuota / Math.max(totalUsed, 1);
  const adjusted: Record<string, number> = {};
  for (const domain in domainUsage) {
    adjusted[domain] = Math.floor(domainUsage[domain] * scale);
  }
  return adjusted;
}
