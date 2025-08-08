
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
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
