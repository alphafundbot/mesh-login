tsx
// src/components/ui/PerformanceMetricsPanel.tsx
import React from 'react';
import { designTokens } from '../../design/DesignTokenReceiver'; // Adjust the import path as needed

interface PerformanceMetrics {
  latency: number; // in ms
  throughput: number; // in requests per second or similar
  anomalyAlerts: number;
}

interface PerformanceMetricsPanelProps {
  metrics: PerformanceMetrics;
}

const PerformanceMetricsPanel: React.FC<PerformanceMetricsPanelProps> = ({ metrics }) => {
  return (
    <div
      style={{
      backgroundColor: designTokens.colors.background,
      padding: designTokens.spacing.lg,
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <h2 style={{
        fontSize: designTokens.typography.heading,
        color: designTokens.colors.primary,
        marginBottom: designTokens.spacing.md,
      }}>
 Performance Metrics
      </h2>
      <div
        style={{
 fontSize: designTokens.typography.body,
 color: designTokens.colors.primary,
        }}
      >
        <p><strong>Latency:</strong> {metrics.latency} ms</p>
        <p><strong>Throughput:</strong> {metrics.throughput} req/s</p>
        <p><strong>Anomaly Alerts:</strong> <span style={{ color: metrics.anomalyAlerts > 0 ? designTokens.colors.danger : designTokens.colors.primary }}>{metrics.anomalyAlerts}</span></p>
      </div>
    </div>
  );
};

export default PerformanceMetricsPanel;