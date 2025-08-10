import React, { useState } from 'react';
import { useMeshNodes } from '../hooks/useMeshNodes'; // Assume this hook exists

// Assume GlobeView and FlatMapView components exist and accept nodes and onSelect props
// import GlobeView from './GlobeView';
// import FlatMapView from './FlatMapView';

// Assume Node type is defined elsewhere
// type Node = {
//   id: string;
//   position: [number, number] | [number, number, number];
//   // Add other node properties here
// };

export interface MeshPinpointVisualizerProps {
  mode: '2D' | '3D';
}

const MeshPinpointVisualizer: React.FC<MeshPinpointVisualizerProps> = ({ mode }) => {
  const nodes = useMeshNodes();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const handleNodeSelect = (node: Node) => {
    setSelectedNode(node);
    // You might want to trigger a modal or panel here to show node details and configuration
    console.log('Selected Node:', node);
  };

  return (
    <div className="mesh-pinpoint-visualizer">
      {mode === '3D' ? (
        // @ts-ignore - Assuming GlobeView exists
        <GlobeView nodes={nodes} onSelect={handleNodeSelect} />
      ) : (
        // @ts-ignore - Assuming FlatMapView exists
        <FlatMapView nodes={nodes} onSelect={handleNodeSelect} />
      )}

      {/* Optional: Render a panel or modal for selectedNode */}
      {/* {selectedNode && (
        <div className="node-details-panel">
          <h3>{selectedNode.id}</h3>
          {/* Render node details and configuration options }
        </div>
      )} */}
    </div>
  );
};

export default MeshPinpointVisualizer;