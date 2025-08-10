import React from 'react';
import { designTokens } from '../../design/DesignTokenReceiver';

const MeshDashboardGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(320px, 1fr))`,
    gap: designTokens.spacing.lg,
    padding: designTokens.spacing.lg,
  };

  // Basic media query for collapsing to single column below 'md' breakpoint
  // Note: For more complex responsiveness, a dedicated CSS-in-JS library or framework would be more maintainable.
  const responsiveStyles = `
    @media (max-width: ${designTokens.breakpoints.md}) {
      .mesh-dashboard-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  return (
    <div className="mesh-dashboard-grid" style={gridStyles}>
      {children}
    </div>
  );
};

export default MeshDashboardGrid;