
import AppLayout from "@/components/layout/AppLayout";
import FinancialControlsClient from "./FinancialControlsClient";

export default function FinancialsPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Financial Controls
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage and monitor the mesh's financial operations and non-custodial vault revenue.
        </p>
        <FinancialControlsClient />
      </div>
    </AppLayout>
  );
}
