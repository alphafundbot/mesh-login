// /components/ui/APIDetailModal.tsx
import React, { useEffect } from 'react';
import type { ApiStatus } from '../../hooks/useApiStatuses';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  api: ApiStatus;
  onClose: () => void;
}

export function APIDetailModal({ api, onClose }: Props) {
  const mockHistory = Array.from({ length: 20 }).map((_, i) => ({
    time: `${i}m ago`,
    latency: Math.random() * 200 + 50,
  }));

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-card p-6 rounded-lg w-3/4 max-w-2xl relative border shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">✕</button>
        <h2 className="text-xl font-semibold mb-4">{api.name} Metrics</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockHistory}>
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
              <YAxis unit="ms" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} stroke="hsl(var(--border))" />
              <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))"
                }}
              />
              <Line type="monotone" dataKey="latency" stroke="hsl(var(--accent))" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
