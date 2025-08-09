// src/dashboard/quotaMetrics.tsx
import React from 'react';

export function QuotaDashboard({ quotaState }: { quotaState: any }) {
  return (
    <div>
      <h2>Gemini Quota Metrics</h2>
      <pre>{JSON.stringify(quotaState, null, 2)}</pre>
    </div>
  );
}
