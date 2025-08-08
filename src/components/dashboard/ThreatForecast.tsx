
"use client";

import React from 'react';
import HudForecastPanel from './HudForecastPanel';
import RationaleForecastPanel from './RationaleForecastPanel';

export default function ThreatForecast() {
    return (
        <div className="space-y-4">
            <HudForecastPanel />
            <RationaleForecastPanel />
        </div>
    )
}
