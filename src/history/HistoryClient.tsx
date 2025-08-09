

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp, where, getDocs, limit, doc, updateDoc, addDoc } from "firebase/firestore";
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
import { analyzeSignalHistory, type AnalyzeSignalHistoryOutput, submitFeedback } from "@/ai/flows/signal-intelligence-flow";
import { tagRationale } from "@/ai/flows/rationale-tagging-flow";
import { generateReplayCommentary, type ReplayCommentaryOutput } from "@/ai/flows/replay-commentary-flow";
import type { RationaleForecastOutput } from "@/ai/flows/rationale-forecast-flow";
import { Bot, BrainCircuit, Lightbulb, MessageSquareQuote, AlertTriangle, Tags, ShieldAlert, ShieldX, Globe, AlertCircle, BarChart, ArrowUp, ArrowDown, ThumbsUp, ThumbsDown, Sparkles, HelpCircle, TrendingUp, GitCompareArrows, FileText } from "lucide-react";
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
import { useClusterMomentum } from "@/hooks/use-cluster-momentum";
import type { ActionLog, Severity, ParsedDetails, TaggedRationale, Recommendation, ClusterInfo, ClusterMap, DomainMetrics } from "@/lib/types";
import { parseDetails, RISK_WEIGHTS } from "@/lib/types";
import { isBrowser } from "@/lib/env-check";


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
            if (item.severity) {
                cluster.severities[item.severity]++;
            }
            if (item.domains) {
                item.domains.forEach(domain => {
                    if (!cluster.domains[domain]) {
                        cluster.domains[domain] = { count: 0, severities: { "Warning": 0, "Critical": 0, "Catastrophic": 0 } };
                    }
                    cluster.domains[domain].count++;
                    if (item.severity) {
                        cluster.domains[domain].severities[item.severity]++;
                    }
                });
            }
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
    
    if (delta === 0) return null;
    
    const Arrow = delta > 0 ? ArrowUp : ArrowDown;
    const isLargeDelta = Math.abs(delta) > DELTA_THRESHOLD;
    let color = "text-muted-foreground";
    if (delta > 0) color = "text-red-400";
    if (delta < 0) color = "text-green-400";

    return (
        <Badge variant="outline" className={cn("gap-1 font-mono", color, isLargeDelta && "border-red-400/50 font-bold")}>
            <Arrow className="h-3 w-3" />
            {delta > 0 && "+"}{delta.toFixed(0)}
        </Badge>
    );
}

function DialogClusterItem({ cluster, previousLogs }: { cluster: ClusterInfo, previousLogs: ActionLog[] }) {
    const { previousScore } = useClusterMomentum(cluster, previousLogs);
    const { items, severities, riskScore, tag } = cluster;

    const sortedDomains = Object.entries(cluster.domains).sort((a, b) => b[1].count - a[1].count);
    const isLargeDelta = Math.abs(riskScore - previousScore) > DELTA_THRESHOLD;

    return (
        <AccordionItem value={tag} className={cn((riskScore - previousScore > 0 && isLargeDelta) && "border-red-500/50 rounded-lg border")}>
            <AccordionTrigger>
                <div className="flex items-center gap-2 flex-wrap">
                    <Tags className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize font-semibold">{tag}</span>
                    <Badge variant="outline">{items.length} total</Badge>
                    <Badge variant={riskScore > 10 ? "destructive" : riskScore > 5 ? "secondary" : "default"} className="gap-1 bg-primary/20 text-primary-foreground"><BarChart className="h-3 w-3" /> Risk: {riskScore.toFixed(0)}</Badge>
                    <ClusterDelta currentScore={riskScore} previousScore={previousScore} />
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
    );
}

type RationaleDialogContent = {
    title: string;
    description: React.ReactNode;
    rationales: TaggedRationale[];
} | null;


