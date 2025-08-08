
import AppLayout from "@/components/layout/AppLayout";
import SnapshotClient from "./SnapshotClient";

export default function TelecomAnomalyPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Snapshot: Telecom Latency Anomaly
          </h1>
        </div>
        <p className="text-muted-foreground">
          A persistent, historical log of the 2025-08-08 Lidar Feed latency anomaly and its resolution.
        </p>
        <SnapshotClient />
      </div>
    </AppLayout>
  );
}
