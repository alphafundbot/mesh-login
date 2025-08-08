
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
                <TabsTrigger key={domain.slug} value={domain.slug}>
                  <domain.icon className="mr-2 h-4 w-4 hidden md:block" /> {domain.name.split(' ')[1]}
                </TabsTrigger>
              ))}
            </TabsList>
            {domainData.map((domain) => (
              <TabsContent key={domain.slug} value={domain.slug} className="mt-4">
                <Card>
                  <CardHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
                     <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
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
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-muted-foreground mb-2">Situational Insights</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold text-green-400">99.98%</p>
                            </CardContent>
                          </Card>
                           <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm font-medium">Overrides (24h)</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold">12</p>
                            </CardContent>
                          </Card>
                           <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm font-medium">Volatility</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold text-yellow-400">Medium</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm font-medium">Forecast Accuracy</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold">87%</p>
                            </CardContent>
                          </Card>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-muted-foreground mb-2">Modules</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {domain.modules.map((module) => (
                          <Link key={module} href={`/domain/${domain.slug}/${slugify(module)}`} passHref>
                            <div
                              className="bg-card/50 p-3 rounded-lg hover:shadow-xl hover:bg-card transition-all duration-300 h-full flex flex-col justify-center border"
                            >
                              <h3 className="font-semibold text-card-foreground">{module}</h3>
                            </div>
                          </Link>
                        ))}
                      </div>
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
