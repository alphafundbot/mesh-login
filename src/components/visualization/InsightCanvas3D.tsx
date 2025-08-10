import React, { useRef, useEffect } from 'react';
import { ModuleInsightRegistry } from '../../components/visualization/ModuleInsightRegistry'; // Using absolute path

interface InsightCanvas3DProps {
  module: string;
}

const InsightCanvas3D: React.FC<InsightCanvas3DProps> = ({ module }) => {
  const insight = ModuleInsightRegistry[module];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  return (
    <div style={{
      backgroundColor: '#1a1a2e', // Dark background for contrast
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px' // Placeholder height
    }}>
      <canvas
        ref={canvasRef}
        style={{ // Applying styles here
          width: '100%',
          height: '300px', // Placeholder height
          border: '1px solid #4a4a6a' // Visible border
        }}
      >
        Your browser does not support the HTML5 canvas tag.
      </canvas>
    </div>
  );
};

export default InsightCanvas3D;