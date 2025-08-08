"use client";

import OverrideMomentum from "./OverrideMomentum";
import ThreatForecast from "./ThreatForecast";
import VulnerabilityMatrix from "./VulnerabilityMatrix";

export default function VisualIntegrityDashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <VulnerabilityMatrix />
      <OverrideMomentum />
      <ThreatForecast />
    </div>
  );
}
