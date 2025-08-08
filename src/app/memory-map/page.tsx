
import AppLayout from "@/components/layout/AppLayout";
import ForecastMemoryMap from "@/components/dashboard/ForecastMemoryMap";
import { Suspense } from "react";

function MemoryMapContent() {
    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Forecast Memory Map</h1>
                </div>
                <p className="text-muted-foreground">
                    A visualization of the system's learned intelligence, tracking rationale accuracy, volatility, and strategist divergence over time.
                </p>
                <ForecastMemoryMap />
            </div>
        </AppLayout>
    )
}

export default function MemoryMapPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MemoryMapContent />
        </Suspense>
    )
}
