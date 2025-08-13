
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { firestore } from "@/lib/firebaseConfig";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { useUser } from "@/hooks/use-user";
import { isBrowser } from "@/lib/env-check";

interface ForecastAnalysis {
    id: string;
    timestamp: Date;
    accuracyScore?: number;
    volatilityScore?: number;
    strategicNotes?: string;
}

const CustomTooltip = React.memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-2 bg-card border border-border rounded-lg shadow-lg max-w-xs">
        <p className="label text-sm text-foreground font-semibold">{`${label}`}</p>
        {data.accuracy && <p className="intro text-primary font-semibold">{`Accuracy: ${(data.accuracy).toFixed(2)}%`}</p>}
        {data.volatility !== undefined && <p className="intro text-yellow-400 font-semibold">{`Volatility: ${data.volatility}`}</p>}
        {data.notes && <p className="desc text-muted-foreground text-xs mt-1">{data.notes}</p>}
      </div>
    );
  }
  return null;
});
CustomTooltip.displayName = 'CustomTooltip';


export default function ForecastMemoryMap() {
    const [analyses, setAnalyses] = useState<ForecastAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const { user } = useUser();

    useEffect(() => {
        if (!isBrowser() || !user) {
            setLoading(false);
            return;
        } 

        setLoading(true);
        const q = query(collection(firestore, "forecast_analysis"), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAnalyses = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                    accuracyScore: data.commentary?.accuracyScore,
                    volatilityScore: data.volatilityScore,
                    strategicNotes: data.commentary?.strategicNotes,
                };
            }).filter(a => a.accuracyScore !== undefined || a.volatilityScore !== undefined);
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
    }, [toast, user]);
    
    const chartData = useMemo(() => {
        return analyses.map(a => {
            const accuracy = a.accuracyScore ? parseFloat((a.accuracyScore * 100).toFixed(2)) : null;
            return {
                name: a.timestamp.toLocaleDateString(),
                accuracy,
                volatility: a.volatilityScore,
                notes: a.strategicNotes,
            }
        });
    }, [analyses]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="h-[500px]">
                    <Skeleton className="h-full w-full" />
                </CardContent>
            </Card>
        )
    }

    if (!user && !loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-6 w-6 text-accent" />Forecast Memory Map</CardTitle>
                    <CardDescription>Authentication required to view forecast analysis.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (analyses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-6 w-6 text-accent" />Forecast Memory Map</CardTitle>
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
                <CardDescription>Tracking rationale accuracy and volatility over time. Run the Volatility Indexer in Admin for full data.</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                        <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                        <Tooltip
                            content={<CustomTooltip />}
                        />
                        <Legend wrapperStyle={{paddingTop: '20px'}}/>
                        <defs>
                            <linearGradient id="volatilityGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke="hsl(var(--accent))" strokeWidth={2} activeDot={{ r: 8 }} dot={{ r: 4 }} name="Forecast Accuracy" />
                         <Area yAxisId="right" type="monotone" dataKey="volatility" fill="url(#volatilityGradient)" stroke="hsl(var(--chart-1))" name="Volatility Index" />
                    </ComposedChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
