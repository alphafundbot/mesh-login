"use client";

import OverrideMomentum from "./OverrideMomentum";
import HudEscalationMatrix from "./HudEscalationMatrix";
import RationaleForecastPanel from "./RationaleForecastPanel";

export default function VisualIntegrityDashboard() {
  return (
    <div className="grid grid-cols-1 gap-6 auto-rows-max">
      <HudEscalationMatrix />
      <OverrideMomentum />
      <RationaleForecastPanel />
    </div>
  );
}
