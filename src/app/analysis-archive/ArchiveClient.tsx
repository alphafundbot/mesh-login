
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { SnapshotDiffOutput } from "@/ai/flows/snapshot-diff-flow";
import type { PredictiveOverrideOutput, PredictiveOverrideInput } from "@/ai/flows/predictive-override-flow";
import { Bot, GitCompareArrows, ChevronsRight, FileText, TestTube, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import { isBrowser } from "@/lib/env-check";

interface ArchivedDiffAnalysis {
    id: string;
    type: 'diff';
    snapshotA: string;
    snapshotB: string;
    analysis: SnapshotDiffOutput;
    timestamp: Date;
}

interface ArchivedSimAnalysis {
    id: string;
    type: 'simulation';
    input: PredictiveOverrideInput;
    output: PredictiveOverrideOutput;
    timestamp: Date;
}

type ArchivedAnalysis = ArchivedDiffAnalysis | ArchivedSimAnalysis;


const ImpactScore = ({ score }: { score: number }) => {
    const isPositive = score > 0;
    const isNegative = score < 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-muted-foreground';

    return (
        <div className={cn("flex items-center font-mono font-bold", color)}>
            <Icon className="h-4 w-4 mr-1" />
            {score > 0 ? `+${score}` : score}
        </div>
    )
}


export default function ArchiveClient() {
    const [analyses, setAnalyses] = useState<ArchivedAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user } = useUser();

    useEffect(() => {
        if (!isBrowser() || !user) {
            if (!isBrowser()) setLoading(false);
            return;
        } 

        const diffQuery = query(collection(db, "diff_analysis"), orderBy("timestamp", "desc"));
        const simQuery = query(collection(db, "simulation_analysis"), orderBy("timestamp", "desc"));

        const unsubDiff = onSnapshot(diffQuery, (snapshot) => {
            const diffs = snapshot.docs.map(doc => {
                 const data = doc.data();
                return {
                    id: doc.id,
                    type: 'diff' as const,
                    snapshotA: data.snapshotA,
                    snapshotB: data.snapshotB,
                    analysis: data.analysis,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                }
            });
            
            setAnalyses(current => {
                const otherAnalyses = current.filter(a => a.type !== 'diff');
                const combined = [...diffs, ...otherAnalyses].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
                return combined;
            });
            setLoading(false);
        }, (error) => {
             toast({ variant: "destructive", title: "Fetch Error", description: "Could not fetch diff analyses."});
             console.error("Error fetching diff analyses:", error);
             setLoading(false);
        });

        const unsubSim = onSnapshot(simQuery, (snapshot) => {
            const sims = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: 'simulation' as const,
                    input: data.input,
                    output: data.output,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                }
            });
            
             setAnalyses(current => {
                const otherAnalyses = current.filter(a => a.type !== 'simulation');
                const combined = [...sims, ...otherAnalyses].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
                return combined;
            });
            setLoading(false);
        }, (error) => {
             toast({ variant: "destructive", title: "Fetch Error", description: "Could not fetch simulation analyses."});
             console.error("Error fetching simulation analyses:", error);
             setLoading(false);
        });


        return () => {
            unsubDiff();
            unsubSim();
        }
    }, [toast, user]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    if (analyses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Archive Empty</CardTitle>
                    <CardDescription>No snapshot diffs or simulations have been saved yet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">Run a simulation or diff and save it to see it here.</p>
                </CardContent>
            </Card>
        );
    }

    const renderDiffContent = (item: ArchivedDiffAnalysis) => (
        <div className="space-y-6 pt-4">
            <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Comparison Summary
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                    {item.analysis.comparisonSummary}
                </p>
            </div>
            <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <GitCompareArrows className="h-5 w-5" />
                    Key Differences
                </h3>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                    {item.analysis.keyDifferences.map((diff, index) => (
                    <li key={index}>{diff}</li>
                    ))}
                </ul>
            </div>
            <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <ChevronsRight className="h-5 w-5" />
                    Strategic Shift
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                    {item.analysis.strategicShift}
                </p>
            </div>
        </div>
    );
    
    const renderSimContent = (item: ArchivedSimAnalysis) => (
         <div className="space-y-6 pt-4">
            <div>
                <h3 className="font-semibold">Scenario Details</h3>
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                    <p><strong>Target Domain:</strong> {item.input.targetDomain}</p>
                    <p><strong>Action:</strong> <span className="font-mono">{item.input.action}</span></p>
                    <p><strong>Rationale:</strong> "{item.input.rationale}"</p>
                </div>
            </div>
             <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Overall Assessment</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{item.output.overallAssessment}</p>
            </div>
            <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Predicted Impacts</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {item.output.predictedImpacts.map(impact => (
                        <div key={impact.metric} className="p-3 rounded-md bg-muted/30">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-semibold">{impact.metric}</h4>
                                <ImpactScore score={impact.impactScore} />
                            </div>
                            <p className="text-xs text-muted-foreground">{impact.justification}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );

    return (
        <Accordion type="multiple" className="w-full space-y-4">
            {analyses.map((item) => (
                <AccordionItem value={item.id} key={item.id} className="border bg-card rounded-lg px-4">
                    <AccordionTrigger>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left">
                           {item.type === 'diff' ? <GitCompareArrows className="h-6 w-6 text-accent hidden md:block" /> : <TestTube className="h-6 w-6 text-accent hidden md:block" />}
                           <div>
                                <h3 className="font-semibold">
                                    {item.type === 'diff' ? `${item.snapshotA} vs. ${item.snapshotB}` : `Simulation: ${item.input.action}`}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Analyzed on {item.timestamp?.toLocaleString() || '...'}
                                </p>
                           </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {item.type === 'diff' ? renderDiffContent(item) : renderSimContent(item)}
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
