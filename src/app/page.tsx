
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { domainData } from "@/lib/domains";
import AppLayout from "@/components/layout/AppLayout";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RoleSelector from "@/components/dashboard/RoleSelector";
import { cn } from "@/lib/utils";
import IntelligenceMap from "@/components/dashboard/IntelligenceMap";
import HudRiskFeed from "@/components/dashboard/HudRiskFeed";

const getStatusColor = (status: string) => {
  if (status.includes("Optimal")) return "bg-green-500";
  if (status.includes("Warning")) return "bg-yellow-500";
  if (status.includes("Error")) return "bg-red-500";
  return "bg-gray-500";
};

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Strategist HUD
          </h1>
          <RoleSelector />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <IntelligenceMap />
            </div>
            <div className="lg:col-span-2">
                <HudRiskFeed />
            </div>
        </div>

        <RecentActivity />
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-4">Domains</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {domainData.map((domain) => (
              <Link href={`/domain/${domain.slug}`} key={domain.slug}>
                <Card
                  key={domain.name}
                  className="bg-card border-border hover:border-accent transition-colors duration-300 flex flex-col h-full"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-medium text-primary-foreground">
                        {domain.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 pt-2 text-xs">
                         <span
                            className={cn(
                              "h-2 w-2 rounded-full",
                              getStatusColor(domain.status)
                            )}
                          />
                        <span>{domain.status}</span>
                      </CardDescription>
                    </div>
                    <domain.icon className="h-6 w-6 text-accent" />
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-end">
                    <div className="flex flex-wrap gap-2 mt-4">
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
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
