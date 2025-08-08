"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface ForecastAnalysis {
    id: string;
    timestamp: Date;
    accuracyScore?: number;
    strategicNotes?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-card border border-border rounded-lg shadow-lg">
        <p className="label text-sm text-foreground">{`${label}`}</p>
        <p className="intro text-primary font-semibold">{`Accuracy: ${(data.accuracy).toFixed(2)}%`}</p>
        {data.notes && <p className="desc text-muted-foreground text-xs mt-1 max-w-xs">{data.notes}</p>}
      </div>
    );
  }

  return null;
};


export default function ForecastMemoryMap() {
    const [analyses, setAnalyses] = useState<ForecastAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const q = query(collection(db, "forecast_analysis"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAnalyses = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                    accuracyScore: data.commentary?.accuracyScore,
                    strategicNotes: data.commentary?.strategicNotes,
                };
            }).filter(a => a.accuracyScore !== undefined);
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
    
    const chartData = useMemo(() => {
        return analyses.map(a => ({
            name: a.timestamp.toLocaleDateString(),
            accuracy: a.accuracyScore ? parseFloat((a.accuracyScore * 100).toFixed(2)) : null,
            notes: a.strategicNotes
        }));
    }, [analyses]);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-96 w-full" />
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
                <CardDescription>Tracking rationale accuracy, volatility, and strategist divergence over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <Tooltip
                            content={<CustomTooltip />}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--accent))" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
