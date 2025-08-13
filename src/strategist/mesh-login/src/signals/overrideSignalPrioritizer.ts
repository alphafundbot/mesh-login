// src/signals/overrideSignalPrioritizer.ts
export function prioritizeSignals(signals: string[]): string[] {
  const priority = ['failure', 'drift', 'invalid', 'quota', 'escalation'];
  return signals.sort((a, b) => {
    const aIndex = priority.findIndex(p => a.includes(p));
    const bIndex = priority.findIndex(p => b.includes(p));
    
    // If a keyword is not found, its index is -1. We want these to be at the end.
    const effectiveA = aIndex === -1 ? priority.length : aIndex;
    const effectiveB = bIndex === -1 ? priority.length : bIndex;
    
    return effectiveA - effectiveB;
  });
}
