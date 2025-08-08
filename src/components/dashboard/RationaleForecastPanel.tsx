
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp, addDoc, serverTimestamp } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { Lightbulb, ArrowUp, ArrowDown } from "lucide-react";
import {
  forecastRationales,
  type RationaleForecastOutput,
} from "@/ai/flows/rationale-forecast-flow";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import type { ActionLog } from "@/app/history/HistoryClient";
import { tagRationale } from "@/ai/flows/rationale-tagging-flow";

type Severity = "Warning" | "Critical" | "Catastrophic";

interface TaggedRationale {
    rationale: string;
    tags: string[];
    severity: Severity;
    domains: string[];
}

const parseDetails = (details: string): { isOverride: boolean; rationale: string; severity?: Severity; domains?: string[] } => {
    const isOverride = details.includes("Override: true");
    const rationaleMatch = details.match(/Rationale: "([^"]*)"/);
    const rationale = rationaleMatch ? rationaleMatch[1] : "";
    let severity = (details.match(/Severity: (Warning|Critical|Catastrophic)/)?.[1] as Severity) || undefined;
    if (!severity) {
        const eventSeverityMatch = details.match(/Acknowledged (Warning|Critical|Catastrophic) event/);
        if (eventSeverityMatch) severity = eventSeverityMatch[1] as Severity;
    }
    const domainsMatch = details.match(/involving (.*?)\./);
    const domains = domainsMatch ? domainsMatch[1].split(', ') : [];
    return { isOverride, rationale, severity, domains };
};

const RISK_WEIGHTS: Record<Severity, number> = { "Warning": 1, "Critical": 3, "Catastrophic": 5 };

export default function RationaleForecastPanel() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<RationaleForecastOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "hud_actions"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        setResult(null);
        setLoading(false);
        return;
      }
      
      const logs = snapshot.docs.map(doc => ({...doc.data(), id: doc.id, timestamp: (doc.data().timestamp as Timestamp)?.toDate() || new Date() })) as ActionLog[];
      
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const currentLogs = logs.filter(log => now - log.timestamp.getTime() < sevenDays);
      const previousLogs = logs.filter(log => {
          const logTime = log.timestamp.getTime();
          return (now - logTime >= sevenDays) && (now - logTime < 2 * sevenDays);
      });

      const allRationales = currentLogs.map(l => ({...l, parsed: parseDetails(l.details)}))
        .filter(l => l.parsed.isOverride && l.parsed.rationale && l.parsed.severity)
        .map(l => ({ rationale: l.parsed.rationale!, tags: [], severity: l.parsed.severity!, domains: l.parsed.domains! }));

      if (allRationales.length === 0) {
        setResult(null);
        setLoading(false);
        return;
      }

      const tagged = await Promise.all(allRationales.map(async r => ({ ...r, tags: (await tagRationale({ rationale: r.rationale })).tags })));

      const clusters = new Map<string, { riskScore: number; riskDelta: number; recentFrequency: number }>();
      
      tagged.forEach(item => {
        item.tags.forEach(tag => {
            if (!clusters.has(tag)) clusters.set(tag, { riskScore: 0, riskDelta: 0, recentFrequency: 0 });
            clusters.get(tag)!.recentFrequency++;
        });
      });

      const prevRationales = previousLogs.map(l => ({...l, parsed: parseDetails(l.details)}))
        .filter(l => l.parsed.isOverride && l.parsed.rationale && l.parsed.severity)
        .map(l => ({ rationale: l.parsed.rationale!, severity: l.parsed.severity! }));

      clusters.forEach((value, tag) => {
          const currentRisk = tagged.filter(r => r.tags.includes(tag)).reduce((acc, r) => acc + RISK_WEIGHTS[r.severity], 0);
          const prevRisk = prevRationales.filter(r => r.rationale.includes(tag)).reduce((acc, r) => acc + RISK_WEIGHTS[r.severity], 0);
          value.riskScore = currentRisk;
          value.riskDelta = currentRisk - prevRisk;
      });

      const feedbackQuery = query(collection(db, 'feedback'));
      const feedbackSnapshot = onSnapshot(feedbackQuery, async (snap) => {
        const feedbackSummary: Record<string, { up: number, down: number }> = {};
        snap.forEach(doc => {
            const data = doc.data();
            const text = data.recommendationText || `Rec ID: ${data.recommendationId}`;
            if (!feedbackSummary[text]) feedbackSummary[text] = { up: 0, down: 0 };
            if (data.rating === 'up') feedbackSummary[text].up++;
            else if (data.rating === 'down') feedbackSummary[text].down++;
        });
        
        try {
            const clusterMomentumVectors = Array.from(clusters.entries()).map(([tag, data]) => ({ tag, ...data }));
            const output = await forecastRationales({
              clusterMomentumVectors,
              strategistFeedbackSummary: feedbackSummary
            });
            setResult(output);
            
            // Persist the forecast to Firestore
            if (output && output.forecasts.length > 0) {
              const latestForecastQuery = query(collection(db, "forecast_analysis"), orderBy("timestamp", "desc"), limit(1));
              const latestForecastSnapshot = await getDocs(latestForecastQuery);
              if (latestForecastSnapshot.empty || JSON.stringify(latestForecastSnapshot.docs[0].data().forecast) !== JSON.stringify(output)) {
                  await addDoc(collection(db, "forecast_analysis"), {
                    forecast: output,
                    inputs: { clusterMomentumVectors, feedbackSummary },
                    timestamp: serverTimestamp(),
                  });
              }
            }

          } catch (error) {
            console.error("AI forecast failed:", error);
            toast({
              variant: "destructive",
              title: "Forecast Failed",
              description: "Could not retrieve AI rationale forecast.",
            });
          } finally {
            setLoading(false);
          }
      });
      return () => feedbackSnapshot();
    }, (error) => {
      console.error("Error fetching HUD actions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }
    
    if (!result || result.forecasts.length === 0) {
      return <p className="text-muted-foreground text-center py-4">No significant rationale patterns detected.</p>;
    }
    
    const sortedForecasts = [...result.forecasts].sort((a,b) => b.escalationProbability - a.escalationProbability);

    return (
        <div className="space-y-3">
            {sortedForecasts.map((forecast) => (
                <div key={forecast.rationaleTag} className="p-3 rounded-md bg-muted/30 transition-shadow duration-200 hover:shadow-md">
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
        </div>
    );
  }

  return (
    <Card className="h-full transition-shadow duration-300 hover:shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Lightbulb className="h-6 w-6 text-accent" />
                <CardTitle>Rationale Forecast</CardTitle>
            </div>
        </div>
        <CardDescription>
          AI-predicted trajectory of override rationales, weighted by momentum and strategist feedback.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
