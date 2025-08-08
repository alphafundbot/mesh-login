
import AppLayout from "@/components/layout/AppLayout";
import AdminClient from "./AdminClient";
import { Suspense } from "react";

function AdminContent() {
    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
                </div>
                <p className="text-muted-foreground">
                    Perform bulk automation, data hydration, and mesh integrity checks.
                </p>
                <AdminClient />
            </div>
        </AppLayout>
    )
}

export default function AdminPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdminContent />
        </Suspense>
    )
}
