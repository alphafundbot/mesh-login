typescriptreact
import React from 'react';

export default function BrainGlobe({ strategistSignature }: { strategistSignature: string }) {
  return (
    <div style={{ position: 'relative', width: '300px', height: '300px', margin: 'auto' }}>
      <div style={{ fontSize: '100px', textAlign: 'center' }}>🧠</div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        // Placeholder for animation - actual keyframes needed
        animation: 'orbit 6s linear infinite',
      }}>
        <span style={{
          fontSize: '0.9rem',
          color: '#00ffcc',
          fontFamily: 'monospace'
        }}>{strategistSignature}</span>
      </div>
    </div>
  );
}