tsx
// src/components/ui/ProvisioningHeatmap.tsx
import React from 'react';
import { designTokens, DesignTokens } from '../../design/DesignTokenReceiver';

interface RegionStatus {
  region: string;
  status: 'provisioned' | 'pending' | 'failed';
}

interface ProvisioningHeatmapProps {
  data: RegionStatus[];
  designTokens: DesignTokens;
  region: string;
  status: 'provisioned' | 'pending' | 'failed';
}

interface ProvisioningHeatmapProps {
  data: RegionStatus[];
}

const statusColors = {
  provisioned: designTokens.colors.accent,
  pending: '#FACC15', // Tailwind yellow-500
  failed: designTokens.colors.danger,
};

const ProvisioningHeatmap: React.FC<ProvisioningHeatmapProps> = ({ data, designTokens }) => {
  return (
    <div className="provisioning-heatmap" style={{
      backgroundColor: designTokens.colors.background,
      padding: designTokens.spacing.lg,
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{
        fontSize: designTokens.typography.heading,
        color: designTokens.colors.primary,
        marginBottom: designTokens.spacing.md
      }}>Provisioning Heatmap</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: designTokens.spacing.sm }}>
        {data.map((item) => (
          <div
            key={item.region}
            style={{
              backgroundColor: statusColors[item.status],
              color: designTokens.colors.primary,
              padding: designTokens.spacing.sm,
              borderRadius: '4px',
              textAlign: 'center',
              fontSize: designTokens.typography.caption,
              fontWeight: 'bold',
            }}
          >
            {item.region}
          </div>
        ))}
        {/* Placeholder content */}
        <p style={{ fontSize: designTokens.typography.body, color: designTokens.colors.primary }}>
          Visual representation of SIM provisioning status across different geographical regions.
        </p>
      </div>
    </div>
  );
};

export default ProvisioningHeatmap;