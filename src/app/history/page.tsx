import AppLayout from "@/components/layout/AppLayout";
import HistoryClient from "./HistoryClient";

export default function HistoryPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Signal Memory</h1>
        </div>
        <p className="text-muted-foreground">
          A persistent, historical log of all strategist actions recorded in the mesh.
        </p>
        <HistoryClient />
      </div>
    </AppLayout>
  );
}
