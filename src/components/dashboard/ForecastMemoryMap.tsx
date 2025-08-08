
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit } from "lucide-react";

// This is a simplified type for the initial scaffolding.
// It will be expanded as we build out the visualization.
interface ForecastAnalysis {
    id: string;
    timestamp: Date;
    // Add other relevant fields from your forecast_analysis documents here
    accuracyScore?: number;
    strategicNotes?: string;
}

export default function ForecastMemoryMap() {
    const [analyses, setAnalyses] = useState<ForecastAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const q = query(collection(db, "forecast_analysis"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAnalyses = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                    accuracyScore: data.commentary?.accuracyScore,
                    strategicNotes: data.commentary?.strategicNotes,
                };
            });
            setAnalyses(fetchedAnalyses);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching forecast analyses:", error);
            toast({
                variant: "destructive",
                title: "Fetch Error",
                description: "Could not fetch forecast memory data.",
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
        )
    }

    if (analyses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Forecast Memory Map</CardTitle>
                    <CardDescription>No forecast analysis data available yet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">Run some forecasts and replays to build the memory map.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-6 w-6 text-accent" />Forecast Memory Map</CardTitle>
                <CardDescription>Initial data scaffold. Visualization layer to be added in the next override.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {analyses.map(analysis => (
                    <div key={analysis.id} className="p-4 rounded-lg bg-muted/30">
                        <h3 className="font-semibold">Analysis from: {analysis.timestamp.toLocaleString()}</h3>
                        {analysis.accuracyScore !== undefined && (
                             <p className="text-sm text-muted-foreground">Accuracy Score: {(analysis.accuracyScore * 100).toFixed(0)}%</p>
                        )}
                        {analysis.strategicNotes && (
                            <blockquote className="mt-2 pl-4 border-l-2 border-border italic text-xs">
                                {analysis.strategicNotes}
                            </blockquote>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