function RationaleDialog({ 
    content, 
    onOpenChange, 
    taggedRationales, 
    loading, 
    previousLogs 
}: { 
    content: RationaleDialogContent, 
    onOpenChange: (open: boolean) => void,
    taggedRationales: TaggedRationale[],
    loading: boolean,
    previousLogs: ActionLog[]
}) {
    const dialogClusters = useMemo(() => {
        if (!content || taggedRationales.length === 0) return new Map();
        return calculateClusters(taggedRationales);
    }, [content, taggedRationales]);


    return (
        <Dialog open={!!content} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>{content?.title}</DialogTitle>
                    <DialogDescription>
                       {content?.description}
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                    <div className="space-y-4">
                        {loading && (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        )}
                        {!loading && dialogClusters.size > 0 && (
                             <Accordion type="multiple" className="w-full">
                                {Array.from(dialogClusters.values())
                                    .sort((a,b) => b.riskScore - a.riskScore)
                                    .map((cluster) => (
                                        <DialogClusterItem key={cluster.tag} cluster={cluster} previousLogs={previousLogs} />
                                    ))
                                }
                            </Accordion>
                        )}
                         {!loading && dialogClusters.size === 0 && (
                            <p className="text-muted-foreground text-center py-4">No rationale clusters found for this selection.</p>
                         )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}

const getHeatmapColor = (count: number, max: number) => {
    if (count === 0) return "bg-transparent";
    const intensity = Math.min(1, count / (max || 1));
    if (intensity > 0.8) return "bg-red-500/50";
    if (intensity > 0.5) return "bg-orange-500/50";
    if (intensity > 0.2) return "bg-yellow-500/50";
    return "bg-yellow-500/20";
};

function OverrideHeatmap({ logs, onCellClick }: { logs: ActionLog[], onCellClick: (domain: string, severity: Severity) => void }) {
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
        <Card>
            <CardHeader>
                <CardTitle>Override Frequency Heatmap</CardTitle>
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
                                            onClick={() => count > 0 && onCellClick(domain, severity)}
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
    );
}

function GlobalClusterPanel({ logs, previousLogs, onClusterClick }: { logs: ActionLog[], previousLogs: ActionLog[], onClusterClick: (cluster: ClusterInfo) => void }) {
    const [clusters, setClusters] = useState<ClusterMap>(new Map());
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const { user } = useUser();

    const handleAnalyzeClusters = useCallback(async () => {
        if (!isBrowser() || !user) return;
        setLoading(true);
        setClusters(new Map());
        try {
            const untagged = logs
                .map(l => ({ ...l, parsed: parseDetails(l.details) }))
                .filter(l => l.parsed.isOverride && l.parsed.rationale && l.parsed.severity && l.parsed.domains);

            if (untagged.length === 0) {
                toast({ title: "No Rationales", description: "No overrides with rationales found in this period." });
                setLoading(false);
                return;
            }

            const tagged = await Promise.all(untagged.map(async l => {
                const { tags } = await tagRationale({ rationale: l.parsed.rationale! });
                return { rationale: l.parsed.rationale!, tags, severity: l.parsed.severity!, domains: l.parsed.domains! };
            }));
            
            const newClusters = calculateClusters(tagged);
            setClusters(newClusters);
            toast({ title: "Analysis Complete", description: `Identified ${newClusters.size} rationale clusters.` });

        } catch (error) {
            console.error("Error analyzing clusters", error);
            toast({ variant: "destructive", title: "Analysis Failed", description: "Could not tag and cluster rationales." });
        } finally {
            setLoading(false);
        }
    }, [logs, toast, user]);
    
    const sortedClusters = useMemo(() => Array.from(clusters.values()).sort((a, b) => b.riskScore - a.riskScore), [clusters]);
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Global Rationale Clusters</CardTitle>
                        <CardDescription>Top override themes by calculated risk score. Click a cluster to investigate.</CardDescription>
                    </div>
                     <Button onClick={handleAnalyzeClusters} disabled={loading || logs.length === 0 || !user}>
                        {loading ? "Analyzing..." : "Analyze All Rationales"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                )}
                {!loading && sortedClusters.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedClusters.map(cluster => {
                            const { previousScore } = useClusterMomentum(cluster, previousLogs);
                            return (
                                <Card 
                                    key={cluster.tag}
                                    className="p-3 hover:bg-muted/50 cursor-pointer"
                                    onClick={() => onClusterClick(cluster)}
                                >
                                    <div className="flex items-start justify-between">
                                        <h4 className="font-semibold capitalize">{cluster.tag}</h4>
                                        <Badge variant={cluster.riskScore > 10 ? "destructive" : cluster.riskScore > 5 ? "secondary" : "default"} className="gap-1"><BarChart className="h-3 w-3" /> Risk: {cluster.riskScore.toFixed(0)}</Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                        {cluster.severities.Warning > 0 && <Badge variant="secondary" className="gap-1 text-xs bg-yellow-500/20 text-yellow-300"><AlertCircle className="h-3 w-3" />{cluster.severities.Warning}</Badge>}
                                        {cluster.severities.Critical > 0 && <Badge variant="destructive" className="gap-1 text-xs bg-orange-600"><ShieldAlert className="h-3 w-3" />{cluster.severities.Critical}</Badge>}
                                        {cluster.severities.Catastrophic > 0 && <Badge variant="destructive" className="gap-1 text-xs bg-red-800"><ShieldX className="h-3 w-3" />{cluster.severities.Catastrophic}</Badge>}
                                    </div>
                                    <ClusterDelta currentScore={cluster.riskScore} previousScore={previousScore} />
                                </Card>
                            );
                        })}
                    </div>
                ) : !loading && (
                    <p className="text-muted-foreground text-center py-4">Click "Analyze All Rationales" to identify and score clusters.</p>
                )}
            </CardContent>
        </Card>
    )
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

