import React from "react";
import MeshThemeProvider from "../components/theme/MeshThemeProvider";
import MeshDashboardGrid from "../components/layout/MeshDashboardGrid";
import {
  MeshStatusCard,
  ProvisioningHeatmap,
  AuditTrailPanel,
  SignalFlowGraph,
  PerformanceMetricsPanel,
  MeshControlBar
} from "../components/ui";

export default function DashboardPage() {
  return (
    <MeshThemeProvider>
      <div className="dashboard-container">
        <h1>Mesh Dashboard</h1>
        <MeshStatusCard />
        <section className="dashboard-grid">
          <MeshDashboardGrid />
          <ProvisioningHeatmap />
          <AuditTrailPanel />
          <SignalFlowGraph />
          <PerformanceMetricsPanel />
          <MeshControlBar />
        </section>
      </div>
    </MeshThemeProvider>
  );
}