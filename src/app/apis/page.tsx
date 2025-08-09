// /app/apis/page.tsx
'use client';

import React, { useState } from 'react';
import { useApiStatuses } from '../../hooks/useApiStatuses';
import { APIStatusCard } from '../../components/ui/APIStatusCard';
import { FilterBar } from '../../components/ui/FilterBar';
import AppLayout from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApiDashboard() {
  const { data: apis = [], isLoading, isError } = useApiStatuses();
  const [filter, setFilter] = useState('');

  const filtered = apis.filter(a =>
    a.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <AppLayout>
        <div className="p-6">
        <h1 className="text-2xl mb-4">API Management</h1>
        <FilterBar filter={filter} onFilterChange={setFilter} />

        {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )}
        {isError && <p className="text-destructive">Error loading API statuses.</p>}

        {!isLoading && !isError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(api => (
                <APIStatusCard key={api.id} api={api} />
                ))}
            </div>
        )}
        </div>
    </AppLayout>
  );
}
