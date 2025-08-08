
import AppLayout from "@/components/layout/AppLayout";
import UsageClient from "./UsageClient";

export default function UsagePage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Model Usage Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground">
          Track quota usage, latency, and operational velocity per AI model.
        </p>
        <UsageClient />
      </div>
    </AppLayout>
  );
}
