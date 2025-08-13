import React from 'react';

interface MeshHUDPanelProps {
  uptime: string;
  auditDensity: number;
  signalHealth: string;
  selectedModule: string;
}

const MeshHUDPanel: React.FC<MeshHUDPanelProps> = ({
  uptime,
  auditDensity,
  signalHealth,
  selectedModule,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: '#00ffff',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        zIndex: 20,
        pointerEvents: 'none', // Allows interactions with elements behind the panel
      }}
    >
      <h3>Strategist Telemetry</h3>
      <p>Module: {selectedModule}</p>
      <p>Uptime: {uptime}</p>
      <p>Audit Density: {auditDensity.toFixed(2)}</p>
      <p>Signal Health: {signalHealth}</p>
    </div>
  );
};

export default MeshHUDPanel;