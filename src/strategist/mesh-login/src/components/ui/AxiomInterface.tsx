import React from 'react';

const AxiomInterface: React.FC = () => {
  return (
    <button style={{
      position: 'absolute',
      bottom: 80,
      right: 20,
      padding: '12px',
      backgroundColor: '#222',
      color: '#0ff',
      borderRadius: '6px',
      fontFamily: 'monospace'
    }}>
      🔧 Adjust Mesh Axioms
    </button>
  );
};

export default AxiomInterface;