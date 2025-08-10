import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface RippleProps {
  lat: number;
  lon: number;
  triggerTime: number;
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

const ConsensusRippleOverlay: React.FC<RippleProps> = ({ lat, lon, triggerTime }) => {
  const { scene } = useThree();
  const rippleRef = useRef<THREE.Mesh>(null);
  const origin = latLonToVec3(lat, lon, 2); // Assuming globe radius is 2

  useFrame(() => {
    if (rippleRef.current) {
      const elapsed = Date.now() - triggerTime;
      const duration = 1500; // Animation duration in milliseconds
      const maxRadius = 1; // Max radius of the ripple on the globe surface

      const progress = Math.min(elapsed / duration, 1);
      const scale = 1 + progress * maxRadius;
      // We scale the mesh itself. The ringGeometry defines the initial size.
      // A scale of 1 means the geometry's defined radius.
      // So, a scale of `1 + progress * maxRadius` will expand the ring outwards.
      // However, scaling a ring geometry uniformly scales both inner and outer radii.
      rippleRef.current.scale.setScalar(scale);

      const opacity = 1 - Math.min(elapsed / duration, 1);
      (rippleRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;

      // Optional: remove the ripple when animation is complete
      if (elapsed > duration && rippleRef.current.parent) {
        scene.remove(rippleRef.current);
      }
    }
  });

  return (
    // We use a PlaneGeometry and scale it, positioned and rotated to face outwards at the origin.
    <mesh ref={rippleRef} position={origin} lookAt={new THREE.Vector3(0, 0, 0)}>
      <planeGeometry args={[0.1, 0.1]} /> {/* Small initial size */}
      <meshBasicMaterial color={0x00ffff} transparent opacity={1} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
};

export default ConsensusRippleOverlay;