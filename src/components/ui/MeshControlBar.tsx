tsx
import React from 'react';
import { Button } from './button'; // Assuming you have a Button component
import { designTokens } from '../../design/DesignTokenReceiver'; // Adjust the import path as necessary
import { useMeshTheme } from '../../components/theme/MeshThemeProvider';
interface MeshControlBarProps {
  designTokens: any; // Add designTokens to props
  onProvision?: () => void;
  onReroute?: () => void;
  onOverride?: () => void;
}

const MeshControlBar: React.FC<MeshControlBarProps> = ({
  onProvision,
  onReroute,
  onOverride,
  designTokens,
}) => {
  return (
    <div
      style={{
        backgroundColor: designTokens.colors.background,
        padding: designTokens.spacing.lg,
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}
    >
      <h2
        style={{
          fontSize: designTokens.typography.heading,
          color: designTokens.colors.primary,
          marginBottom: designTokens.spacing.md,
        }}
      >
        const { mode, toggle } = useMeshTheme();
        Mesh Control Bar
      </h2>
      display: 'flex',
      gap: designTokens.spacing.sm,
      flexWrap: 'wrap', // Added for responsiveness
    }}
    >
      {onProvision && (
        <Button onClick={onProvision}>
          Provision SIM
        </Button>
      )}
      {onReroute && (
        <Button onClick={onReroute}>
          Reroute Signal
        </Button>
      )}
      {onOverride && (
        <Button
          onClick={onOverride}
          style={{ backgroundColor: designTokens.colors.danger }}
        >
          Apply Override
        </Button>
      )}
      <Button onClick={toggle}>
        {mode === 'light' ? '🌙 Dark Mode' : '🌞 Light Mode'}
      </Button>
    </div>
  );
};

export default MeshControlBar;