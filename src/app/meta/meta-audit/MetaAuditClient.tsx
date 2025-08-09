
"use client";

import { useState, useEffect, useCallback }from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Bot, Code, Cpu, Link2, GitBranchPlus, RefreshCw, CheckCircle, FileCode, CircleDashed } from "lucide-react";
import { analyzeCode, type CodeAnalysisOutput } from "@/ai/flows/code-intelligence-flow";
import { ALL_FILES } from "@/lib/project-files";
import { useUser } from "@/hooks/use-user";
import { isBrowser } from "@/lib/env-check";
import { Progress } from "@/components/ui/progress";
import {
  getAuditResults,
  updateAuditResult,
  type AuditResult,
} from "@/services/meta-audit-service";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const flowFiles = Object.keys(ALL_FILES).filter(path => path.startsWith('/src/ai/flows/'));

export default function MetaAuditClient() {
  const [loading, setLoading] = useState(false);
  const [auditResults, setAuditResults] = useState<Record<string, AuditResult>>({});
  const [progress, setProgress] = useState(0);

  const { toast } = useToast();
  const { user } = useUser();

  const fetchResults = useCallback(async () => {
    if (!isBrowser() || !user) return;
    setLoading(true);
    try {
        const results = await getAuditResults();
        setAuditResults(results);
    } catch (error) {
        console.error("Failed to fetch audit results", error);
        toast({ variant: "destructive", title: "Fetch Error", description: "Could not load prior audit results." });
    } finally {
        setLoading(false);
    }
  }, [user, toast]);
  
  useEffect(() => {
    fetchResults();
  }, [fetchResults]);


  const handleFullAudit = async () => {
    if (!isBrowser() || !user) return;
    
    setLoading(true);
    setProgress(0);
    
    let processedCount = 0;

    for (const filePath of flowFiles) {
      try {
        const fileContent = ALL_FILES[filePath];
        const analysis = await analyzeCode({
          filePath: filePath,
          fileContent: fileContent,
        });

        await updateAuditResult(filePath, analysis);
        
        setAuditResults(prev => ({
            ...prev,
            [filePath]: { analysis, auditedAt: new Date() }
        }));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
          variant: "destructive",
          title: `Audit Failed for ${filePath}`,
          description: errorMessage,
        });
      }
      processedCount++;
      setProgress((processedCount / flowFiles.length) * 100);
    }
    
    toast({ title: "Meta-Audit Complete", description: "All AI flows have been analyzed."});
    setLoading(false);
  };
  
  const getStatusIcon = (filePath: string) => {
    const result = auditResults[filePath];
    if (!result) return <CircleDashed className="h-4 w-4 text-muted-foreground" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
  
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Never";
    const d = new Date(date);
    if(isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleString();
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Dogfooding Protocol Control</CardTitle>
                <CardDescription>
                Initiate a full meta-audit of the mesh. The system will use its own Code Intelligence flow to analyze every other AI flow.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={handleFullAudit} disabled={loading || !user}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? `Auditing... (${Math.round(progress)}%)` : "Run Full Meta-Audit"}
                </Button>
                 {loading && <Progress value={progress} className="mt-4" />}
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Audit Results</CardTitle>
                <CardDescription>Persisted analysis for each AI flow module in the mesh.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading && !Object.keys(auditResults).length ? (
                    <Skeleton className="h-48 w-full" />
                ) : (
                <Accordion type="multiple" className="w-full space-y-2">
                    {flowFiles.map((filePath) => {
                        const result = auditResults[filePath];
                        const analysis = result?.analysis;

                        return (
                             <AccordionItem value={filePath} key={filePath} className="border bg-muted/30 rounded-lg px-4">
                                <AccordionTrigger>
                                    <div className="flex items-center gap-4">
                                        {getStatusIcon(filePath)}
                                        <div>
                                            <p className="font-mono text-sm text-left">{filePath}</p>
                                            <p className="text-xs text-muted-foreground text-left">Last Audited: {formatDate(result?.auditedAt)}</p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="bg-background p-4 rounded-b-lg">
                                    {analysis ? (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="font-semibold mb-2 flex items-center gap-2"><Cpu className="h-4 w-4" />Purpose</h3>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.purpose}</p>
                                            </div>
                                            <div className="border-t pt-4">
                                                <h3 className="font-semibold mb-2 flex items-center gap-2"><Link2 className="h-4 w-4" />Dependencies</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {analysis.dependencies.map(dep => <Badge key={dep} variant="secondary">{dep}</Badge>)}
                                                </div>
                                            </div>
                                            <div className="border-t pt-4">
                                                <h3 className="font-semibold mb-2 flex items-center gap-2"><GitBranchPlus className="h-4 w-4" />Performance Mapping</h3>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.performanceMapping}</p>
                                            </div>
                                            <div className="border-t pt-4">
                                                <h3 className="font-semibold mb-2 flex items-center gap-2"><Code className="h-4 w-4" />Quality Assessment</h3>
                                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.qualityAssessment}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-8">No analysis available. Run the audit to generate insights.</p>
                                    )}
                                </AccordionContent>
                             </AccordionItem>
                        )
                    })}
                </Accordion>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
