// src/dashboard/meshConsensusPanel.tsx
import React from 'react';
import { meshConsensus } from '../consensus/meshConsensusProtocol';

export function MeshConsensusPanel({ logs }: { logs: any[] }) {
  const consensus = meshConsensus(logs);
  return (
    <div>
      <h2>Mesh Consensus Status</h2>
      <p>{consensus ? '✅ All domains aligned' : '⚠️ Override drift detected'}</p>
    </div>
  );
}