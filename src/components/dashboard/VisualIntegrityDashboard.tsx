
"use client";

import HudEscalationMatrix from "./HudEscalationMatrix";
import OverrideMomentum from "./OverrideMomentum";
import RationaleForecastPanel from "./RationaleForecastPanel";
import HudForecastPanel from "./HudForecastPanel";

export default function VisualIntegrityDashboard() {

  return (
    <div className="grid grid-cols-1 gap-6 auto-rows-fr">
        <HudEscalationMatrix />
        <OverrideMomentum />
        <HudForecastPanel />
        <RationaleForecastPanel />
    </div>
  );
}
