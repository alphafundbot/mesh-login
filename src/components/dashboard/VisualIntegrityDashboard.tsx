"use client";

import OverrideMomentum from "./OverrideMomentum";
import ThreatForecast from "./ThreatForecast";
import VulnerabilityMatrix from "./VulnerabilityMatrix";

export default function VisualIntegrityDashboard() {
  return (
    <div className="space-y-4">
      <VulnerabilityMatrix />
      <OverrideMomentum />
      <ThreatForecast />
    </div>
  );
}
