import FeedbackDashboard from '@/components/dashboard/FeedbackDashboard';
import ForecastMemoryMap from '@/components/dashboard/ForecastMemoryMap';
import VisualIntegrityDashboard from '@/components/dashboard/VisualIntegrityDashboard';
import PerformanceMetricsPanel from '@/components/dashboard/PerformanceMetricsPanel';
import StrategicOutcomePanel from '@/components/dashboard/StrategicOutcomePanel';

import SignalFlowGraph from '@/components/ui/SignalFlowGraph';
import StatusBadge from '@/components/ui/StatusBadge';
import MeshStatusCard from '@/components/ui/MeshStatusCard';
import ProvisioningHeatmap from '@/components/ui/ProvisioningHeatmap';

// If you want to use audit overlays or data hydration utilities, uncomment/import as needed:
// import MeshHydrationAudit from '@/components/dashboard/MeshHydrationAudit';
// import { getFinancialSnapshot } from '@/lib/financial-data';

export default function StrategistDashboard() {
  return (
    <div className="strategist-dashboard p-8 space-y-8">
      <h2 className="text-2xl font-bold mb-4">🧠 Strategist Cockpit</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MeshStatusCard />
        <StatusBadge status="online" />
        <ProvisioningHeatmap />
        <SignalFlowGraph />
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <ForecastMemoryMap />
        <PerformanceMetricsPanel />
        <VisualIntegrityDashboard />
        <StrategicOutcomePanel />
        <FeedbackDashboard />
      </div>
      {/* Uncomment below to show the mesh hydration audit overlay */}
      {/* <MeshHydrationAudit /> */}
    </div>
  );
}
