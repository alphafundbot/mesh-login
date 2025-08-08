
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
import { slugify } from "@/lib/utils";
import VisualIntegrityDashboard from "@/components/dashboard/VisualIntegrityDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
                <VisualIntegrityDashboard />
            </div>
        </div>

        <RecentActivity />
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-4">Domains</h2>
          <Tabs defaultValue={domainData[0].slug} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
              {domainData.map((domain) => (
                <TabsTrigger key={domain.slug} value={domain.slug} className="text-xs">
                  <domain.icon className="mr-2 h-4 w-4 hidden md:block" /> {domain.name.split(' ')[1]}
                </TabsTrigger>
              ))}
            </TabsList>
            {domainData.map((domain) => (
              <TabsContent key={domain.slug} value={domain.slug}>
                <Card className="mt-4">
                  <CardHeader>
                     <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <domain.icon className="h-6 w-6 text-accent" />
                          {domain.name}
                        </CardTitle>
                        <Badge variant="outline" className="flex items-center gap-2">
                           <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                getStatusColor(domain.status)
                              )}
                            />
                          <span>{domain.status}</span>
                        </Badge>
                     </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {domain.modules.map((module) => (
                        <Link key={module} href={`/domain/${domain.slug}/${slugify(module)}`} passHref>
                          <Badge
                            variant="secondary"
                            className="font-normal hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer text-sm py-1"
                          >
                            {module}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