function ReplayCommentaryDisplay({ commentary }: { commentary: ReplayCommentaryOutput }) {
    const accuracyColor = commentary.accuracyScore > 0.7 ? "text-green-400" : commentary.accuracyScore > 0.4 ? "text-yellow-400" : "text-red-400";
    return (
        <Card>
            <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-accent">
                    <Bot className="h-6 w-6" /> Replay Commentary
                 </CardTitle>
                 <CardDescription>AI-generated analysis comparing the forecast to actual events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><FileText className="h-5 w-5" />Strategic Notes</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{commentary.strategicNotes}</p>
                    <div className="mt-2">
                        <Badge variant="outline" className={accuracyColor}>Accuracy Score: {(commentary.accuracyScore * 100).toFixed(0)}%</Badge>
                    </div>
                </div>
                 <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><GitCompareArrows className="h-5 w-5" />Divergence Map</h3>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-2">
                        {commentary.divergenceMap.map((item, index) => (
                           <li key={index}>
                               <strong className="text-foreground">{item.rationaleTag}</strong>: Predicted "{item.predicted}", but saw "{item.actual}". <span className="text-primary/80">Impact: {item.impact}</span>
                           </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
}


export default function HistoryClient() {
  const [allLogs, setAllLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSignalHistoryOutput | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("7d");
  const [viewMode, setViewMode] = useState<ViewMode>("logs" as ViewMode);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const [confidenceThreshold, setConfidenceThreshold] = useState(0);
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  const searchParams = useSearchParams();

  const [rationaleDialog, setRationaleDialog] = useState<RationaleDialogContent>(null);
  const [loadingRationales, setLoadingRationales] = useState(false);
  const [taggedRationales, setTaggedRationales] = useState<TaggedRationale[]>([]);

  const [replayCommentary, setReplayCommentary] = useState<ReplayCommentaryOutput | null>(null);
  const [loadingReplay, setLoadingReplay] = useState(false);


  useEffect(() => {
    const drilldownTime = searchParams.get('time');
    if (drilldownTime && (drilldownTime === '24h' || drilldownTime === '7d' || drilldownTime === 'all')) {
        setTimeFilter(drilldownTime as TimeFilter);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isBrowser()) {
        const saved = localStorage.getItem("confidenceThreshold");
        if (saved !== null) {
            setConfidenceThreshold(parseFloat(saved));
        }
    }
  }, []);


  useEffect(() => {
    if (isBrowser()) {
      localStorage.setItem("confidenceThreshold", String(confidenceThreshold));
    }
  }, [confidenceThreshold]);

  useEffect(() => {
    if (!isBrowser() || !user) {
        if(!isBrowser()) setLoading(false);
        return;
    }

    setLoading(true);
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
  }, [toast, user]);

  const { filteredLogs, previousPeriodLogs } = useMemo(() => {
    const now = Date.now();
    let currentLogs: ActionLog[];
    let previousLogs: ActionLog[];

    const startTimeParam = searchParams.get('startTime');
    const startTime = startTimeParam ? new Date(startTimeParam).getTime() : now;

    if (timeFilter === "all") {
      return { filteredLogs: allLogs, previousPeriodLogs: [] };
    }

    const filterMilliseconds = timeFilter === "24h" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    
    currentLogs = allLogs.filter(log => {
        const logTime = log.timestamp.getTime();
        return startTime - logTime < filterMilliseconds && startTime - logTime >= 0;
    });
    previousLogs = allLogs.filter(log => {
      const logTime = log.timestamp.getTime();
      return (startTime - logTime >= filterMilliseconds) && (startTime - logTime < 2 * filterMilliseconds);
    });

    return { filteredLogs: currentLogs, previousPeriodLogs: previousLogs };
  }, [allLogs, timeFilter, searchParams]);

  const openRationaleModal = useCallback(async (title: string, description: React.ReactNode, rationales: Omit<TaggedRationale, 'tags'>[]) => {
        if (!isBrowser() || !user) return;
        setLoadingRationales(true);
        setTaggedRationales([]);
        setRationaleDialog({ title, description, rationales: [] });
    
        try {
            const processed = await Promise.all(rationales.map(async (r) => {
                const { tags } = await tagRationale({ rationale: r.rationale });
                return { ...r, tags };
            }));

            setTaggedRationales(processed);
            setRationaleDialog({ title, description, rationales: processed });
        } catch (error) {
             console.error("Failed to process rationales:", error);
             toast({
                variant: "destructive",
                title: "Processing Failed",
                description: "Could not process rationales for viewing."
            });
            setRationaleDialog(null);
        } finally {
            setLoadingRationales(false);
        }

    }, [toast, user]);

    const handleHeatmapCellClick = useCallback((domain: string, severity: Severity) => {
        const relevantLogs = filteredLogs.filter(log => {
            const d = parseDetails(log.details);
            return d.isOverride && d.severity === severity && d.domains?.includes(domain)
        });

        if (relevantLogs.length === 0) return;
        
        const untaggedRationales = relevantLogs.map(log => {
            const d = parseDetails(log.details);
            return { rationale: d.rationale!, severity: d.severity!, domains: d.domains! };
        });

        const title = `Override Rationales for ${domain}`;
        const description = <>Severity Level: <Badge variant={severity === "Critical" || severity === "Catastrophic" ? "destructive" : "secondary"}>{severity}</Badge></>;
        
        openRationaleModal(title, description, untaggedRationales);
        
    }, [filteredLogs, openRationaleModal]);

     const handleClusterClick = useCallback((cluster: ClusterInfo) => {
        const title = `Rationale Cluster: "${cluster.tag}"`;
        const description = <>Showing {cluster.items.length} rationales related to this cluster.</>;
        
        // Items in ClusterInfo are already tagged
        setLoadingRationales(false);
        setTaggedRationales(cluster.items);
        setRationaleDialog({ title, description, rationales: cluster.items });

    }, []);
    
    useEffect(() => {
        if (!isBrowser() || !user || filteredLogs.length === 0) return;

        const autoStart = searchParams.get('autostart');
        const domain = searchParams.get('domain');
        const severity = searchParams.get('severity') as Severity;

        if (autoStart !== 'true') return;

        if (domain && severity) {
            handleHeatmapCellClick(domain, severity);
        }
    }, [searchParams, filteredLogs, handleHeatmapCellClick, user]);


  useEffect(() => {
    if (!isBrowser() || !user || filteredLogs.length === 0) {
      if(!isBrowser()) setReplayCommentary(null);
      return;
    };
    
    const startTimeParam = searchParams.get('startTime');
    if (!startTimeParam) {
      setReplayCommentary(null);
      return;
    }

    const fetchCommentary = async () => {
        if (!isBrowser() || !user) return;
        setLoadingReplay(true);
        setReplayCommentary(null);
        try {
            const forecastTimestamp = new Date(startTimeParam);
            const q = query(
                collection(db, "forecast_analysis"),
                where("timestamp", "==", Timestamp.fromDate(forecastTimestamp)),
                limit(1)
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setLoadingReplay(false);
                return;
            }
            
            const forecastDoc = querySnapshot.docs[0];
            const forecastData = forecastDoc.data();
            const originalForecast = forecastData.forecast as RationaleForecastOutput;

            if (forecastData.commentary) {
                setReplayCommentary(forecastData.commentary);
            } else {
                 const logsString = filteredLogs
                    .map(log => `[${log.timestamp.toISOString()}] ${log.action} by ${log.role} '${log.strategist}': ${log.details}`)
                    .join("\n");

                if (!logsString) {
                    setLoadingReplay(false);
                    return;
                }

                const commentary = await generateReplayCommentary({
                    originalForecast: originalForecast,
                    actualLogs: logsString,
                });
                
                const forecastDocRef = doc(db, "forecast_analysis", forecastDoc.id);
                await updateDoc(forecastDocRef, { commentary });

                setReplayCommentary(commentary);
            }
        } catch (error) {
            console.error("Failed to generate or fetch replay commentary:", error);
            toast({
                variant: "destructive",
                title: "Commentary Failed",
                description: "Could not generate or fetch AI replay commentary.",
            });
        } finally {
            setLoadingReplay(false);
        }
    }
    fetchCommentary();
  }, [searchParams, filteredLogs, toast, user]);

  const handleAnalysis = async () => {
    if (!isBrowser() || !user) return;
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
    } catch (error) {
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
    if (!isBrowser() || !user) return;
    if (feedbackGiven[recommendation.recommendationId]) return; 

    setFeedbackGiven(prev => ({...prev, [recommendation.recommendationId]: rating }));
    toast({
        title: "Feedback Submitted",
        description: "Thank you for helping improve the AI."
    });

    try {
        await submitFeedback({
            recommendationId: recommendation.recommendationId,
            recommendationText: recommendation.text,
            rating,
            strategist: user.name,
            role: user.role,
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
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>
      </Tabs>
  );


  const sortedRecommendations = useMemo(() => {
    if (!analysisResult) return [];
    return [...analysisResult.recommendations].sort((a, b) => b.confidence - a.confidence);
  }, [analysisResult]);

  const filteredRecommendations = useMemo(() => {
    if (!analysisResult) return [];
    return sortedRecommendations.filter(rec => rec.confidence >= confidenceThreshold);
  }, [sortedRecommendations, confidenceThreshold, analysisResult]);

  return (
    <div className="space-y-6">
        <div className="flex justify-start">
          {renderTimeFilterTabs()}
          {renderViewModeTabs()}
        </div>

        {loadingReplay && <Card><CardContent className="p-4"><Skeleton className="h-48 w-full" /></CardContent></Card>}
        {replayCommentary && <ReplayCommentaryDisplay commentary={replayCommentary} />}

        {viewMode === 'logs' && (
            <div className="space-y-6">
                <OverrideHeatmap logs={filteredLogs} onCellClick={handleHeatmapCellClick} />
                
                <GlobalClusterPanel logs={filteredLogs} previousLogs={previousPeriodLogs} onClusterClick={handleClusterClick} />

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Action History</CardTitle>
                        <CardDescription>A persistent log of all strategist actions in the selected time window.</CardDescription>
                    </div>
                    <Button onClick={handleAnalysis} disabled={loading || loadingAnalysis || filteredLogs.length === 0 || !user}>
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
                            {filteredRecommendations.length > 0 ? filteredRecommendations.map((rec) => (
                                <div key={rec.recommendationId} className={cn("flex items-start justify-between p-3 rounded-lg bg-muted/20 border border-muted/30", rec.confidence < confidenceThreshold && 'opacity-50')}>
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
                                            disabled={!!feedbackGiven[rec.recommendationId] || userLoading}
                                        >
                                            <ThumbsUp className="h-4 w-4" />
                                        </Button>
                                        <Button 
                                            size="icon" 
                                            variant={feedbackGiven[rec.recommendationId] === 'down' ? "destructive" : "outline"}
                                            className="h-8 w-8"
                                            onClick={() => handleFeedback(rec, 'down')}
                                            disabled={!!feedbackGiven[rec.recommendationId] || userLoading}
                                        >
                                            <ThumbsDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-muted-foreground text-center py-4">No recommendations to display based on the current filter.</p>
                            )}
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                )}
            </div>
        )}
        
        {viewMode === 'feedback' && (
            <FeedbackDashboard />
        )}
        <RationaleDialog 
            content={rationaleDialog}
            onOpenChange={(open) => { if (!open) setRationaleDialog(null); }}
            taggedRationales={taggedRationales}
            loading={loadingRationales}
            previousLogs={previousPeriodLogs}
        />
    </div>
  );
}
