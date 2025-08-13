// /components/ui/StatusBadge.tsx
import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'healthy' | 'degraded' | 'down';

export function StatusBadge({ status }: { status: Status }) {
  const mapping: Record<Status, { icon: React.ReactNode; label: string; className: string; }> = {
    healthy: { icon: <CheckCircle className="w-5 h-5"/>, label: 'Healthy', className: 'text-green-500' },
    degraded: { icon: <AlertTriangle className="w-5 h-5"/>, label: 'Degraded', className: 'text-yellow-500' },
    down: { icon: <XCircle className="w-5 h-5"/>, label: 'Down', className: 'text-red-500' },
  };

  const { icon, label, className } = mapping[status];
  return (
    <div className={cn("flex items-center space-x-1 text-sm font-medium", className)}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
