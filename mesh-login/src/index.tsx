import React from 'react';
import ReactDOM from 'react-dom/client';
import MeshVisualizer3D from './dashboard/mesh-visualizer-3d';

import StrategistDashboard from './dashboard/StrategistDashboard';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<StrategistDashboard />);