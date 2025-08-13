import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { meshBus } from '../../mesh/MeshBus'; // Assuming MeshBus is in ../../mesh

interface PsychData {
  id: string;
  type: 'subconscious_flow' | 'ritual_engagement';
  lat?: number;
  lon?: number;
  fromLat?: number;
  fromLon?: number;
  toLat?: number;
  toLon?: number;
  intensity?: number;
  latency?: number;
}

interface PsychPulse3DProps {
  type: 'subconscious_flow' | 'ritual_engagement' | null;
  // Other props for filtering or global settings could go here
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

const PsychPulse3D: React.FC<PsychPulse3DProps> = ({ type }) => {
  const [psychData, setPsychData] = useState<PsychData[]>([]);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!type) return;

    const handler = (event: PsychData) => {
      // Basic filtering based on type prop
      if (event.type === type) {
        setPsychData(prevData => [...prevData, { ...event, id: Math.random().toString(36).substring(7) }]);
      }
    };

    // Subscribe to relevant psychographic events
    const unsubscribeDecisionLatency = meshBus.subscribe('meshBus:decision_latency', handler);
    const unsubscribeRitualEngagement = meshBus.subscribe('meshBus:ritual_engagement', handler);
    const unsubscribeSubconsciousFlow = meshBus.subscribe('meshBus:subconscious_flow', handler);

    return () => {
      // Cleanup subscriptions on unmount or type change
      unsubscribeDecisionLatency();
      unsubscribeRitualEngagement();
      unsubscribeSubconsciousFlow();
      setPsychData([]); // Clear data when type changes or unmounts
    };
  }, [type]);

  useFrame(({ clock }) => {
    // Animation logic for rendering pulses/flows
    if (groupRef.current) {
      // Example: Basic animation for all rendered objects (needs refinement per data type)
      groupRef.current.children.forEach((child: any) => {
        // Example pulse animation (for ritual engagement or decision latency at a point)
        if (child.userData.type === 'ritual_engagement' || child.userData.type === 'decision_latency_point') {
           const elapsed = clock.getElapsedTime() - child.userData.startTime;
           const scale = 1 + Math.sin(elapsed * 5) * 0.5 * child.userData.intensity;
           child.scale.setScalar(scale);
           child.material.opacity = Math.max(0, 1 - elapsed * 0.5); // Fade out over ~2 seconds
        }

        // Example flow animation (for subconscious flows or decision latency between points)
        if (child.userData.type === 'subconscious_flow' || child.userData.type === 'decision_latency_flow') {
            // More complex animation needed here, e.g., moving particles along the line geometry
        }
      });

       // Clean up expired items
       const now = clock.getElapsedTime();
       groupRef.current.children = groupRef.current.children.filter((child: any) => {
           const elapsed = now - child.userData.startTime;
           // Assuming a max lifespan of 4 seconds for all psychographic visuals
           return elapsed < 4;
       });
    }
  });

  const renderedObjects = useMemo(() => {
      const objects: JSX.Element[] = [];
      psychData.forEach(item => {
          if (item.type === 'ritual_engagement' && item.lat !== undefined && item.lon !== undefined) {
              const position = latLonToVec3(item.lat, item.lon);
              objects.push(
                  <mesh
                      key={item.id}
                      position={position}
                      userData={{ type: 'ritual_engagement', intensity: item.intensity || 1, startTime: Date.now() / 1000 }} // Attach data for animation
                  >
                      <sphereGeometry args={[0.05, 16, 16]} />
                      <meshBasicMaterial color={item.intensity > 0.7 ? 'hotpink' : 'purple'} transparent opacity={0.8} />
                  </mesh>
              );
          } else if (item.type === 'subconscious_flow' && item.fromLat !== undefined && item.fromLon !== undefined && item.toLat !== undefined && item.toLon !== undefined) {
              const start = latLonToVec3(item.fromLat, item.fromLon);
              const end = latLonToVec3(item.toLat, item.toLon);
              const curve = new THREE.CatmullRomCurve3([start, end]); // Simple straight line for now, can make curved later
              const points = curve.getPoints(50);
              const geometry = new THREE.BufferGeometry().setFromPoints(points);

              objects.push(
                  <line
                      key={item.id}
                      geometry={geometry}
                       userData={{ type: 'subconscious_flow', latency: item.latency || 0, startTime: Date.now() / 1000 }} // Attach data for animation
                  >
                      <lineBasicMaterial color={item.latency > 0.1 ? 'orange' : 'cyan'} transparent opacity={0.5} linewidth={2} />
                  </line>
              );
          }
           // Add other psychographic types here as needed
      });
      return objects;
  }, [psychData]); // Recreate objects when psychData changes

  if (type === null) {
      return null; // Don't render anything if no psychographic type is selected
  }


  return (
    <group ref={groupRef}>
      {renderedObjects}
    </group>
  );
};

export default PsychPulse3D;