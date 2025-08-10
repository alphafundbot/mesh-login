// src/components/visualization/AuditSpikeParticles.tsx
import React, { useMemo } from 'react';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AuditSpikeParticlesProps {
  events: { lat: number; lon: number; severity: number }[];
}

const latLonToVec3 = (lat: number, lon: number, radius = 2): THREE.Vector3 => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
};

const AuditSpikeParticles: React.FC<AuditSpikeParticlesProps> = ({ events }) => {
  const positions = useMemo(() => {
    const arr: number[] = [];
    events.forEach(({ lat, lon }) => {
      const vec = latLonToVec3(lat, lon);
      arr.push(vec.x, vec.y, vec.z);
    });
    return new Float32Array(arr);
  }, [events]);

  return (
    <Points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        transparent
        color="orange"
        size={0.1}
        sizeAttenuation
        depthWrite={false}
      />
    </Points>
  );
};

export default AuditSpikeParticles;