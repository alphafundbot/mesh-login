import AppLayout from "@/components/layout/AppLayout";
import SnapshotDiffClient from "./SnapshotDiffClient";

export default function SnapshotDiffPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Snapshot Diff
          </h1>
        </div>
        <p className="text-muted-foreground">
          Select two historical snapshots to compare their signal history and AI synthesis.
        </p>
        <SnapshotDiffClient />
      </div>
    </AppLayout>
  );
}
