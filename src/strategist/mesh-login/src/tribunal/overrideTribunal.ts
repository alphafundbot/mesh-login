// src/tribunal/overrideTribunal.ts
export function conveneTribunal(signals: string[], verdictFn: (s: string) => string): string {
  const votes = signals.map(verdictFn);
  const tally = votes.reduce((acc, v) => {
    acc[v] = (acc[v] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
}
