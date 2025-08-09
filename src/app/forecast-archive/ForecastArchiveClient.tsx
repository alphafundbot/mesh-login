
"use client";

import { useState, useEffect } from "react";
import { firestore } from '@/lib/firebaseConfig';
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
import type { RationaleForecastOutput } from "@/ai/flows/rationale-forecast-flow";
import { Bot, Lightbulb, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { isBrowser } from "@/lib/env-check";

interface ArchivedForecast {
    id: string;
    forecast: RationaleForecastOutput;
    timestamp: Date;
}

export default function ForecastArchiveClient() {
    const [analyses, setAnalyses] = useState<ArchivedForecast[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const router = useRouter();
    const { user } = useUser();

    useEffect(() => {
        if (!isBrowser() || !user) {
            if (!isBrowser()) setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(collection(firestore, "forecast_analysis"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedAnalyses = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    forecast: data.forecast,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                };
            });
            setAnalyses(fetchedAnalyses);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching forecast archive:", error);
            toast({
                variant: "destructive",
                title: "Fetch Error",
                description: "Could not fetch forecast archive.",
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast, user]);

    const handleReplay = (timestamp: Date) => {
        const params = new URLSearchParams({
            time: "7d",
            startTime: timestamp.toISOString(),
        });
        router.push(`/history?${params.toString()}`);
    };


    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }
    
    if (!user && !loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Authentication Required</CardTitle>
                    <CardDescription>You must be logged in to view the forecast archive.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (analyses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Archive Empty</CardTitle>
                    <CardDescription>No rationale forecasts have been saved yet.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">Go to the main dashboard to generate forecasts, which will be archived here automatically.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Accordion type="multiple" className="w-full space-y-4">
            {analyses.map((item) => (
                <AccordionItem value={item.id} key={item.id} className="border bg-card rounded-lg px-4">
                    <AccordionTrigger>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-left">
                           <Bot className="h-6 w-6 text-accent hidden md:block" />
                           <div>
                                <h3 className="font-semibold">Rationale Forecast</h3>
                                <p className="text-sm text-muted-foreground">
                                    Generated on {item.timestamp.toLocaleString()}
                                </p>
                           </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-6 pt-4">
                             {item.forecast.forecasts.map((forecast) => (
                                <div key={forecast.rationaleTag} className="p-3 rounded-md bg-muted/30">
                                    <div className="flex justify-between items-start">
                                        <p className="font-semibold text-foreground capitalize">{forecast.rationaleTag}</p>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className={cn("gap-1.5", forecast.escalationProbability > 0.5 && "text-destructive")}>
                                                <ArrowUp className="h-3 w-3" />
                                                Escalate: {(forecast.escalationProbability * 100).toFixed(0)}%
                                            </Badge>
                                            <Badge variant="outline" className={cn("gap-1.5", forecast.suppressionLikelihood > 0.5 && "text-green-400")}>
                                                <ArrowDown className="h-3 w-3" />
                                                Suppress: {(forecast.suppressionLikelihood * 100).toFixed(0)}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{forecast.justification}</p>
                                </div>
                            ))}
                            <div className="flex justify-end pt-2">
                                <Button onClick={() => handleReplay(item.timestamp)} disabled={!user}>Replay & Compare</Button>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
