import AppLayout from "@/components/layout/AppLayout";
import ValidatorClient from "./ValidatorClient";

export default function ValidatorPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Config Validator
          </h1>
        </div>
        <p className="text-muted-foreground">
          Validate system configurations to ensure integrity and stability.
        </p>
        <ValidatorClient />
      </div>
    </AppLayout>
  );
}
