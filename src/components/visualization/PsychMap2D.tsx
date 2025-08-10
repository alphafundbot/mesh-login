// src/components/visualization/PsychMap2D.tsx
import React, { useRef, useEffect } from 'react';
import { meshBus } from '../../mesh/MeshBus'; // Assuming MeshBus is here

interface PsychDataPoint {
  lat: number;
  lon: number;
  intensity: number; // Or attention level, etc.
}

interface PsychMap2DProps {
  type?: 'heatmap' | 'attention_zones';
  // Other props like opacity, onHover could be added later
}

const PsychMap2D: React.FC<PsychMap2DProps> = ({ type = 'heatmap' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dataPoints = useRef<PsychDataPoint[]>([]);

  // Helper to convert Lat/Lon to 2D canvas coordinates (basic projection)
  const latLonToCanvasXY = (lat: number, lon: number, canvasWidth: number, canvasHeight: number): { x: number; y: number } => {
    const x = (lon + 180) * (canvasWidth / 360);
    const y = (90 - lat) * (canvasHeight / 180);
    return { x, y };
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw based on the selected type
    if (type === 'heatmap') {
      dataPoints.current.forEach(point => {
        const { x, y } = latLonToCanvasXY(point.lat, point.lon, canvas.width, canvas.height);

        // Basic heatmap circle
        const radius = point.intensity * 20 + 5; // Scale radius by intensity
        const opacity = point.intensity * 0.6 + 0.2; // Scale opacity

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${opacity})`; // Orange/Yellow gradient potential
        ctx.fill();
      });
    } else if (type === 'attention_zones') {
       dataPoints.current.forEach(point => {
        const { x, y } = latLonToCanvasXY(point.lat, point.lon, canvas.width, canvas.height);

        // Basic attention zone rectangle/marker
        const size = point.intensity * 15 + 5;
        const color = point.intensity > 0.7 ? 'red' : point.intensity > 0.4 ? 'yellow' : 'blue';

        ctx.fillStyle = color;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
       });
    }

    // Add more visualization types here
  };

  useEffect(() => {
    // Setup canvas size
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
      draw(); // Initial draw
    }

    // Subscribe to meshBus events (using hypothetical event types)
    const handlePsychFocus = (event: any) => {
       if (event.payload && event.payload.lat !== undefined && event.payload.lon !== undefined && event.payload.intensity !== undefined) {
           dataPoints.current.push(event.payload as PsychDataPoint);
           // Simple cleanup: keep last 100 points
           if (dataPoints.current.length > 100) {
               dataPoints.current = dataPoints.current.slice(-100);
           }
           draw(); // Redraw on new data
       }
    };

    const handleEmotionIntensity = (event: any) => {
        if (event.payload && event.payload.lat !== undefined && event.payload.lon !== undefined && event.payload.intensity !== undefined) {
            dataPoints.current.push(event.payload as PsychDataPoint);
             // Simple cleanup: keep last 100 points
           if (dataPoints.current.length > 100) {
               dataPoints.current = dataPoints.current.slice(-100);
           }
            draw(); // Redraw on new data
        }
    };

    // Assume these events exist on the meshBus
    meshBus.subscribe('meshBus:psych_focus', handlePsychFocus);
    meshBus.subscribe('meshBus:emotion_intensity', handleEmotionIntensity);

    // Cleanup subscription on component unmount
    return () => {
        meshBus.unsubscribe('meshBus:psych_focus', handlePsychFocus);
        meshBus.unsubscribe('meshBus:emotion_intensity', handleEmotionIntensity);
    };
  }, [type]); // Redraw when type changes

  // Optional: Redraw on window resize
  useEffect(() => {
    const handleResize = () => {
        const canvas = canvasRef.current;
        if (canvas) {
             canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
             canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
             draw();
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [type]); // Dependencies needed for the draw function

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none', // Allow clicks to pass through to the globe
      zIndex: 10 // Ensure it's above the globe but below HUD
    }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default PsychMap2D;