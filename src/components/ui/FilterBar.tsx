// /components/ui/FilterBar.tsx
import React from 'react';
import { Input } from './input';

interface Props {
  filter: string;
  onFilterChange: (f: string) => void;
}

export function FilterBar({ filter, onFilterChange }: Props) {
  return (
    <div className="mb-4">
      <Input
        type="text"
        placeholder="Search APIs…"
        value={filter}
        onChange={e => onFilterChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
