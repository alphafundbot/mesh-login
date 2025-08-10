// src/dashboard/quotaMetrics.tsx
import React from 'react';

export function QuotaDashboard({ quotaState }: { quotaState: any }) {
  logTelemetryEvent('quota_dashboard:displaying_quota', { metadata: { quotaState } });
  return (
    <div>
      <h2>Gemini Quota Metrics</h2>
      <pre>{JSON.stringify(quotaState, null, 2)}</pre>
    </div>
  );
}
