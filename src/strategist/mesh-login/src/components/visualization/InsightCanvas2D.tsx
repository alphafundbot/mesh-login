import React, { useRef, useEffect } from 'react';
import { ModuleInsightRegistry } from '../../components/visualization/ModuleInsightRegistry';
import { AuditEngine } from '../../audit/AuditEngine'; // Assuming AuditEngine exists and has methods

interface InsightCanvas2DProps {
  module: string;
}

const InsightCanvas2D: React.FC<InsightCanvas2DProps> = ({ module }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const insight = ModuleInsightRegistry[module as keyof typeof ModuleInsightRegistry];
  useEffect(() => {
    if (!insight || insight.type !== '2D') return;

    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        if (module === 'AuditEngine') {
          // Placeholder for fetching audit data
          const auditEvents = [
            { timestamp: Date.now() - 100000, event: 'Auth Success', severity: 'info' },
            { timestamp: Date.now() - 80000, event: 'Config Update', severity: 'info' },
            { timestamp: Date.now() - 50000, event: 'Signal Anomaly', severity: 'warning' },
            { timestamp: Date.now() - 20000, event: 'Auth Failed', severity: 'critical' },
            { timestamp: Date.now() - 5000, event: 'Resource Provisioned', severity: 'info' },
          ];

          const startTime = auditEvents[0].timestamp;
          const endTime = auditEvents[auditEvents.length - 1].timestamp;
          const timeRange = endTime - startTime;

          const severityColors: { [key: string]: string } = {
            info: 'green',
            warning: 'orange',
            critical: 'red',
          };

          // Draw timeline
          context.beginPath();
          context.moveTo(50, canvas.height / 2);
          context.lineTo(canvas.width - 50, canvas.height / 2);
          context.strokeStyle = 'black';
          context.stroke();

          // Draw events on timeline
          auditEvents.forEach(event => {
            const x = 50 + ((event.timestamp - startTime) / timeRange) * (canvas.width - 100);
            const y = canvas.height / 2;

            context.fillStyle = severityColors[event.severity] || 'gray';
            context.beginPath();
            context.arc(x, y, 5, 0, Math.PI * 2);
            context.fill();

            // Draw event text (simplified)
            context.font = '10px Arial';
            context.fillStyle = 'black';
            context.textAlign = 'center';
            context.fillText(event.event, x, y - 10);
          });
        } else {
          // Placeholder for other 2D visualizations
          context.fillStyle = 'lightgray';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.font = '20px Arial';
          context.fillStyle = 'black';
          context.textAlign = 'center';
          context.fillText(`2D visualization for ${module}`, canvas.width / 2, canvas.height / 2);
        }
      }
    }
  }, [module, insight]); // Add module and insight to dependency array

  return (
    <canvas
 ref={canvasRef}
 width={500}
 height={300}
 style={{ border: '1px solid black', display: 'block', margin: 'auto' }}
    >
      Select a module for 2D insight.
    </canvas>
  );
};

export default InsightCanvas2D;