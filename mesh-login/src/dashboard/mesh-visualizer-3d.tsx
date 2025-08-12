typescriptreact
import React, { useRef, useEffect, useState } from 'react';
import * as THREE from "three";
import { SignalEvent } from "../lib/telecom-types";
import { fetchTelecomSignalLogs } from "../lib/telecom-signal-logs";
import { processTelecomSignals } from "../lib/telecom-processor";

export default function MeshVisualizer3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 100;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const animate = async () => {
      try {
        const rawSignals = await fetchTelecomSignalLogs();
        const processed = processTelecomSignals(rawSignals);
        setError(null); // Clear any previous errors

        scene.clear();

        processed.forEach((signal, idx) => {
          const geometry = new THREE.SphereGeometry(2, 32, 32);
          const color =
            signal.tier === "Critical" ? "#ff4d4f" :
            signal.tier === "High" ? "#ffa94d" :
            signal.tier === "Medium" ? "#ffd43b" : "#69db7c";

          const material = new THREE.MeshBasicMaterial({ color });
          const sphere = new THREE.Mesh(geometry, material);

          sphere.position.set(
            Math.sin(idx) * 30,
            Math.cos(idx) * 30,
            signal.strength * 0.5
          );

          scene.add(sphere);
        });

        renderer.render(scene, camera);
      } catch (err) {
        console.error("Error fetching or processing telecom signals:", err);
        setError("Failed to load telecom signals: " + (err as Error).message);
      }
    };


    return () => {
      clearInterval(interval);
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []); // Re-run effect if credentials change

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div ref={mountRef} style={{ width: "100%", height: "600px" }} />
  );
}