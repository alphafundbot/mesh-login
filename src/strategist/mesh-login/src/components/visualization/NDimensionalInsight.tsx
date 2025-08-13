import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

const NDimensionalShaderMaterial = shaderMaterial(
  { time: 0 },
  /*glsl*/`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /*glsl*/`
    uniform float time;
    varying vec2 vUv;

    void main() {
      vec3 color = vec3(vUv, 0.5 + 0.5 * sin(time + vUv.x * 10.0 + vUv.y * 10.0));
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// This is the important part - extend Three.js!
THREE.extend({ NDimensionalShaderMaterial });

const NDimensionalInsight: React.FC = (props) => {
  const meshRef = useRef();

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
      // You would likely position this within a R3F Canvas if not already in one
      // For standalone testing, ensure this is within a Canvas
      <mesh ref={meshRef}>
        <planeGeometry args={[5, 5, 1, 1]} />
        {/* @ts-ignore */}
        <nDimensionalShaderMaterial attach="material" />
      </mesh>
  );
};

export default NDimensionalInsight;