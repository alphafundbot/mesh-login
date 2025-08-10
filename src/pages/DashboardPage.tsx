import React from 'react';
import MeshDashboardGrid from '../components/layout/MeshDashboardGrid';
import { MeshStatusCard } from '../components/ui/MeshStatusCard';
import { ProvisioningHeatmap } from '../components/ui/ProvisioningHeatmap';
import { AuditTrailPanel } from '../components/ui/AuditTrailPanel';
import { SignalFlowGraph } from '../components/ui/SignalFlowGraph';
import { PerformanceMetricsPanel } from '../components/ui/PerformanceMetricsPanel';
import { MeshControlBar } from '../components/ui/MeshControlBar';
import { MeshThemeProvider } from '../components/theme/MeshThemeProvider';
import ModuleSelector from '../components/ui/ModuleSelector';
import MeshHUDPanel from '../components/ui/MeshHUDPanel';
import MeshGlobe from '../components/visualization/MeshGlobe';
// import { designTokens } from '../design/DesignTokenReceiver'; // designTokens will now be provided by ThemeProvider
import InsightSelector from '../components/ui/InsightSelector';
import PsychMap2D from '../components/visualization/PsychMap2D';
import PsychPulse3D from '../components/visualization/PsychPulse3D';
import NDimensionalInsight from '../components/visualization/NDimensionalInsight';
import AxiomInterface from '../components/ui/AxiomInterface';
import StrategicOutcomePanel from '../components/ui/StrategicOutcomePanel';
import TranscendenceMonitor from '../components/ui/TranscendenceMonitor';

const DashboardPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = React.useState<string | null>(null);
  const [insightType, setInsightType] = React.useState<{ type: 'operational' | 'psychographic'; subType?: string }>({ type: 'operational' });
  // Assuming you have an auditEvents state in MeshGlobe, lift it up or pass it down
  const auditEventsCount = 0; // Replace with actual count if state is lifted or passed

  return (
    <> {/* Using a Fragment to contain multiple top-level elements */}
    <MeshThemeProvider>
      <MeshDashboardGrid>
        <InsightSelector onSelectInsightType={setInsightType} />
        {insightType.type === 'operational' && <ModuleSelector onSelectModule={setSelectedModule} />}
        {insightType.type === 'operational' ? (
          <MeshGlobe selectedModule={selectedModule} />
        ) : (
          <> {/* Pass subType to psychographic components */}
            <PsychMap2D data={{}} type={insightType.subType || 'emotional'} /> {/* Placeholder props */}
            <PsychPulse3D data={{}} intensity={1} pulseRate={0.01} type={insightType.subType || 'subconscious_flow'}/> {/* Placeholder props */}
          </>
        )}
        <MeshHUDPanel
          uptime="99.999%"
          auditDensity={auditEventsCount} // Use actual count or keep placeholder
          signalHealth="Stable"
          selectedModule={selectedModule || 'None Selected'}
        />
        <MeshStatusCard />
        <ProvisioningHeatmap />
        <AuditTrailPanel />
        <SignalFlowGraph />
        <PerformanceMetricsPanel />
        <MeshControlBar />
      </MeshDashboardGrid>

      <NDimensionalInsight />
      <AxiomInterface />
      <StrategicOutcomePanel />
      <TranscendenceMonitor />
    </MeshThemeProvider>
    </>
  );
};

export default DashboardPage;