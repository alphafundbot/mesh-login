
import AppLayout from "@/components/layout/AppLayout";
import MetaAuditClient from "./MetaAuditClient";

export default function MetaAuditPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Meta-Audit Protocol
          </h1>
        </div>
        <p className="text-muted-foreground">
            A recursive, "dogfooding" protocol where the mesh uses its own Code Intelligence Layer to analyze all of its internal AI flows.
        </p>
        <MetaAuditClient />
      </div>
    </AppLayout>
  );
}
