
import AppLayout from "@/components/layout/AppLayout";
import ArchiveClient from "./ArchiveClient";
import { Suspense } from "react";

function ArchiveContent() {
    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Analysis Archive</h1>
                </div>
                <p className="text-muted-foreground">
                    A historical log of all AI-generated analyses from simulations and snapshot diffs.
                </p>
                <ArchiveClient />
            </div>
        </AppLayout>
    )
}

export default function AnalysisArchivePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ArchiveContent />
        </Suspense>
    )
}

    