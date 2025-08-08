import AppLayout from "@/components/layout/AppLayout";
import ForecastArchiveClient from "./ForecastArchiveClient";

export default function ForecastArchivePage() {
    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Forecast Archive</h1>
                </div>
                <p className="text-muted-foreground">
                    A historical log of all AI-generated rationale forecasts.
                </p>
                <ForecastArchiveClient />
            </div>
        </AppLayout>
    )
}
