"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, serverTimestamp, getDocs, limit } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { Eye, TrendingUp, Settings, Lightbulb, ArrowUp, ArrowDown, BarChart, ShieldAlert, RefreshCw } from "lucide-react";
import { forecastSuppression, type SuppressionForecastOutput } from "@/ai/flows/suppression-forecast-flow";
import { forecastRationales, type RationaleForecastOutput } from "@/ai/flows/rationale-forecast-flow";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { cn } from "@/lib/utils";
import { useClusterMomentum } from "@/hooks/use-cluster-momentum";
import { useRouter } from "next/navigation";
import { tagRationale } from "@/ai/flows/rationale-tagging-flow";
import type { ActionLog, Severity, TaggedRationale, ClusterInfo, ClusterMap } from "@/lib/types";
import { parseDetails, RISK_WEIGHTS } from "@/lib/types";


const calculateClusters = (rationales: TaggedRationale[]): ClusterMap => {
    const clusters: ClusterMap = new Map();
    rationales.forEach(item => {
        item.tags.forEach(tag => {
            if (!clusters.has(tag)) {
                clusters.set(tag, { 
                    tag: tag,
                    items: [], 
                    severities: { "Warning": 0, "Critical": 0, "Catastrophic": 0 }, 
                    domains: {}, 
                    riskScore: 0 
                });
            }
            const cluster = clusters.get(tag)!;
            cluster.items.push(item);
            if(item.severity) cluster.severities[item.severity]++;
        });
    });
    clusters.forEach(cluster => {
        cluster.riskScore = (cluster.severities.Warning * RISK_WEIGHTS.Warning) + (cluster.severities.Critical * RISK_WEIGHTS.Critical) + (cluster.severities.Catastrophic * RISK_WEIGHTS.Catastrophic);
    });
    return clusters;
};


