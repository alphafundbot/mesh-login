
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  analyzeSignalHistory,
  type AnalyzeSignalHistoryOutput,
} from "@/ai/flows/signal-intelligence-flow";
import { useToast } from "@/hooks/use-toast";
import { Bot, BrainCircuit, Lightbulb, History, GitCommit, ThumbsUp, ThumbsDown, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import type { Recommendation } from "@/ai/flows/signal-intelligence-flow";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";


type Domain = {
  name: string;
  slug: string;
  modules: string[];
};

// Generates sample logs for a given domain to simulate fetching real data
const generateDomainLogs = (domain: Domain) => {
    const actions = ["CONFIG_UPDATE", "DEPLOY_SUCCESS", "SECURITY_SCAN", "USER_LOGIN", "API_ERROR", "ROLLBACK", "UNAUTHORIZED_ACCESS"];
    const strategists = ["Nehemie", "Architect-02", "Operator-01", "Analyst-04"];
    
    let logs = `Action logs for domain: ${domain.name}\n`;
    for (let i = 0; i < 10 + Math.floor(Math.random() * 10); i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const strategist = strategists[Math.floor(Math.random() * strategists.length)];
        const module = domain.modules[Math.floor(Math.random() * domain.modules.length)];
        const timestamp = new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(); // a time in the last 7 days
        logs += `[${timestamp}] ${action} on module ${module} by ${strategist}\n`;
    }
    return logs;
}

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


export default function DomainClient({ domain }: { domain: Domain }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalyzeSignalHistoryOutput | null>(
    null
  );
  const { toast } = useToast();

  useEffect(() => {
    const getAnalysis = async () => {
      setLoading(true);
      try {
        const simulatedLogs = generateDomainLogs(domain);
        const output = await analyzeSignalHistory({ actionLogs: simulatedLogs });
        setResult(output);
      } catch (error) {
        console.error("AI analysis failed:", error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: `Could not get AI analysis for ${domain.name}.`,
        });
      } finally {
        setLoading(false);
      }
    };
    getAnalysis();
  }, [domain, toast]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-5 w-5" />Action History Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><GitCommit className="h-5 w-5" />Configuration Pattern Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5" />Tactical Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!result) {
    return (
        <div className="text-center text-muted-foreground mt-6">No analysis data available.</div>
    )
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent"><History className="h-5 w-5" />Action History Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {result.summary}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent"><GitCommit className="h-5 w-5" />Configuration Pattern Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-muted-foreground space-y-1">
              {result.patterns.map((pattern, index) => (
                  <li key={index}>{pattern}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent"><Lightbulb className="h-5 w-5" />Tactical Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            {result.recommendations.sort((a,b) => b.confidence - a.confidence).map(rec => (
                <div key={rec.recommendationId} className="flex items-start justify-between p-3 rounded-lg bg-muted/20 border border-muted/30">
                    <div className="flex-1 pr-4 space-y-2">
                        <p className="text-muted-foreground">{rec.text}</p>
                        <RecommendationConfidence rec={rec} />
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
