import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { domainData } from "@/lib/domains";
import AppLayout from "@/components/layout/AppLayout";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Domain Dashboard
          </h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {domainData.map((domain) => (
            <Card
              key={domain.name}
              className="bg-card border-border hover:border-accent transition-colors duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-primary-foreground">
                  {domain.name}
                </CardTitle>
                <domain.icon className="h-6 w-6 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {domain.modules.map((module) => (
                    <Badge
                      key={module}
                      variant="secondary"
                      className="font-normal"
                    >
                      {module}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
