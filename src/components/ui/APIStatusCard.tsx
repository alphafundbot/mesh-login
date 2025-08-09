// /components/ui/APIStatusCard.tsx
import React, { useState } from 'react';
import type { ApiStatus } from '../../hooks/useApiStatuses';
import { StatusBadge } from './StatusBadge';
import { APIDetailModal } from './APIDetailModal';
import { Card, CardHeader, CardTitle, CardContent } from './card';

export function APIStatusCard({ api }: { api: ApiStatus }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="cursor-pointer hover:shadow-lg hover:border-accent transition-all"
      >
        <CardHeader>
            <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{api.name}</CardTitle>
                <StatusBadge status={api.status} />
            </div>
        </CardHeader>
        <CardContent>
            <p className="text-xs text-muted-foreground">
            Last checked: {new Date(api.lastChecked).toLocaleTimeString()}
            </p>
            <p className="mt-2 text-sm font-mono">Latency: {api.responseTimeMs} ms</p>
        </CardContent>
      </Card>
      {open && <APIDetailModal api={api} onClose={() => setOpen(false)} />}
    </>
  );
}
