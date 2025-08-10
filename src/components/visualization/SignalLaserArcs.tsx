import React from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface SignalLaserArcsProps {
  routes: { from: [number, number]; to: [number, number]; bandwidth: number; latency: number }[];
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

const SignalLaserArcs: React.FC<SignalLaserArcsProps> = ({ routes }) => {
  return (
    <>
      {routes.map((route, idx) => {
        const start = latLonToVec3(route.from[0], route.from[1]);
        const end = latLonToVec3(route.to[0], route.to[1]);
        // For now, a direct line. Curving will require more complex geometry or a path library.
        return (
          <Line
            key={idx}
            points={[start, end]}
            color="cyan"
            lineWidth={route.bandwidth * 0.5} // Example scaling
            dashed={false}
          />
        );
      })}
    </>
  );
};

export default SignalLaserArcs;