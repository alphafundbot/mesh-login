tsx
// src/pages/dashboard/DashboardPage.tsx
import React from 'react';
import MeshStatusCard from '../../components/ui/MeshStatusCard';
import ProvisioningHeatmap from '../../components/ui/ProvisioningHeatmap';
import AuditTrailPanel from '../../components/ui/AuditTrailPanel';
import SignalFlowGraph from '../../components/ui/SignalFlowGraph';
import PerformanceMetricsPanel from '../../components/ui/PerformanceMetricsPanel';
import MeshControlBar from '../../components/ui/MeshControlBar';

const DashboardPage: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h1>Mesh Dashboard</h1>
      <MeshControlBar />
      <div className="dashboard-grid">
        <MeshStatusCard />
        <PerformanceMetricsPanel />
        <ProvisioningHeatmap />
        <AuditTrailPanel />
        <SignalFlowGraph />
      </div>
    </div>
  );
};

export default DashboardPage;