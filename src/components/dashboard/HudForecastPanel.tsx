
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { Eye, TrendingUp, Settings } from "lucide-react";
import { forecastSuppression, type SuppressionForecastOutput } from "@/ai/flows/suppression-forecast-flow";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { z } from 'zod';
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";

const ForecastSchema = z.object({
    domain: z.string().describe('The domain being analyzed.'),
    predictedOverrideRate: z.number().min(0).max(1).describe('The forecasted rate of manual overrides as a score from 0.0 (low) to 1.0 (high) for the next operational period.'),
    justification: z.string().describe('The reasoning for the forecast, based on historical data trends, override density, and risk deltas.'),
});
export type Forecast = z.infer<typeof ForecastSchema>;


interface ActionLog {
  id: string;
  details: string;
  action: string;
  role: string;
  strategist: string;
  timestamp: Date;
}

const getRiskColor = (rate: number) => {
    if (rate > 0.75) return "text-red-400";
    if (rate > 0.5) return "text-orange-400";
    if (rate > 0.25) return "text-yellow-400";
    return "text-muted-foreground";
}

const getRiskLabel = (rate: number) => {
    if (rate > 0.9) return "Critical";
    if (rate > 0.65) return "High";
    if (rate > 0.35) return "Medium";
    return "Low";
}

export default function HudForecastPanel() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<SuppressionForecastOutput | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem("forecastConfidenceThreshold");
    if (saved !== null) {
      setConfidenceThreshold(parseFloat(saved));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("forecastConfidenceThreshold", String(confidenceThreshold));
    }
  }, [confidenceThreshold]);

  useEffect(() => {
    const q = query(collection(db, "hud_actions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setLoading(false);
        return;
      }
      
      const logs = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          action: data.action,
          role: data.role,
          strategist: data.strategist,
          details: data.details,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
        };
      });
      
      const logsString = logs
        .map(log => `[${log.timestamp.toISOString()}] ${log.action} by ${log.role} '${log.strategist}': ${log.details}`)
        .join("\n");
      
      try {
        const output = await forecastSuppression({ actionLogs: logsString });
        setResult(output);
      } catch (error) {
        console.error("AI forecast failed:", error);
        toast({
          variant: "destructive",
          title: "Forecast Failed",
          description: "Could not retrieve AI suppression forecast.",
        });
      } finally {
        setLoading(false);
      }

    }, (error) => {
      console.error("Error fetching HUD actions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/6" />
          </div>
        </div>
      );
    }
    
    if (!result || result.forecasts.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No significant suppression patterns detected. Automation nominal.</p>;
    }
    
    const sortedForecasts = (result.forecasts || [])
        .filter(f => f.predictedOverrideRate >= confidenceThreshold)
        .sort((a,b) => b.predictedOverrideRate - a.predictedOverrideRate);

    if (sortedForecasts.length === 0) {
        return <p className="text-muted-foreground text-center py-4">No suppression forecasts meet the current certainty threshold.</p>;
    }


    return (
        <div className="space-y-3">
            {sortedForecasts.slice(0, 3).map((forecast) => (
                <div key={forecast.domain} className={cn("p-3 rounded-md bg-muted/30 transition-shadow duration-200 hover:shadow-md")}>
                    <div className="flex justify-between items-start">
                        <p className="font-semibold text-foreground">{forecast.domain}</p>
                         <Badge variant="outline" className={cn("gap-1.5", getRiskColor(forecast.predictedOverrideRate))}>
                             <TrendingUp className="h-3 w-3" />
                             {getRiskLabel(forecast.predictedOverrideRate)} Risk
                         </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{forecast.justification}</p>
                </div>
            ))}
        </div>
    );
  }

  return (
    <Card className="h-full transition-shadow duration-300 hover:shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Eye className="h-6 w-6 text-accent" />
                <CardTitle>Suppression Forecast</CardTitle>
            </div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Settings className="h-4 w-4" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                    <div className="space-y-4">
                        <Label htmlFor="forecast-threshold" className="text-sm">Certainty Threshold</Label>
                        <div className="flex items-center gap-2">
                            <Slider
                                id="forecast-threshold"
                                min={0}
                                max={1}
                                step={0.01}
                                value={[confidenceThreshold]}
                                onValueChange={(value) => setConfidenceThreshold(value[0])}
                                className="flex-grow"
                            />
                            <span className="text-sm font-mono w-10 text-center">{confidenceThreshold.toFixed(2)}</span>
                        </div>
                         <p className="text-xs text-muted-foreground">Forecasts below this certainty will not be shown.</p>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
        <CardDescription>
          AI-predicted zones of high strategist-automation friction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
