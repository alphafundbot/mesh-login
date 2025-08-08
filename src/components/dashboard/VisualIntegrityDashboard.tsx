
"use client";

import OverrideMomentum from "./OverrideMomentum";
import HudEscalationMatrix from "./HudEscalationMatrix";
import ThreatForecast from "./ThreatForecast";

export default function VisualIntegrityDashboard() {
  return (
    <div className="grid grid-cols-1 gap-6 auto-rows-max">
      <HudEscalationMatrix />
      <OverrideMomentum />
      <ThreatForecast />
    </div>
  );
}
