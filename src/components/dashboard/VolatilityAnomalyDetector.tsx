
"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, Timestamp, limit } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Zap, AlertTriangle, ChevronRight } from "lucide-react";
import { detectVolatilityAnomalies, type VolatilityAnomalyOutput } from "@/ai/flows/volatility-anomaly-flow";
import { Badge } from "../ui/badge";

interface ForecastData {
    id: string;
    timestamp: string;
    volatilityScore: number;
}

export default function VolatilityAnomalyDetector() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<VolatilityAnomalyOutput | null>(null);
    const { toast } = useToast();

    const handleDetection = async () => {
        setLoading(true);
        setResult(null);
        try {
            const q = query(
                collection(db, "forecast_analysis"), 
                orderBy("timestamp", "asc"),
                // Limit to recent 50 to avoid overly large payloads
                // A real-world app might use pagination or more complex server-side aggregation
                limit(50) 
            );
            const snapshot = await getDocs(q);

            if (snapshot.empty || snapshot.docs.length < 2) {
                toast({ title: "Not Enough Data", description: "Need at least two historical forecasts with volatility scores to detect anomalies." });
                setLoading(false);
                return;
            }

            const historicalData: ForecastData[] = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    if (data.volatilityScore === undefined || data.volatilityScore === null) return null;
                    return {
                        id: doc.id,
                        timestamp: (data.timestamp as Timestamp).toDate().toISOString(),
                        volatilityScore: data.volatilityScore
                    }
                })
                .filter((item): item is ForecastData => item !== null);

            const aiResult = await detectVolatilityAnomalies({ historicalData });
            setResult(aiResult);
             toast({ title: "Detection Complete", description: `Found ${aiResult.anomalies.length} potential anomalies.` });

        } catch (error) {
            console.error("Volatility anomaly detection failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: "destructive",
                title: "Detection Failed",
                description: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-accent" /> Volatility Anomaly Detector
                </CardTitle>
                <CardDescription>
                    Use AI to scan for significant spikes in forecast volatility that may signal emergent risks.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button onClick={handleDetection} disabled={loading} className="w-full">
                    {loading ? "Analyzing..." : "Scan for Anomalies"}
                </Button>

                {loading && (
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                )}
                
                {result && !loading && (
                    <div className="space-y-2 pt-4">
                        {result.anomalies.length > 0 ? (
                            result.anomalies.map(anomaly => (
                                <div key={anomaly.forecastId} className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="font-semibold flex items-center gap-2 text-destructive">
                                            <AlertTriangle className="h-4 w-4" />
                                            Anomaly Detected
                                        </div>
                                        <Badge variant="destructive">Score: {anomaly.volatilityScore}</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{anomaly.insight}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Forecast Date: {new Date(anomaly.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No significant anomalies detected in the last 50 forecasts.</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
