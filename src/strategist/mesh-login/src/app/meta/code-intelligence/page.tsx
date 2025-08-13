
import AppLayout from "@/components/layout/AppLayout";
import CodeIntelligenceClient from "./CodeIntelligenceClient";

export default function CodeIntelligencePage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Code Intelligence Layer
          </h1>
        </div>
        <p className="text-muted-foreground">
          An AI-powered analysis of the mesh's own source code to identify dependencies, assess quality, and map modules to performance metrics.
        </p>
        <CodeIntelligenceClient />
      </div>
    </AppLayout>
  );
}
