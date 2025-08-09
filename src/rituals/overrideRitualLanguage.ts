// src/rituals/overrideRitualLanguage.ts
export function renderOverrideRitual(signal: string, domain: string): string {
  return `🜂 Signal: ${signal} | Domain: ${domain} → Ritual: [invoke:${signal}] → [domain:${domain}] → [seal:sovereign]`;
}
