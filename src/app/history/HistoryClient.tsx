
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, serverTimestamp } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyzeSignalHistory, type AnalyzeSignalHistoryOutput, type Recommendation } from "@/ai/flows/signal-intelligence-flow";
import { tagRationale } from "@/ai/flows/rationale-tagging-flow";
import { Bot, BrainCircuit, Lightbulb, MessageSquareQuote, AlertTriangle, Tags, ShieldAlert, ShieldX, Globe, AlertCircle, BarChart, ArrowUp, ArrowDown, ThumbsUp, ThumbsDown, Sparkles, HelpCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import FeedbackDashboard from "@/components/dashboard/FeedbackDashboard";


interface ActionLog {
  id: string;
  action: string;
  role: string;
  strategist: string;
  details: string;
  timestamp: Date;
}

type Severity = "Warning" | "Critical" | "Catastrophic";

interface ParsedDetails {
    isOverride: boolean;
    rationale: string;
    action: string;
    severity?: Severity;
    domains?: string[];
}

const parseDetails = (details: string): ParsedDetails => {
    const isOverride = details.includes("Override: true");
    const rationaleMatch = details.match(/Rationale: "([^"]*)"/);
    const rationale = rationaleMatch ? rationaleMatch[1] : details;

    const actionMatch = details.match(/Action: ([A-Za-z_]+)/);
    const action = actionMatch ? actionMatch[1].replace(/_/g, " ") : "";

    const severityMatch = details.match(/Severity: (Warning|Critical|Catastrophic)/);
    const severity = severityMatch ? (severityMatch[1] as Severity) : undefined;
    
    const domainsMatch = details.match(/involving (.*?)\. Action:/);
    const domains = domainsMatch ? domainsMatch[1].split(', ') : undefined;

    return { isOverride, rationale, action, severity, domains };
}

const getHeatmapColor = (count: number, max: number) => {
    if (count === 0) return "bg-transparent";
    const intensity = Math.min(1, count / (max || 1));
    if (intensity > 0.8) return "bg-red-500/50";
    if (intensity > 0.5) return "bg-orange-500/50";
    if (intensity > 0.2) return "bg-yellow-500/50";
    return "bg-yellow-500/20";
};

type TaggedRationale = {
    rationale: string;
    tags: string[];
    severity: Severity;
    domains: string[];
}

type RationaleDialogContent = {
    domain: string;
    severity: Severity;
    rationales: TaggedRationale[];
} | null;

const RISK_WEIGHTS: Record<Severity, number> = {
    "Warning": 1,
    "Critical": 3,
    "Catastrophic": 5
};

type DomainMetrics = { 
    count: number; 
    severities: Record<Severity, number>;
};

type ClusterInfo = {
    items: TaggedRationale[];
    severities: Record<Severity, number>;
    domains: Record<string, DomainMetrics>;
    riskScore: number;
};

type ClusterMap = Map<string, ClusterInfo>;


const calculateClusters = (rationales: TaggedRationale[]): ClusterMap => {
    const clusters: ClusterMap = new Map();

    rationales.forEach(item => {
        item.tags.forEach(tag => {
            if (!clusters.has(tag)) {
                clusters.set(tag, { 
                    items: [], 
                    severities: { "Warning": 0, "Critical": 0, "Catastrophic": 0 },
                    domains: {},
                    riskScore: 0
                });
            }
            const cluster = clusters.get(tag)!;
            cluster.items.push(item);
            cluster.severities[item.severity]++;
            item.domains.forEach(domain => {
                if (!cluster.domains[domain]) {
                    cluster.domains[domain] = { count: 0, severities: { "Warning": 0, "Critical": 0, "Catastrophic": 0 } };
                }
                cluster.domains[domain].count++;
                cluster.domains[domain].severities[item.severity]++;
            });
        })
    });

    clusters.forEach(cluster => {
        let score = 0;
        score += cluster.severities.Warning * RISK_WEIGHTS.Warning;
        score += cluster.severities.Critical * RISK_WEIGHTS.Critical;
        score += cluster.severities.Catastrophic * RISK_WEIGHTS.Catastrophic;
        cluster.riskScore = score;
    });

    return clusters;
};

const DELTA_THRESHOLD = 10;

