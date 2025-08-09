// src/timeline/meshEvolutionTimeline.tsx
import React from 'react';

export function MeshEvolutionTimeline({ logs }: { logs: any[] }) {
  return (
    <div>
      <h2>Mesh Evolution Timeline</h2>
      <ul>
        {logs.map((log, i) => (
          <li key={i}><strong>{log.timestamp}</strong>: {log.signal}</li>
        ))}
      </ul>
    </div>
  );
}
