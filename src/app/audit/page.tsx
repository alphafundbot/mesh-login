import AppLayout from "@/components/layout/AppLayout";
import AuditClient from "./AuditClient";

export default function AuditPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail AI</h1>
        </div>
        <p className="text-muted-foreground">
          Submit audit logs to the AI for summarization and unusual activity analysis.
        </p>
        <AuditClient />
      </div>
    </AppLayout>
  );
}
