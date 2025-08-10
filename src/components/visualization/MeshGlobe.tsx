import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Line } from '@react-three/drei';
import { meshBus } from '../../core/MeshBus';
import * as THREE from 'three'; // Ensure THREE is imported for Vector3 and TextureLoader

import AuditSpikeParticles from '/src/components/visualization/AuditSpikeParticles'; // Corrected path
import ConsensusRippleOverlay from '/src/components/visualization/ConsensusRippleOverlay'; // Import ConsensusRippleOverlay
import DiagnosticSweepOverlay from '/src/components/visualization/DiagnosticSweepOverlay'; // Import DiagnosticSweepOverlay

import SignalLaserArcs from '/src/components/visualization/SignalLaserArcs';
interface MeshGlobeProps {
  selectedModule: string;
}

// Helper function to convert lat/lon to 3D coordinates
const latLonToCartesian = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lon + 180) * Math.PI / 180;
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
};

interface AuditEvent {
  lat: number;
  lon: number;
  severity: string;
  timestamp: number;
}

interface SignalRoute {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  bandwidth: number;
  endLon: number;
}

const Globe: React.FC = () => {
  const texture = new THREE.TextureLoader().load('/textures/earth_texture.jpg');
  return (
    <mesh scale={[2, 2, 2]}>
      <sphereGeometry args={[1, 64, 64]} /> {/* Increased segments for smoother sphere */}
      <meshStandardMaterial map={texture} />
    </mesh>
  );
};

const Atmosphere: React.FC = () => {
  return (
    <mesh scale={[2.1, 2.1, 2.1]}> {/* Slightly larger sphere for atmosphere */}
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        attach="material"
        args={[{
          uniforms: {
            c: { type: 'f', value: 0.1 },
            p: { type: 'f', value: 10 },
            glowColor: { type: 'c', value: new THREE.Color(0x00aaff) },
          },
          vertexShader: `
            uniform float c;
            uniform float p;
            varying float intensity;
            void main() {
              vec3 vNormal = normalize( normalMatrix * normal );
              intensity = pow( c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p );
              gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
          `,
          fragmentShader: `
            uniform vec3 glowColor;
            varying float intensity;
            void main() {
              vec3 glow = glowColor * intensity;
              gl_FragColor = vec4( glow, 1.0 );
            }
          `,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true,
        }]}
      />
    </mesh>
  );
};

const MeshGlobe: React.FC<MeshGlobeProps> = ({ selectedModule }) => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [signalRoutes, setSignalRoutes] = useState<SignalRoute[]>([]);
  const [rippleEvents, setRippleEvents] = useState<{ lat: number; lon: number; triggerTime: number }[]>([]); // State for ripple animations
  const [diagnosticSweepActive, setDiagnosticSweepActive] = useState(false); // State for diagnostic sweep

  useEffect(() => {
    // Initial data fetching (optional, depending on whether you want initial data before streams)
    // async function fetchInitialData() {
    //   const initialAuditEvents = await AuditEngine.getRecentEvents(); // Assuming this exists
    //   setAuditEvents(initialAuditEvents);
    //   const initialSignalRoutes = await SignalRouter.getRouteMap(); // Assuming this exists
    //   setSignalRoutes(initialSignalRoutes);
    // }
    // fetchInitialData();

    const handleAuditSpike = (event: any) => {
      if (event.type === 'globe:audit_spike' && event.payload) {
        setAuditEvents(prev => [...prev, event.payload]);
      }
    };

    const handleSignalRoute = (event: any) => {
      if (event.type === 'globe:signal_route') {
        setSignalRoutes(prev => [...prev, event.payload]);
      }
    };

    const RIPPLE_DURATION = 2000; // Milliseconds
    const handleConsensusEvent = (event: any) => {
      if (event.type === 'meshBus:consensus_event' && event.payload) {
        // Add a new ripple at the event location with the current time as trigger
        setRippleEvents(prev => [...prev, { lat: event.payload.lat, lon: event.payload.lon, triggerTime: Date.now() }]);
      }
    };

    const handleDiagnosticSweep = (event: any) => {
      if (event.type === 'meshBus:diagnostic_sweep') {
        setDiagnosticSweepActive(prev => !prev); // Toggle sweep state
      }
    };

    // Logic to remove old ripples
    const rippleCleanupInterval = setInterval(() => {
      const now = Date.now();
      setRippleEvents(prev => prev.filter(ripple => (now - ripple.triggerTime) < RIPPLE_DURATION));
    }, 500); // Check and clean up every 500ms

    const handleFocusModeToggle = (event: any) => {
      }
    };

    meshBus.subscribe(handleAuditSpike);
    meshBus.subscribe(handleSignalRoute);
    meshBus.subscribe(handleConsensusEvent); // Subscribe to consensus events
    meshBus.subscribe(handleDiagnosticSweep); // Subscribe to diagnostic sweep events

    return () => {
      // Unsubscribe from all events on cleanup
      meshBus.unsubscribe(handleAuditSpike);
      meshBus.unsubscribe(handleSignalRoute);
      meshBus.unsubscribe(handleConsensusEvent);
      meshBus.unsubscribe(handleDiagnosticSweep);
      // TODO: Unsubscribe from other events as well
    };
  }, []);

  return (
    <Canvas style={{ height: '600px', width: '100%' }}>
      <ambientLight />
      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} /> {/* Enabled zoom, pan, rotate */}
      <Globe />
      <Atmosphere />

      {/* Operational Overlays */}
      {selectedModule === 'AuditEngine' && (
        <AuditSpikeParticles events={auditEvents} />
      )}
      {selectedModule === 'SignalRouter' && (
        <SignalLaserArcs routes={signalRoutes.map(route => ({
          from: [route.startLat, route.startLon],
          to: [route.endLat, route.endLon],
          bandwidth: route.bandwidth, // Use actual bandwidth
          latency: route.latency // Use actual latency
        }))} />
      )}

      {/* Global Animation Overlays */}
      {rippleEvents.map((ripple, index) => <ConsensusRippleOverlay key={index} {...ripple} />)} {/* Render active ripples */}
      {diagnosticSweepActive && <DiagnosticSweepOverlay />} {/* Conditionally render diagnostic sweep */}

      {/* Psychographic Overlays (Conditionally dimmed in Focus Mode) */}
      {/* {selectedInsightType === 'psychographic' && !focusMode && <PsychMap2D ... />} */}
      {/* {selectedInsightType === 'psychographic' && !focusMode && <PsychPulse3D ... />} */}
      {/* TODO: Integrate real data fetching and animation */}
      {/* TODO: Implement Focus Mode Dimming */}
    </Canvas>
  );
};

export default MeshGlobe;