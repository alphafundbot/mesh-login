
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { domainData } from "@/lib/domains";
import AppLayout from "@/components/layout/AppLayout";
import RecentActivity from "@/components/dashboard/RecentActivity";
import RoleSelector from "@/components/dashboard/RoleSelector";
import { cn } from "@/lib/utils";
import IntelligenceMap from "@/components/dashboard/IntelligenceMap";
import { slugify } from "@/lib/utils";
import VisualIntegrityDashboard from "@/components/dashboard/VisualIntegrityDashboard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const getStatusColor = (status: string) => {
  if (status.includes("Optimal")) return "bg-green-500";
  if (status.includes("Warning")) return "bg-yellow-500";
  if (status.includes("Error")) return "bg-red-500";
  return "bg-gray-500";
};

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-6 p-4 md:p-6">
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
                <VisualIntegrityDashboard />
            </div>
        </div>

        <RecentActivity />
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-4">Domains</h2>
           <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-4 pb-4">
                {domainData.map((domain) => (
                  <Link key={domain.slug} href={`/domain/${domain.slug}`} className="block">
                    <Card key={domain.slug} className="w-80 min-h-[12rem] transform transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:border-accent">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle as="h3" className="text-base font-semibold flex items-center gap-2">
                          <domain.icon className="h-5 w-5 text-accent" />
                          {domain.name}
                        </CardTitle>
                         <Badge variant="outline" className="flex items-center gap-2 text-xs">
                           <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                getStatusColor(domain.status)
                              )}
                            />
                          <span>{domain.status}</span>
                        </Badge>
                      </CardHeader>
                      <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            {domain.modules.length} modules
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {domain.modules.slice(0,4).map(module => (
                                <Badge key={module} variant="secondary" className="text-xs">{module}</Badge>
                            ))}
                            {domain.modules.length > 4 && <Badge variant="outline">...</Badge>}
                          </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
      </div>
    </AppLayout>
  );
}
