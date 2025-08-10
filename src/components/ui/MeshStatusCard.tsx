tsx
// src/components/ui/MeshStatusCard.tsx
import React from 'react';
import { DesignTokens } from '../../design/DesignTokenReceiver'; // Assuming DesignTokens interface exists
import { Card } from './card';

interface MeshStatusCardProps {
  health: 'healthy' | 'degraded' | 'offline';
  uptime: string; // e.g., "99.9%" or "30 days"
  activeModules: number;
  designTokens: DesignTokens; // Accept designTokens as a prop
}

const MeshStatusCard: React.FC<MeshStatusCardProps> = ({ health, uptime, activeModules, designTokens }) => {
    health === 'healthy'
      ? designTokens.colors.accent
      : health === 'degraded'
      ? designTokens.colors.danger
      : designTokens.colors.primary;

  return (
    <Card style={{
      backgroundColor: designTokens.colors.background,
      padding: designTokens.spacing.lg,
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{ fontSize: designTokens.typography.heading, color: designTokens.colors.primary, marginBottom: designTokens.spacing.md }}>
        🧩 Mesh Status
      </h3>
      <div style={{ marginTop: designTokens.spacing.sm }}>
        <p style={{ fontSize: designTokens.typography.body, color: designTokens.colors.primary }}>
          Overall Health: <span style={{ color: healthColor, fontWeight: 'bold' }}>{health.toUpperCase()}</span>
        </p>
        <p style={{ fontSize: designTokens.typography.body, color: designTokens.colors.primary }}>
          Uptime: 99.999%
        </p>
        <p style={{ fontSize: designTokens.typography.body, color: designTokens.colors.primary }}>
          Active Modules: 42
        </p>
        <p style={{ fontSize: designTokens.typography.body, color: designTokens.colors.primary }}>Signal Health: Optimal</p>
      </div>
    </Card>
  );
};

export default MeshStatusCard;