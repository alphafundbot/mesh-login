
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import HudForecastPanel from './HudForecastPanel';

export default function ThreatForecast() {
    return (
        <div className="space-y-4">
            <HudForecastPanel />
            <Card>
                <CardHeader>
                    <CardTitle>Additional Intelligence</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center">Further forecast data will be surfaced here.</p>
                </CardContent>
           </Card>
        </div>
    )
}
