import React from 'react';
import MeshVisualizer3D from './mesh-visualizer-3d';

const StrategistDashboard: React.FC = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '2rem' }}>
      <div>
        <h2>🌐 Mesh Pulse Quadrant</h2>
        <MeshVisualizer3D />
      </div>
      <div>
        <h2>🧠 Intelligence Flow Quadrant</h2>
        <div style={{ backgroundColor: 'black', color: 'green', padding: '1rem', height: '600px' }}>
          <p>Signal flow overlays will render here.</p>
        </div>
      </div>
    </div>
  );
};

export default StrategistDashboard;