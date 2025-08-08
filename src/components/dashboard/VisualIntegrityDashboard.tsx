
"use client";

import OverrideMomentum from "./OverrideMomentum";
import RationaleForecastPanel from "./RationaleForecastPanel";
import HudEscalationMatrix from "./HudEscalationMatrix";

export default function VisualIntegrityDashboard() {
  return (
    <div className="grid grid-cols-1 gap-6 auto-rows-max">
      <HudEscalationMatrix />
      <OverrideMomentum />
      <RationaleForecastPanel />
    </div>
  );
}

    