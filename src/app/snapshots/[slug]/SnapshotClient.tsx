"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  analyzeSignalHistory,
  type AnalyzeSignalHistoryOutput,
} from "@/ai/flows/signal-intelligence-flow";
import { Bot, BrainCircuit, Lightbulb, History } from "lucide-react";
import type { Snapshot } from "@/lib/snapshots";

export default function SnapshotClient({ snapshot }: { snapshot: Snapshot }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AnalyzeSignalHistoryOutput | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getAnalysis = async () => {
      setLoading(true);
      try {
        const output = await analyzeSignalHistory({
          actionLogs: snapshot.data.logs,
        });
        setResult(output);
      } catch (error) {
        console.error("AI analysis failed:", error);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: "Could not get AI analysis for this snapshot.",
        });
      } finally {
        setLoading(false);
      }
    };
    getAnalysis();
  }, [snapshot, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Raw Signal History</CardTitle>
            <CardDescription>{snapshot.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Bot className="h-6 w-6" /> AI Synthesis
            </CardTitle>
            <CardDescription>
              The AI is analyzing the historical data to provide insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="h-5 w-5" /> Summary
              </h3>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" /> Patterns Detected
              </h3>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Lightbulb className="h-5 w-5" /> Recommendations
              </h3>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Raw Signal History</CardTitle>
          <CardDescription>{snapshot.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg overflow-x-auto">
            <code>{snapshot.data.logs}</code>
          </pre>
        </CardContent>
      </Card>
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <Bot className="h-6 w-6" /> AI Synthesis
            </CardTitle>
            <CardDescription>
              AI-generated analysis of the signal history from this event.
            </CardDescription>
          </Header>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <History className="h-5 w-5" />
                Summary
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {result.summary}
              </p>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <BrainCircuit className="h-5 w-5" />
                Patterns Detected
              </h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                {result.patterns.map((pattern, index) => (
                  <li key={index}>{pattern}</li>
                ))}
              </ul>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recommendations
              </h3>
              <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                {result.recommendations.map((rec) => (
                  <li key={rec.recommendationId}>{rec.text}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}