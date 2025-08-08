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
import { Bot, GitCompareArrows, ChevronsRight, FileText } from "lucide-react";

interface ArchivedAnalysis {
    id: string;
    snapshotA: string;
    snapshotB: string;
    analysis: SnapshotDiffOutput;
    timestamp: Date;
}

export default function ArchiveClient() {
    const [analyses, setAnalyses] = useState<ArchivedAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const q = query(collection(db, "diff_analysis"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAnalyses = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    snapshotA: data.snapshotA,
                    snapshotB: data.snapshotB,
                    analysis: data.analysis,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                };
            });
            setAnalyses(fetchedAnalyses);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching analysis archive:", error);
            toast({
                variant: "destructive",
                title: "Fetch Error",
                description: "Could not fetch analysis archive.",
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        )
    }

    if (analyses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Archive Empty</CardTitle>
                    <CardDescription>No snapshot diff analyses have been saved yet.</CardDescription>
                </Header>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">Go to "Snapshots" &gt; "Diff Snapshots" to create and archive an analysis.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Accordion type="multiple" className="w-full space-y-4">
            {analyses.map((item) => (
                <AccordionItem value={item.id} key={item.id} className="border bg-card rounded-lg px-4">
                    <AccordionTrigger>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left">
                           <Bot className="h-6 w-6 text-accent hidden md:block" />
                           <div>
                                <h3 className="font-semibold">{item.snapshotA} vs. {item.snapshotB}</h3>
                                <p className="text-sm text-muted-foreground">
                                    Analyzed on {item.timestamp.toLocaleString()}
                                </p>
                           </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
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
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
