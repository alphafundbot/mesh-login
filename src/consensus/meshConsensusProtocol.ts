// src/consensus/meshConsensusProtocol.ts
export function meshConsensus(logs: any[]): boolean {
  const signals = logs.map(log => log.signal);
  const uniqueSignals = new Set(signals);
  return uniqueSignals.size === 1; // All domains agree
}