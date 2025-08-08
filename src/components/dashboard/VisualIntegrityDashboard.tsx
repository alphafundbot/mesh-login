
"use client";

import HudEscalationMatrix from "./HudEscalationMatrix";
import HudForecastPanel from "./HudForecastPanel";
import VulnerabilityMatrix from "./VulnerabilityMatrix";
import OverrideMomentum from "./OverrideMomentum";
import ThreatForecast from "./ThreatForecast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, BarChart, Eye, TrendingUp, AlertTriangle } from "lucide-react";


export default function VisualIntegrityDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-accent" />
            Visual Integrity Matrix
        </CardTitle>
        <CardDescription>
            Centralized audit of all strategist-grade visual modules and override-linked intelligence.
        </CardDescription>
      </CardHeader>
      <CardContent>
         <Tabs defaultValue="vulnerability" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="vulnerability"><AlertTriangle className="h-4 w-4 mr-1" />Matrix</TabsTrigger>
                <TabsTrigger value="momentum"><TrendingUp className="h-4 w-4 mr-1" />Momentum</TabsTrigger>
                <TabsTrigger value="forecast"><Eye className="h-4 w-4 mr-1" />Forecast</TabsTrigger>
            </TabsList>
            <TabsContent value="vulnerability" className="mt-4 space-y-4">
                <VulnerabilityMatrix />
            </TabsContent>
            <TabsContent value="momentum" className="mt-4 space-y-4">
               <OverrideMomentum />
            </TabsContent>
             <TabsContent value="forecast" className="mt-4 space-y-4">
                <ThreatForecast />
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
