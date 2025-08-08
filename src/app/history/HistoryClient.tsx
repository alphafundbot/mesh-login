
"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
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
import { analyzeSignalHistory, type AnalyzeSignalHistoryOutput } from "@/ai/flows/signal-intelligence-flow";
import { Bot, BrainCircuit, Lightbulb, MessageSquareQuote, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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

function OverrideHeatmap({ logs }: { logs: ActionLog[] }) {
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
    const domains = Object.keys(data);
    const severities: Severity[] = ["Warning", "Critical", "Catastrophic"];

    if (domains.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Override Frequency Heatmap</CardTitle>
                    <CardDescription>No override data available yet.</CardDescription>
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
                <CardDescription>Analysis of strategist overrides across domains and severity levels.</CardDescription>
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
                                {severities.map(severity => (
                                    <TableCell key={severity} className="text-center">
                                        <div className={cn("w-full h-8 flex items-center justify-center rounded-md", getHeatmapColor(data[domain][severity], maxOverrides))}>
                                            {data[domain][severity]}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}


export default function HistoryClient() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeSignalHistoryOutput | null>(null);
  const { toast } = useToast();

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
      setLogs(fetchedLogs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching action logs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAnalysis = async () => {
    setLoadingAnalysis(true);
    setAnalysisResult(null);
    try {
      const logsString = logs
        .map(log => `[${log.timestamp.toISOString()}] ${log.action} by ${log.role} '${log.strategist}': ${log.details}`)
        .join("\n");
      
      if (!logsString) {
        toast({
          variant: "destructive",
          title: "No Logs",
          description: "There are no action logs to analyze.",
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

  return (
    <div className="space-y-6">
        <OverrideHeatmap logs={logs} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Action History</CardTitle>
            <CardDescription>A persistent log of all strategist actions.</CardDescription>
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
              ) : logs.length > 0 ? (
                logs.map((log) => {
                  const { isOverride, rationale, action } = parseDetails(log.details);
                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                         <Badge variant="secondary">{log.action}</Badge>
                         {isOverride && (
                           <Badge variant="destructive" className="flex items-center gap-1">
                             <AlertTriangle className="h-3 w-3" /> Override
                           </Badge>
                         )}
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
                                    Responded with <strong>{action}</strong>: <em>"{rationale}"</em>
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
                    No actions logged yet.
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
              <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult.patterns}</p>
            </div>
             <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5" />Recommendations</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult.recommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
