"use client";

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
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { domainFinancials } from "@/lib/financial-data";
import { TrendingUp, Coins, Shield, BarChartHorizontal } from 'lucide-react';
import RevenueMetrics from "@/components/dashboard/RevenueMetrics";
import RevenueChart from "@/components/dashboard/RevenueChart";
import CurrencySignalModule from "@/components/dashboard/CurrencySignalModule";
import PortAudit from "@/components/dashboard/PortAudit";
import { Suspense } from "react";
import ClientOnly from "@/components/layout/ClientOnly";


const getStatusColor = (status: string) => {
  if (status.includes("Optimal")) return "bg-green-500";
  if (status.includes("Warning")) return "bg-yellow-500";
  if (status.includes("Error")) return "bg-red-500";
  return "bg-gray-500";
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(value);
};

function DashboardContent() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-primary-foreground">
            Strategist HUD
          </h1>
          <RoleSelector />
        </div>

        <div className="space-y-4">
          <RevenueMetrics />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <RevenueChart />
            </div>
             <div className="lg:col-span-3">
              <CurrencySignalModule />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3">
                <IntelligenceMap />
            </div>
            <div className="lg:col-span-2">
                <VisualIntegrityDashboard />
            </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary-foreground mb-4">Domains</h2>
           <Carousel
              opts={{
                align: "start",
              }}
              className="w-full"
            >
              <CarouselContent>
                {domainData.map((domain) => {
                  const financials = domainFinancials[domain.slug];
                  return (
                    <CarouselItem key={domain.slug} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                       <div className="p-1">
                          <Link key={domain.slug} href={`/domain/${domain.slug}`} className="block">
                            <Card key={domain.slug} className="min-h-[16rem] transform transition-transform duration-300 hover:scale-105 hover:shadow-lg hover:border-accent flex flex-col justify-between">
                              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex flex-col">
                                  <CardTitle as="h3" className="text-base font-semibold flex items-center gap-2">
                                    <domain.icon className="h-5 w-5 text-accent" />
                                    {domain.name}
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground pt-1">
                                    {domain.modules.length} modules
                                  </p>
                                </div>
                                <Badge variant="outline" className="flex items-center gap-2 text-xs">
                                  <span
                                      className={cn(
                                        "h-2 w-2 rounded-full",
                                        getStatusColor(domain.status)
                                      )}
                                    />
                                  <span>{domain.status.split(":")[0]}</span>
                                </Badge>
                              </CardHeader>
                              <CardContent>
                                  <div className="flex flex-wrap gap-1 mb-4">
                                    {domain.modules.slice(0,3).map(module => (
                                        <Badge key={module} variant="secondary" className="text-xs">{module}</Badge>
                                    ))}
                                    {domain.modules.length > 3 && <Badge variant="outline" className="text-xs">+{domain.modules.length-3} more</Badge>}
                                  </div>
                                  {financials && (
                                    <div className="text-xs text-muted-foreground space-y-1.5 pt-2 border-t border-border/50">
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><Coins className="h-3 w-3 text-amber-400" /> Revenue</span>
                                        <span className="font-mono text-foreground">{formatCurrency(financials.revenue)}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><BarChartHorizontal className="h-3 w-3 text-red-400" /> Cost</span>
                                        <span className="font-mono text-foreground">{formatCurrency(financials.cost)}</span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-green-400" /> ROI</span>
                                        <span className="font-mono text-foreground">{financials.roi.toFixed(1)}x</span>
                                      </div>
                                    </div>
                                  )}
                              </CardContent>
                            </Card>
                          </Link>
                       </div>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
              <CarouselPrevious className="absolute left-[-20px] top-1/2 -translate-y-1/2" />
              <CarouselNext className="absolute right-[-20px] top-1/2 -translate-y-1/2" />
            </Carousel>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <RecentActivity />
            <PortAudit />
        </div>
      </div>
    </AppLayout>
  )
}


export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientOnly>
        <DashboardContent />
      </ClientOnly>
    </Suspense>
  )
}