function ClusterDelta({ currentScore, previousScore }: { currentScore: number; previousScore: number }) {
    const delta = currentScore - previousScore;

    if (previousScore === 0 || Math.abs(delta) < 1) return null;

    const Arrow = delta > 0 ? ArrowUp : ArrowDown;
    const isLargeDelta = Math.abs(delta) > DELTA_THRESHOLD;
    const color = delta > 0 ? "text-red-400" : "text-green-400";

    return (
        <Badge variant="outline" className={cn("gap-1 font-mono", color, isLargeDelta && "border-red-400/50 font-bold")}>
            <Arrow className="h-3 w-3" />
            {delta > 0 && "+"}{delta}
        </Badge>
    );
}

function OverrideHeatmap({ logs, previousLogs }: { logs: ActionLog[], previousLogs: ActionLog[] }) {
    const [rationaleDialog, setRationaleDialog] = useState<RationaleDialogContent>(null);
    const [loadingRationales, setLoadingRationales] = useState(false);
    const [taggedRationales, setTaggedRationales] = useState<TaggedRationale[]>([]);
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const handleCellClick = useCallback(async (domain: string, severity: Severity) => {
        setLoadingRationales(true);
        setRationaleDialog({ domain, severity, rationales: [] });
        try {
            const relevantLogs = logs.filter(log => {
                const d = parseDetails(log.details);
                return d.isOverride && d.severity === severity && d.domains?.includes(domain)
            });

            if (relevantLogs.length === 0) {
                setRationaleDialog(null);
                return;
            }
            
            const processedRationales = await Promise.all(relevantLogs.map(async (log) => {
                const details = parseDetails(log.details);
                const { tags } = await tagRationale({ rationale: details.rationale });
                return { rationale: details.rationale, tags, severity: details.severity!, domains: details.domains || [] };
            }));
            
            setTaggedRationales(processedRationales);
            setRationaleDialog({ domain, severity, rationales: processedRationales });


        } catch (error) {
            console.error("Failed to tag rationales:", error);
            toast({
                variant: "destructive",
                title: "Tagging Failed",
                description: "Could not get AI tags for rationales. Please try again."
            })
            setRationaleDialog(null);
        } finally {
            setLoadingRationales(false);
        }
    }, [logs, toast]);
    
    useEffect(() => {
        const autoStart = searchParams.get('autostart');
        const domain = searchParams.get('domain');
        const severity = searchParams.get('severity') as Severity;

        if (autoStart === 'true' && domain && severity && logs.length > 0) {
            handleCellClick(domain, severity);
        }
    }, [searchParams, logs, handleCellClick]);

    const heatmapData = useMemo(() => {
        const data: Record<string, Record<Severity, number>> = {};
        let maxOverrides = 0;

        logs.forEach(log => {
            const { isOverride, domains, severity } = parseDetails(log.details);
            if (isOverride && domains && severity) {
                domains.forEach(domain => {
                    if (!data[domain]) {
                        data[domain] = { "Warning": 0, "Critical": 0, "Catastrophic": 0 };
                    }
                    data[domain][severity]++;
                    if (data[domain][severity] > maxOverrides) {
                        maxOverrides = data[domain][severity];
                    }
                });
            }
        });
        return { data, maxOverrides };
    }, [logs]);

    const rationaleClusters = useMemo(() => {
        if (!rationaleDialog || taggedRationales.length === 0) return new Map();
        return calculateClusters(taggedRationales);
    }, [rationaleDialog, taggedRationales]);
    
    const previousRationaleClusters = useMemo(() => {
        if (!rationaleDialog) return new Map();

        const relevantLogs = previousLogs.filter(log => {
            const d = parseDetails(log.details);
            return d.isOverride && d.severity === rationaleDialog.severity && d.domains?.includes(rationaleDialog.domain)
        });

        const rationales: TaggedRationale[] = relevantLogs.map(log => {
            const d = parseDetails(log.details);
            return { rationale: d.rationale, tags: [], severity: d.severity!, domains: d.domains! };
        });

        if (rationales.length === 0) return new Map();
        
        const alignedPrevClusters: ClusterMap = new Map();
        const currentTags = Array.from(rationaleClusters.keys());

        currentTags.forEach(tag => {
            const clusterInfo: ClusterInfo = {
                items: [],
                severities: { "Warning": 0, "Critical": 0, "Catastrophic": 0 },
                domains: {},
                riskScore: 0
            };

            const taggedPrevRationales = rationales.filter(r => {
                const isMatch = r.rationale.toLowerCase().includes(tag.toLowerCase());
                if (isMatch) {
                    r.tags = [...new Set([...r.tags, tag])];
                }
                return isMatch;
            });
            
            if (taggedPrevRationales.length > 0) {
                 taggedPrevRationales.forEach(item => {
                    clusterInfo.items.push(item);
                    clusterInfo.severities[item.severity]++;
                 });

                 let score = 0;
                 score += clusterInfo.severities.Warning * RISK_WEIGHTS.Warning;
                 score += clusterInfo.severities.Critical * RISK_WEIGHTS.Critical;
                 score += clusterInfo.severities.Catastrophic * RISK_WEIGHTS.Catastrophic;
                 clusterInfo.riskScore = score;

                 alignedPrevClusters.set(tag, clusterInfo);
            }
        });
        
        return alignedPrevClusters;

    }, [previousLogs, rationaleDialog, rationaleClusters]);

    const { data, maxOverrides } = heatmapData;
    const domains = Object.keys(data).sort();
    const severities: Severity[] = ["Warning", "Critical", "Catastrophic"];

    if (domains.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Override Frequency Heatmap</CardTitle>
                    <CardDescription>No override data available for the selected time window.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">Overrides will be analyzed here once they are logged.</p>
                </CardContent>
            </Card>
        )
    }

    return (
      <>
        <Card>
            <CardHeader>
                <CardTitle>Override Frequency Heatmap & Cluster Analysis</CardTitle>
                <CardDescription>Analysis of strategist overrides across domains and severity levels. Click a cell to inspect rationale clusters.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Domain</TableHead>
                            {severities.map(s => <TableHead key={s} className="text-center">{s}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {domains.map(domain => (
                            <TableRow key={domain}>
                                <TableCell className="font-medium">{domain}</TableCell>
                                {severities.map(severity => {
                                    const count = data[domain]?.[severity] ?? 0;
                                    return (
                                        <TableCell 
                                            key={severity} 
                                            className={cn("text-center", count > 0 ? "cursor-pointer hover:bg-muted/50" : "")}
                                            onClick={() => count > 0 && handleCellClick(domain, severity)}
                                        >
                                            <div className={cn("w-full h-8 flex items-center justify-center rounded-md", getHeatmapColor(count, maxOverrides))}>
                                                {count}
                                            </div>
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        
        <Dialog open={!!rationaleDialog} onOpenChange={(open) => { if (!open) setRationaleDialog(null); }}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Override Rationales for <span className="text-accent">{rationaleDialog?.domain}</span></DialogTitle>
                    <DialogDescription>
                        Severity Level: <Badge variant={rationaleDialog?.severity === "Critical" || rationaleDialog?.severity === "Catastrophic" ? "destructive" : "secondary"}>{rationaleDialog?.severity}</Badge>
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-4">
                        {loadingRationales && (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        )}
                        {!loadingRationales && rationaleClusters.size > 0 && (
                             <Accordion type="multiple" className="w-full">
                                {Array.from(rationaleClusters.entries()).sort((a,b) => b[1].riskScore - a[1].riskScore).map(([tag, { items, severities, domains, riskScore }]) => {
                                   const sortedDomains = Object.entries(domains).sort((a, b) => b[1].count - a[1].count);
                                   const previousRiskScore = previousRationaleClusters.get(tag)?.riskScore ?? 0;
                                   const isLargeDelta = Math.abs(riskScore - previousRiskScore) > DELTA_THRESHOLD;

                                    return (
                                        <AccordionItem key={tag} value={tag} className={cn((riskScore - previousRiskScore > 0 && isLargeDelta) && "border-red-500/50 rounded-lg border")}>
                                            <AccordionTrigger>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Tags className="h-4 w-4 text-muted-foreground" />
                                                    <span className="capitalize font-semibold">{tag}</span>
                                                    <Badge variant="outline">{items.length} total</Badge>
                                                    <Badge variant={riskScore > 10 ? "destructive" : riskScore > 5 ? "secondary" : "default"} className="gap-1 bg-primary/20 text-primary-foreground"><BarChart className="h-3 w-3" /> Risk: {riskScore}</Badge>
                                                    <ClusterDelta currentScore={riskScore} previousScore={previousRiskScore} />
                                                    {severities.Warning > 0 && <Badge variant="secondary" className="gap-1 bg-yellow-500/20 text-yellow-300"><AlertCircle className="h-3 w-3" /> {severities.Warning} W</Badge>}
                                                    {severities.Critical > 0 && <Badge variant="destructive" className="gap-1 bg-orange-600"><ShieldAlert className="h-3 w-3" /> {severities.Critical} C</Badge>}
                                                    {severities.Catastrophic > 0 && <Badge variant="destructive" className="gap-1 bg-red-800"><ShieldX className="h-3 w-3" /> {severities.Catastrophic} Ct</Badge>}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="space-y-4 pl-2">
                                                    <div className="flex flex-col md:flex-row gap-8">
                                                        <div className="flex-[3] space-y-4">
                                                            <h4 className="font-semibold text-sm">Rationales ({items.length})</h4>
                                                             {items.map((item, index) => (
                                                                <div key={index}>
                                                                    <blockquote className="border-l-2 pl-4 italic text-muted-foreground">
                                                                        "{item.rationale}"
                                                                    </blockquote>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="flex-[2] space-y-4">
                                                            <h4 className="font-semibold text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> Domain Spread</h4>
                                                            <div className="space-y-2">
                                                                {sortedDomains.map(([domain, metrics]) => (
                                                                    <div key={domain} className="text-xs p-2 rounded-md bg-muted/30">
                                                                        <div className="flex items-center justify-between font-semibold">
                                                                            <span className="text-foreground">{domain}</span>
                                                                            <Badge variant="secondary">{metrics.count} total</Badge>
                                                                        </div>
                                                                        <div className="flex gap-2 mt-1.5">
                                                                            {metrics.severities.Warning > 0 && <Badge variant="secondary" className="gap-1 text-xs bg-yellow-500/20 text-yellow-300"><AlertCircle className="h-3 w-3" />{metrics.severities.Warning}</Badge>}
                                                                            {metrics.severities.Critical > 0 && <Badge variant="destructive" className="gap-1 text-xs bg-orange-600"><ShieldAlert className="h-3 w-3" />{metrics.severities.Critical}</Badge>}
                                                                            {metrics.severities.Catastrophic > 0 && <Badge variant="destructive" className="gap-1 text-xs bg-red-800"><ShieldX className="h-3 w-3" />{metrics.severities.Catastrophic}</Badge>}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>
                        )}
                         {!loadingRationales && rationaleClusters.size === 0 && (
                            <p className="text-muted-foreground text-center py-4">No rationale clusters found for this selection.</p>
                         )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
      </>
    );
}

type TimeFilter = "24h" | "7d" | "all";
type ViewMode = "logs" | "feedback";

const RecommendationConfidence = ({ rec }: { rec: Recommendation }) => {
    let Icon = HelpCircle;
    let label = `Low (${rec.confidence.toFixed(2)})`;
    let color = "text-muted-foreground";
    let bgColor = "bg-muted/30";

    if (rec.confidence > 0.75) {
        Icon = Sparkles;
        label = `High (${rec.confidence.toFixed(2)})`;
        color = "text-green-400";
        bgColor = "bg-green-500/10";
    } else if (rec.confidence > 0.4) {
        Icon = TrendingUp;
        label = `Medium (${rec.confidence.toFixed(2)})`;
        color = "text-yellow-400";
        bgColor = "bg-yellow-500/10";
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                     <Badge variant="outline" className={cn("gap-1.5", color, bgColor)}>
                        <Icon className="h-3 w-3" />
                        {label}
                    </Badge>
                </TooltipTrigger>
                {rec.basedOn && rec.basedOn.length > 0 && (
                     <TooltipContent>
                        <p>Based on feedback for: {rec.basedOn.join(', ')}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    )
}


export default function HistoryClient() {
  const [allLogs, setAllLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSignalHistoryOutput | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [viewMode, setViewMode] = useState<ViewMode>("logs");
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const [confidenceThreshold, setConfidenceThreshold] = useState(() => {
    if (typeof window === "undefined") return 0;
    const saved = localStorage.getItem("confidenceThreshold");
    return saved !== null ? parseFloat(saved) : 0;
  });
  const { toast } = useToast();
  const { user } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    const drilldownTime = searchParams.get('time');
    if (drilldownTime && (drilldownTime === '24h' || drilldownTime === '7d' || drilldownTime === 'all')) {
        setTimeFilter(drilldownTime as TimeFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("confidenceThreshold", String(confidenceThreshold));
    }
  }, [confidenceThreshold]);

  useEffect(() => {
    const q = query(collection(db, "hud_actions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map((doc) => {
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
      setAllLogs(fetchedLogs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching action logs:", error);
      toast({
        variant: "destructive",
        title: "Fetch Error",
        description: "Could not fetch Signal Memory logs.",
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const { filteredLogs, previousPeriodLogs } = useMemo(() => {
    const now = Date.now();
    let currentLogs: ActionLog[];
    let previousLogs: ActionLog[];

    if (timeFilter === "all") {
      return { filteredLogs: allLogs, previousPeriodLogs: [] };
    }

    const filterMilliseconds = timeFilter === "24h" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    
    currentLogs = allLogs.filter(log => {
        const logTime = log.timestamp.getTime();
        return now - logTime < filterMilliseconds;
    });
    previousLogs = allLogs.filter(log => {
      const logTime = log.timestamp.getTime();
      return (now - logTime >= filterMilliseconds) && (now - logTime < 2 * filterMilliseconds);
    });

    return { filteredLogs: currentLogs, previousPeriodLogs: previousLogs };
  }, [allLogs, timeFilter]);

  const handleAnalysis = async () => {
    setLoadingAnalysis(true);
    setAnalysisResult(null);
    setFeedbackGiven({});
    try {
      const logsString = filteredLogs
        .map(log => `[${log.timestamp.toISOString()}] ${log.action} by ${log.role} '${log.strategist}': ${log.details}`)
        .join("\n");
      
      if (!logsString) {
        toast({
          variant: "default",
          title: "No Logs",
          description: `There are no action logs to analyze in the selected time window.`,
        });
        setLoadingAnalysis(false);
        return;
      }
      
      const result = await analyzeSignalHistory({ actionLogs: logsString });
      setAnalysisResult(result);
    } catch (error) => {
      console.error("AI analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not get AI-powered analysis. Please try again.",
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleFeedback = async (recommendation: Recommendation, rating: 'up' | 'down') => {
    if (feedbackGiven[recommendation.recommendationId]) return; 

    setFeedbackGiven(prev => ({...prev, [recommendation.recommendationId]: rating }));
    toast({
        title: "Feedback Submitted",
        description: "Thank you for helping improve the AI."
    });

    try {
        await addDoc(collection(db, "feedback"), {
            recommendationId: recommendation.recommendationId,
            recommendationText: recommendation.text,
            rating,
            strategist: user.name,
            role: user.role,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Failed to submit feedback:", error);
        toast({
            variant: "destructive",
            title: "Feedback Error",
            description: "Could not save your feedback. Please try again."
        });
        setFeedbackGiven(prev => {
            const newState = {...prev};
            delete newState[recommendation.recommendationId];
            return newState;
        });
    }
  };
  
  const renderTimeFilterTabs = () => (
    <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
      <TabsList>
        <TabsTrigger value="24h">Last 24h</TabsTrigger>
        <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
        <TabsTrigger value="all">All Time</TabsTrigger>
      </TabsList>
    </Tabs>
  );

  const renderViewModeTabs = () => (
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="ml-auto">
        <TabsList>
            <TabsTrigger value="logs">Action Logs</TabsTrigger>
            <TabsTrigger value="feedback">Feedback Dashboard</TabsTrigger>
        </TabsList>
      </Tabs>
  );


  const sortedRecommendations = useMemo(() => {
    if (!analysisResult) return [];
    
    const filtered = analysisResult.recommendations.filter(rec => rec.confidence >= confidenceThreshold);

    return [...filtered].sort((a, b) => b.confidence - a.confidence);
  }, [analysisResult, confidenceThreshold]);

  return (
    <div className="space-y-6">
        <div className="flex justify-start">
          {renderTimeFilterTabs()}
          {renderViewModeTabs()}
        </div>

        {viewMode === 'logs' && (
            <>
                <OverrideHeatmap logs={filteredLogs} previousLogs={previousPeriodLogs} />

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Action History</CardTitle>
                        <CardDescription>A persistent log of all strategist actions in the selected time window.</CardDescription>
                    </div>
                    <Button onClick={handleAnalysis} disabled={loading || loadingAnalysis}>
                        {loadingAnalysis ? "Analyzing..." : "Analyze with AI"}
                    </Button>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Action</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Strategist</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead className="w-[50%]">Details & Rationale</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                            </TableRow>
                            ))
                        ) : filteredLogs.length > 0 ? (
                            filteredLogs.map((log) => {
                            const { isOverride, rationale, action, severity, domains } = parseDetails(log.details);
                            return (
                                <TableRow key={log.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="secondary">{log.action}</Badge>
                                    {isOverride && (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Override
                                    </Badge>
                                    )}
                                    {severity && <Badge variant={severity === 'Critical' || severity === 'Catastrophic' ? 'destructive' : 'secondary'}>{severity}</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell>{log.role}</TableCell>
                                <TableCell>{log.strategist}</TableCell>
                                <TableCell>{log.timestamp.toLocaleString()}</TableCell>
                                <TableCell className="font-mono text-xs">
                                    {log.action === "STRATEGIST_RESPONSE" ? (
                                        <div className="flex items-start gap-2">
                                            <MessageSquareQuote className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                            <span>
                                                Responded with <strong>{action}</strong> on <strong>{domains?.join(', ')}</strong>: <em>"{rationale}"</em>
                                            </span>
                                        </div>
                                    ) : (
                                        log.details
                                    )}
                                </TableCell>
                                </TableRow>
                            )
                            })
                        ) : (
                            <TableRow>
                            <TableCell colSpan={5} className="text-center">
                                No actions logged in this time period.
                            </TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>

                {loadingAnalysis && (
                    <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-accent">
                        <Bot className="h-6 w-6" /> Signal Intelligence Layer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Bot className="h-5 w-5" />Summary</h3>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6 mt-2" />
                        </div>
                        <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><BrainCircuit className="h-5 w-5" />Patterns Detected</h3>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                        </div>
                        <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5" />Recommendations</h3>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5 mt-2" />
                        </div>
                    </CardContent>
                    </Card>
                )}

                {analysisResult && (
                    <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-accent">
                        <Bot className="h-6 w-6" /> Signal Intelligence Layer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><Bot className="h-5 w-5" />Summary</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult.summary}</p>
                        </div>
                        <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2 flex items-center gap-2"><BrainCircuit className="h-5 w-5" />Patterns Detected</h3>
                            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                                {analysisResult.patterns.map((pattern, index) => (
                                    <li key={index}>{pattern}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5" />Recommendations</h3>
                            <div className="flex items-center space-x-4 w-1/2 max-w-sm">
                                <Label htmlFor="confidence-slider" className="text-sm whitespace-nowrap">Min Confidence</Label>
                                <div className="flex-grow flex items-center gap-2">
                                    <Slider
                                        id="confidence-slider"
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        value={[confidenceThreshold]}
                                        onValueChange={(value) => setConfidenceThreshold(value[0])}
                                        className="flex-grow"
                                    />
                                    <span className="text-sm font-mono w-10 text-center">{confidenceThreshold.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {sortedRecommendations.map((rec) => (
                                <div key={rec.recommendationId} className="flex items-start justify-between p-3 rounded-lg bg-muted/20 border border-muted/30">
                                    <div className="flex-1 pr-4 space-y-2">
                                    <p className="text-muted-foreground">{rec.text}</p>
                                    <RecommendationConfidence rec={rec} />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button 
                                            size="icon" 
                                            variant={feedbackGiven[rec.recommendationId] === 'up' ? "default" : "outline"}
                                            className="h-8 w-8"
                                            onClick={() => handleFeedback(rec, 'up')}
                                            disabled={!!feedbackGiven[rec.recommendationId]}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant={feedbackGiven[rec.recommendationId] === 'down' ? "destructive" : "outline"}
                                            className="h-8 w-8"
                                            onClick={() => handleFeedback(rec, 'down')}
                                            disabled={!!feedbackGiven[rec.recommendationId]}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {sortedRecommendations.length === 0 && (
                                <p className="text-muted-foreground text-center py-4">No recommendations to display based on the current filter.</p>
                            )}
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                )}
            </>
        )}
        
        {viewMode === 'feedback' && (
            <FeedbackDashboard />
        )}
    </div>
  );
}

    