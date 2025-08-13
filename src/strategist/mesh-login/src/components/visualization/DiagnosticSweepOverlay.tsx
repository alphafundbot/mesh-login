import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float time;
  varying vec2 vUv;
  uniform vec3 sweepColor;
  uniform float opacity;

  void main() {
    float distance_from_center = length(vUv - 0.5);
    float gradient = smoothstep(0.5, 0.0, distance_from_center); // Radial gradient
    
    // Simple pulsing effect based on time
    float pulse = sin(time * 5.0) * 0.2 + 0.8;

    gl_FragColor = vec4(sweepColor * gradient * pulse, opacity * gradient * pulse);
  }
`;

const DiagnosticSweepOverlay: React.FC = () => {
  const sweepRef = useRef<THREE.Mesh>(null);
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      time: { value: 0 },
      sweepColor: { value: new THREE.Color(0x00ffff) }, // Cyan color
      opacity: { value: 0.3 }
    },
    transparent: true,
    side: THREE.DoubleSide,
  }), []);

  useFrame(() => {
    if (sweepRef.current) {
      // Rotate around the Y axis (local up axis of the ring geometry's plane)
      // Adjust rotation speed as needed
      sweepRef.current.rotation.y += 0.01;
      material.uniforms.time.value = Date.now() * 0.001; // Update time uniform for animation
    }
  });

  return (
    <mesh ref={sweepRef} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.05, 2.1, 64]} /> {/* Adjust inner/outer radius as needed */}
      <primitive object={material} attach="material" />
    </mesh>
  );
};

export default DiagnosticSweepOverlay;