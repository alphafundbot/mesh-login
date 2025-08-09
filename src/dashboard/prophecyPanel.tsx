// src/dashboard/prophecyPanel.tsx
import React from 'react';
import { predictOverrideOutcome } from '../prophecy/overrideProphecyEngine';

export function ProphecyPanel({ signal, context }: { signal: string, context: any }) {
  const outcome = predictOverrideOutcome(signal, context);
  return (
    <div>
      <h2>Override Prophecy</h2>
      <p>Signal: <strong>{signal}</strong></p>
      <p>Predicted Outcome: <strong>{outcome}</strong></p>
    </div>
  );
}
