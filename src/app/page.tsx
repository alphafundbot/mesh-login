
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServerIcon } from "lucide-react";

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
          <Tabs defaultValue={domainData[0].slug} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-9">
              {domainData.map((domain) => (
                <TabsTrigger key={domain.slug} value={domain.slug}>
                  <domain.icon className="mr-2 h-4 w-4 hidden md:block" /> {domain.name.split(' ')[1] || domain.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {domainData.map((domain) => (
              <TabsContent key={domain.slug} value={domain.slug} className="mt-4">
                <Card className="overflow-hidden">
                   <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm">
                        <div className="flex items-center justify-between p-4 border-b">
                            <CardTitle as="h3" className="flex items-center gap-3">
                              <domain.icon className="h-6 w-6 text-accent" />
                              {domain.name}
                            </CardTitle>
                            <Badge variant="outline" className="flex items-center gap-2">
                               <span
                                  className={cn(
                                    "h-2 w-2 rounded-full animate-pulse",
                                    getStatusColor(domain.status)
                                  )}
                                />
                              <span>{domain.status}</span>
                            </Badge>
                        </div>
                   </div>
                  <CardContent className="space-y-6 p-4 md:p-6">
                    <div>
                      <h3 className="font-semibold text-muted-foreground mb-2">Situational Insights</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                <CardTitle as="h4" className="text-sm font-medium">Uptime</CardTitle>
                                <ServerIcon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold text-green-400">99.98%</p>
                            </CardContent>
                          </Card>
                           <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                <CardTitle as="h4" className="text-sm font-medium">Overrides (24h)</CardTitle>
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="m13 2-3 14 9-2-5-12 5 12Z"/></svg>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold">12</p>
                            </CardContent>
                          </Card>
                           <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                <CardTitle as="h4" className="text-sm font-medium">Volatility</CardTitle>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold text-yellow-400">Medium</p>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                                <CardTitle as="h4" className="text-sm font-medium">Forecast Accuracy</CardTitle>
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Z"/><path d="m16 8-4 4-4-4"/><path d="m16 14-4-4-4 4"/></svg>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-2xl font-bold">87%</p>
                            </CardContent>
                          </Card>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-muted-foreground mb-2">Modules</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {domain.modules.map((module) => (
                          <Link key={module} href={`/domain/${domain.slug}/${slugify(module)}`} passHref>
                            <div
                              className="bg-card/50 p-3 rounded-lg hover:shadow-xl hover:bg-card transition-all duration-300 h-full flex flex-col justify-center border transform hover:scale-105"
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
