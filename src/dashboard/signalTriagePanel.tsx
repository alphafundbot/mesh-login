// src/dashboard/signalTriagePanel.tsx
import React from 'react';
import { prioritizeSignals } from '../signals/overrideSignalPrioritizer';

export function SignalTriagePanel({ signals }: { signals: string[] }) {
  const sorted = prioritizeSignals(signals);
  return (
    <div>
      <h2>Override Signal Triage</h2>
      <ul>
        {sorted.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}
