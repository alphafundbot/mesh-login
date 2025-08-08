
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from 'next/link';
import { ChevronRight, Lock, Bot, BrainCircuit, Lightbulb, History, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { analyzeSignalHistory, type AnalyzeSignalHistoryOutput } from "@/ai/flows/signal-intelligence-flow";
import { useToast } from "@/hooks/use-toast";

type Domain = {
  name: string;
  slug: string;
  icon: LucideIcon;
  modules: string[];
  status: string;
};

const SENSITIVE_MODULES = ["Consent Ledger", "Medical Vault", "SIM Vault", "Identity Vault", "Secret Vault", "Biometric Router"];

// Generates sample logs for a given module to simulate fetching real data
const generateModuleLogs = (moduleName: string) => {
    const actions = ["CONFIG_UPDATE", "DEPLOY_SUCCESS", "SECURITY_SCAN", "USER_LOGIN", "API_ERROR", "ROLLBACK", "UNAUTHORIZED_ACCESS"];
    const strategists = ["Nehemie", "Architect-02", "Operator-01", "Analyst-04"];
    
    let logs = `Action logs for module: ${moduleName}\n`;
    for (let i = 0; i < 5 + Math.floor(Math.random() * 5); i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const strategist = strategists[Math.floor(Math.random() * strategists.length)];
        const timestamp = new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(); // a time in the last 3 days
        logs += `[${timestamp}] ${action} on module ${moduleName} by ${strategist}\n`;
    }
    return logs;
}


export default function ModuleClient({ domain, moduleName }: { domain: Domain, moduleName: string }) {
  const isSensitive = SENSITIVE_MODULES.includes(moduleName);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeSignalHistoryOutput | null>(null);
  const { toast } = useToast();

   const handleAnalysis = async () => {
      setLoading(true);
      setResult(null);
      try {
        const simulatedLogs = generateModuleLogs(moduleName);
        const output = await analyzeSignalHistory({ actionLogs: simulatedLogs });
        setResult(output);
      } catch (error) {
        console.error("Module AI analysis failed:", error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: `Could not get AI analysis for module: ${moduleName}.`,
        });
      } finally {
        setLoading(false);
      }
    };
    
  const renderLoading = () => (
     <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent"><Bot className="h-6 w-6" /> AI Synthesis</CardTitle>
            <CardDescription>The AI is analyzing the module's signal history...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><History className="h-5 w-5" /> Summary</h3>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><BrainCircuit className="h-5 w-5" /> Patterns Detected</h3>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2"><Lightbulb className="h-5 w-5" /> Recommendations</h3>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
  )

  const renderContent = () => {
    if (!result) {
        return <p className="text-muted-foreground text-center py-4">No analysis available. Click "Analyze Module" to generate insights.</p>
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent"><Bot className="h-6 w-6" /> AI Synthesis</CardTitle>
                <CardDescription>AI-generated analysis of this module's signal history.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><History className="h-5 w-5" />Summary</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
                </div>
                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><BrainCircuit className="h-5 w-5" />Patterns Detected</h3>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                        {result.patterns.map((pattern, index) => (
                        <li key={index}>{pattern}</li>
                        ))}
                    </ul>
                </div>
                <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5" />Recommendations</h3>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                        {result.recommendations.map(rec => (
                            <li key={rec.recommendationId}>{rec.text}</li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center text-sm text-muted-foreground">
            <Link href={`/domain/${domain.slug}`} className="hover:text-foreground">{domain.name}</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-foreground">{moduleName}</span>
        </div>
        <div className="flex items-center justify-between space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{moduleName}</h1>
        </div>
        
        <div className="flex justify-end">
            <Button onClick={handleAnalysis} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Analyze Module
            </Button>
        </div>

        {loading ? renderLoading() : renderContent()}
      
       <Card>
        <CardHeader>
            <CardTitle>Strategist Actions</CardTitle>
            <CardDescription>Perform module-specific actions and overrides.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
            <Button disabled>Action 1</Button>
            <Button disabled variant="secondary">Action 2</Button>
            <Button disabled variant="destructive">Emergency Override</Button>
            {isSensitive && (
                <Button disabled variant="destructive">
                    <Lock className="mr-2 h-4 w-4" />
                    Lock Module
                </Button>
            )}
        </CardContent>
      </Card>

    </div>
  );
}
