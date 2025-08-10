// src/dashboard/signalTriagePanel.tsx
import React from 'react';
import { prioritizeSignals } from '../signals/overrideSignalPrioritizer';

export function SignalTriagePanel({ signals }: { signals: string[] }) {
  // Log the number of signals received
  logTelemetryEvent('signal_triage_panel:signals_received', { count: signals.length });
  const sorted = prioritizeSignals(signals);
  // Log the sorted signals
  logTelemetryEvent('signal_triage_panel:signals_sorted', { signals: sorted });
  return (
    <div>
      <h2>Override Signal Triage</h2>
      <ul>
        {sorted.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </div>
  );
}
