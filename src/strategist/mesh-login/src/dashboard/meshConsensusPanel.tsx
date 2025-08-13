// src/dashboard/meshConsensusPanel.tsx
import React from 'react';
import { meshConsensus } from '../consensus/meshConsensusProtocol';

// Assume logTelemetryEvent is available globally or imported from a centralized monitoring module
declare const logTelemetryEvent: (eventName: string, metadata?: any) => void;

export function MeshConsensusPanel({ logs }: { logs: any[] }) {
  logTelemetryEvent('mesh_consensus_panel:logs_received', { count: logs.length });
  const consensus = meshConsensus(logs);
  logTelemetryEvent('mesh_consensus_panel:consensus_status', { consensus });
  return (
    <div>
      <h2>Mesh Consensus Status</h2>
      <p>{consensus ? '✅ All domains aligned' : '⚠️ Override drift detected'}</p>
    </div>
  );
}