// src/quota/domainHarmonizer.ts
import { reallocateQuota } from "./reallocationEngine";

export function harmonizeDomainQuota(domains: string[], usage: Record<string, number>, quota: number): Record<string, number> {
  return reallocateQuota(usage, quota);
}