function ClusterMomentumItem({ cluster, previousLogs }: { cluster: ClusterInfo, previousLogs: ActionLog[] }) {
    const { riskDelta } = useClusterMomentum(cluster, previousLogs);
    const router = useRouter();

    if (riskDelta === 0) return null;

    const Arrow = riskDelta > 0 ? ArrowUp : ArrowDown;
    let color = "text-muted-foreground";
    if (riskDelta > 0) color = "text-red-400";
    if (riskDelta < 0) color = "text-green-400";
    
    const handleInvestigate = () => {
        const params = new URLSearchParams({
            time: "7d",
            autostart: "true",
            cluster: cluster.tag,
        });
        router.push(`/history?${params.toString()}`);
    }

    return (
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-muted/80 cursor-pointer transition-colors duration-200" onClick={handleInvestigate}>
            <span className="capitalize font-semibold text-sm">{cluster.tag}</span>
            <Badge variant="outline" className={cn("gap-1 font-mono text-xs", color)}>
                <Arrow className="h-3 w-3" />
                {riskDelta > 0 && "+"}{riskDelta.toFixed(0)} Risk
            </Badge>
        </div>
    )
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


export default function VisualIntegrityDashboard() {
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  
  const [allLogs, setAllLogs] = useState<ActionLog[]>([]);
  const [suppressionForecast, setSuppressionForecast] = useState<SuppressionForecastOutput | null>(null);
  const [rationaleForecast, setRationaleForecast] = useState<RationaleForecastOutput | null>(null);
  const [globalClusters, setGlobalClusters] = useState<ClusterMap>(new Map());
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);

  const { currentLogs, previousPeriodLogs } = useMemo(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const current = allLogs.filter(log => now - log.timestamp.getTime() < sevenDays);
    const previous = allLogs.filter(log => {
        const logTime = log.timestamp.getTime();
        return (now - logTime >= sevenDays) && (now - logTime < 2 * sevenDays);
    });
    return { currentLogs: current, previousPeriodLogs: previous };
  }, [allLogs]);

  useEffect(() => {
    const q = query(collection(db, "hud_actions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setLoadingLogs(true);
        if (snapshot.empty) {
            setAllLogs([]);
            setLoadingLogs(false);
            return;
        }
        const logs = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
            timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date(),
        })) as ActionLog[];
        setAllLogs(logs);
        setLoadingLogs(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerateForecasts = async () => {
    setLoading(true);
    setSuppressionForecast(null);
    setRationaleForecast(null);
    setGlobalClusters(new Map());

    if (currentLogs.length === 0) {
        toast({ title: "No Data", description: "No logs found in the last 7 days to generate forecasts."});
        setLoading(false);
        return;
    }

    const logsString = currentLogs.map(log => `[${log.timestamp.toISOString()}] ${log.action} by ${log.role} '${log.strategist}': ${log.details}`).join("\n");
    
    try {
      const [suppression, taggedRationales] = await Promise.all([
         forecastSuppression({ actionLogs: logsString }),
         Promise.all(currentLogs
            .map(l => ({...l, parsed: parseDetails(l.details)}))
            .filter(l => l.parsed.isOverride && l.parsed.rationale && l.parsed.severity)
            .map(l => ({ rationale: l.parsed.rationale!, tags: [], severity: l.parsed.severity!, domains: l.parsed.domains! }))
            .map(async r => ({...r, tags: (await tagRationale({ rationale: r.rationale})).tags}))
        )
      ]);
      setSuppressionForecast(suppression);
      const clusters = calculateClusters(taggedRationales);
      setGlobalClusters(clusters);
      
      const feedbackQuery = query(collection(db, 'feedback'));
      const feedbackSnapshot = await getDocs(feedbackQuery);
      const feedbackSummary: Record<string, { up: number, down: number }> = {};
      feedbackSnapshot.forEach(doc => {
          const data = doc.data();
          const text = data.recommendationText || `Rec ID: ${data.recommendationId}`;
          if (!feedbackSummary[text]) feedbackSummary[text] = { up: 0, down: 0 };
          if (data.rating === 'up') feedbackSummary[text].up++;
          else if (data.rating === 'down') feedbackSummary[text].down++;
      });

      const clusterMomentumVectors = Array.from(clusters.entries()).map(([tag, data]) => ({ tag, riskScore: data.riskScore, riskDelta: useClusterMomentum(data, previousPeriodLogs).riskDelta, recentFrequency: data.items.length }));

      const rationaleOutput = await forecastRationales({
          clusterMomentumVectors,
          strategistFeedbackSummary: feedbackSummary
        });
      setRationaleForecast(rationaleOutput);
      
       if (rationaleOutput && rationaleOutput.forecasts.length > 0) {
          const latestForecastQuery = query(collection(db, "forecast_analysis"), orderBy("timestamp", "desc"), limit(1));
          const latestForecastSnapshot = await getDocs(latestForecastQuery);
          if (latestForecastSnapshot.empty || JSON.stringify(latestForecastSnapshot.docs[0].data().forecast) !== JSON.stringify(rationaleOutput)) {
              await addDoc(collection(db, "forecast_analysis"), {
                forecast: rationaleOutput,
                inputs: { clusterMomentumVectors, feedbackSummary },
                timestamp: serverTimestamp(),
                commentary: null,
                volatilityScore: null,
              });
          }
        }
      toast({ title: "Forecasts Generated", description: "Successfully updated integrity matrix."});
    } catch (error) {
       console.error("One or more forecasts failed:", error);
       toast({ variant: "destructive", title: "Forecast Error", description: "Failed to update all forecast panels."});
    } finally {
        setLoading(false);
    }
  };


   const escalationData = useMemo(() => {
    if (allLogs.length === 0) return {
        topDomain: "None",
        topDomainCount: 0,
        topDomainSeverity: undefined,
        riskDelta: 0,
    };

    const criticalOverrides: Record<string, { count: number, severities: Record<Severity, number> }> = {};
    
    currentLogs.forEach(log => {
        const { isOverride, severity, domains } = parseDetails(log.details);
        if (isOverride && (severity === 'Critical' || severity === 'Catastrophic')) {
            domains?.forEach(domain => {
                if (!criticalOverrides[domain]) {
                    criticalOverrides[domain] = { count: 0, severities: { "Warning": 0, "Critical": 0, "Catastrophic": 0 }};
                }
                criticalOverrides[domain].count++;
                if(severity) criticalOverrides[domain].severities[severity]++;
            });
        }
    });
    
    const topCriticalDomain = Object.entries(criticalOverrides).sort((a, b) => b[1].count - a[1].count)[0];
    
    const getTopSeverity = (severities: Record<Severity, number>): Severity => {
        if (severities.Catastrophic > 0) return 'Catastrophic';
        if (severities.Critical > 0) return 'Critical';
        return 'Warning';
    }

    const calculateRisk = (logList: ActionLog[]) => logList.reduce((acc, log) => {
        const { severity, isOverride } = parseDetails(log.details);
        if(isOverride && severity && RISK_WEIGHTS[severity]) {
            return acc + RISK_WEIGHTS[severity];
        }
        return acc;
    }, 0);

    const currentRisk = calculateRisk(currentLogs);
    const previousRisk = calculateRisk(previousPeriodLogs);

    const delta = currentRisk - previousRisk;
    
    return {
        topDomain: topCriticalDomain ? topCriticalDomain[0] : "None",
        topDomainCount: topCriticalDomain ? topCriticalDomain[1].count : 0,
        topDomainSeverity: topCriticalDomain ? getTopSeverity(topCriticalDomain[1].severities) : undefined,
        riskDelta: delta,
    };
  }, [allLogs, currentLogs, previousPeriodLogs]);
  
  const sortedMomentumClusters = useMemo(() => {
    if (globalClusters.size === 0) return [];
    return Array.from(globalClusters.values())
        .map(cluster => ({
            ...cluster,
            momentum: useClusterMomentum(cluster, previousPeriodLogs)
        }))
        .filter(c => c.momentum.riskDelta !== 0)
        .sort((a,b) => Math.abs(b.momentum.riskDelta) - Math.abs(a.momentum.riskDelta));
  }, [globalClusters, previousPeriodLogs]);

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

  const handleInvestigate = () => {
    if (!escalationData || !escalationData.topDomain || !escalationData.topDomainSeverity) return;
    const params = new URLSearchParams({
        time: "7d",
        domain: escalationData.topDomain,
        severity: escalationData.topDomainSeverity,
        autostart: "true"
    });
    router.push(`/history?${params.toString()}`);
  }

  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  return (
    <Card className="h-full transition-shadow duration-300 hover:shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-6 w-6 text-accent" />
                    Visual Integrity Matrix
                </CardTitle>
                <CardDescription>
                    AI-surfaced view of system stress, risk trends, and predictive forecasts.
                </CardDescription>
            </div>
            <Button onClick={handleGenerateForecasts} disabled={loading || loadingLogs} size="sm">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Generate Forecasts
            </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {(loading || loadingLogs) ? renderLoadingSkeleton() : (
          <>
            {/* Escalation Matrix */}
            <div className={cn("space-y-3 rounded-lg p-3 transition-colors duration-300", escalationData.riskDelta > 10 ? "bg-red-900/30 border border-destructive/50" : "bg-muted/20")}>
                <div className="flex justify-between items-center">
                    <p className="font-semibold flex items-center gap-2">
                        <TrendingUp className={cn("h-4 w-4", escalationData.riskDelta > 0 ? "text-destructive" : escalationData.riskDelta < 0 ? "text-green-400" : "text-muted-foreground")} />
                        7-Day Risk Delta
                    </p>
                    <span className={cn("font-bold font-mono", escalationData.riskDelta > 0 ? "text-destructive" : escalationData.riskDelta < 0 ? "text-green-400" : "text-muted-foreground")}>
                       {escalationData.riskDelta >= 0 && "+"}{escalationData.riskDelta.toFixed(0)}
                    </span>
                </div>
                {escalationData.topDomainCount > 0 && (
                    <div className="flex justify-between items-center">
                         <p className="font-semibold flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-orange-400" />
                            Top Stress Zone
                        </p>
                        <Button onClick={handleInvestigate} variant="link" size="sm" className="h-auto p-0 text-orange-400">
                           {escalationData.topDomain}
                        </Button>
                    </div>
                )}
            </div>

            {/* Override Momentum */}
            <div>
              <h4 className="font-semibold text-sm mb-2 px-1 flex items-center gap-2"><TrendingUp className="h-4 w-4" />Override Momentum</h4>
              {sortedMomentumClusters.length > 0 ? (
                <div className="space-y-2">
                  {sortedMomentumClusters.slice(0, 3).map(cluster => (
                      <ClusterMomentumItem key={cluster.tag} cluster={cluster} previousLogs={previousPeriodLogs} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">No significant momentum detected.</p>
              )}
            </div>

            {/* Forecasts */}
            <div className="border-t pt-4 space-y-4">
               <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm px-1 flex items-center gap-2"><Eye className="h-4 w-4" />Suppression Forecast</h4>
                 <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                        <div className="space-y-4">
                            <Label htmlFor="forecast-threshold" className="text-sm">Forecast Certainty</Label>
                            <div className="flex items-center gap-2">
                                <Slider id="forecast-threshold" min={0} max={1} step={0.01} value={[confidenceThreshold]} onValueChange={(v) => setConfidenceThreshold(v[0])} />
                                <span className="text-sm font-mono w-10 text-center">{confidenceThreshold.toFixed(2)}</span>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
              </div>
              
              {suppressionForecast && suppressionForecast.forecasts.filter(f => f.predictedOverrideRate >= confidenceThreshold).length > 0 ? (
                 <div className="space-y-2">
                    {suppressionForecast.forecasts.sort((a,b) => b.predictedOverrideRate - a.predictedOverrideRate).slice(0,2).map(fc => (
                       <div key={fc.domain} className="p-2 rounded-md bg-muted/30">
                           <div className="flex justify-between items-center">
                               <p className="font-semibold text-xs text-foreground">{fc.domain}</p>
                               <Badge variant="outline" className={cn("gap-1.5 text-xs", getRiskColor(fc.predictedOverrideRate))}>
                                   <TrendingUp className="h-3 w-3" />
                                   {getRiskLabel(fc.predictedOverrideRate)} Risk
                               </Badge>
                           </div>
                           <p className="text-xs text-muted-foreground mt-1 truncate">{fc.justification}</p>
                       </div>
                    ))}
                 </div>
              ): (
                <p className="text-xs text-muted-foreground text-center py-2">No suppression risks meet certainty threshold.</p>
              )}
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-semibold text-sm px-1 flex items-center gap-2"><Lightbulb className="h-4 w-4" />Rationale Forecast</h4>
              {rationaleForecast && rationaleForecast.forecasts.length > 0 ? (
                 <div className="space-y-2">
                    {rationaleForecast.forecasts.sort((a,b) => b.escalationProbability - a.escalationProbability).slice(0,2).map(fc => (
                       <div key={fc.rationaleTag} className="p-2 rounded-md bg-muted/30">
                           <div className="flex justify-between items-center">
                               <p className="font-semibold text-xs text-foreground capitalize">{fc.rationaleTag}</p>
                               <div className="flex gap-1.5">
                                   <Badge variant="outline" className={cn("gap-1 text-xs", fc.escalationProbability > 0.5 && "text-destructive")}>
                                       <ArrowUp className="h-3 w-3" />
                                       {(fc.escalationProbability * 100).toFixed(0)}%
                                   </Badge>
                                   <Badge variant="outline" className={cn("gap-1 text-xs", fc.suppressionLikelihood > 0.5 && "text-green-400")}>
                                       <ArrowDown className="h-3 w-3" />
                                       {(fc.suppressionLikelihood * 100).toFixed(0)}%
                                   </Badge>
                               </div>
                           </div>
                           <p className="text-xs text-muted-foreground mt-1 truncate">{fc.justification}</p>
                       </div>
                    ))}
                 </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">No rationale trends detected.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
