"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  analyzeSignalHistory,
  type AnalyzeSignalHistoryOutput,
} from "@/ai/flows/signal-intelligence-flow";
import { useToast } from "@/hooks/use-toast";
import { Bot, BrainCircuit, Lightbulb, History, GitCommit } from "lucide-react";

type Domain = {
  name: string;
  slug: string;
  modules: string[];
};

// Generates sample logs for a given domain to simulate fetching real data
const generateDomainLogs = (domain: Domain) => {
    const actions = ["CONFIG_UPDATE", "DEPLOY_SUCCESS", "SECURITY_SCAN", "USER_LOGIN", "API_ERROR"];
    const strategists = ["Nehemie", "Architect-02", "Operator-01"];
    
    let logs = `Action logs for domain: ${domain.name}\n`;
    for (let i = 0; i < 5; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const strategist = strategists[Math.floor(Math.random() * strategists.length)];
        const module = domain.modules[Math.floor(Math.random() * domain.modules.length)];
        const timestamp = new Date(Date.now() - Math.random() * 86400000).toISOString(); // a time in the last 24 hours
        logs += `[${timestamp}] ${action} on module ${module} by ${strategist}\n`;
    }
    return logs;
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
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
          <p className="text-muted-foreground whitespace-pre-wrap">
            {result.patterns}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent"><Lightbulb className="h-5 w-5" />Tactical Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {result.recommendations}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
