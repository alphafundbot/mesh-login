// src/intelligence/overrideDiffEngine.ts
export function diffOverrideLogs(logA: any, logB: any): string[] {
  const diffs = [];
  for (const key in logA) {
    if (logA[key] !== logB[key]) {
      diffs.push(`Changed ${key}: '${logA[key]}' → '${logB[key]}'`);
    }
  }
  return diffs;
}