
"use client";

import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Bot, RefreshCw, History } from "lucide-react";
import {
  generateReplayCommentary,
  type ReplayCommentaryOutput,
} from "@/ai/flows/replay-commentary-flow";
import type { RationaleForecastOutput } from "@/ai/flows/rationale-forecast-flow";
import type { ActionLog } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { useUser } from "@/hooks/use-user";
import { isBrowser } from "@/lib/env-check";

export default function AdminClient() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useUser();

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const handleBackfill = async () => {
    if (!isBrowser() || !user) {
        toast({ title: "Error", description: "You must be logged in to perform this action."});
        return;
    }

    setLoading(true);
    setProgress(0);
    setLogs([]);
    addLog("Starting commentary backfill engine...");

    try {
      addLog("Querying for forecasts without commentary...");
      const forecastsQuery = query(
        collection(db, "forecast_analysis"),
        where("commentary", "==", null)
      );
      const forecastsSnapshot = await getDocs(forecastsQuery);
      const forecastsToProcess = forecastsSnapshot.docs;

      if (forecastsToProcess.length === 0) {
        addLog("No forecasts found needing commentary. Mesh memory is fully hydrated.");
        toast({ title: "Up to Date", description: "All forecasts already have commentary." });
        setLoading(false);
        return;
      }

      addLog(`Found ${forecastsToProcess.length} forecasts to process.`);

      for (let i = 0; i < forecastsToProcess.length; i++) {
        const forecastDoc = forecastsToProcess[i];
        const forecastData = forecastDoc.data();
        const forecastTimestamp = (forecastData.timestamp as Timestamp).toDate();
        const originalForecast = forecastData.forecast as RationaleForecastOutput;
        const forecastId = forecastDoc.id;

        addLog(`Processing forecast ${forecastId} from ${forecastTimestamp.toLocaleString()}...`);
        
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const logStartTime = new Date(forecastTimestamp.getTime());
        const logEndTime = new Date(logStartTime.getTime() + sevenDays);
        
        const logsQuery = query(
            collection(db, "hud_actions"),
            where("timestamp", ">=", logStartTime),
            where("timestamp", "<", logEndTime)
        );

        const logsSnapshot = await getDocs(logsQuery);
        const relevantLogs = logsSnapshot.docs.map(d => d.data() as ActionLog);

        if (relevantLogs.length === 0) {
            addLog(`No action logs found for forecast ${forecastId}. Skipping.`);
            setProgress(((i + 1) / forecastsToProcess.length) * 100);
            continue;
        }
        
        const logsString = relevantLogs
            .map(log => `[${(log.timestamp as any)?.toDate()?.toISOString() || ''}] ${log.action} by ${log.role} '${log.strategist}': ${log.details}`)
            .join("\n");
        
        addLog(`Found ${relevantLogs.length} logs. Generating AI commentary...`);

        const commentary = await generateReplayCommentary({
            originalForecast,
            actualLogs: logsString,
        });

        const forecastDocRef = doc(db, "forecast_analysis", forecastId);
        await updateDoc(forecastDocRef, { commentary });
        
        addLog(`Successfully generated and saved commentary for forecast ${forecastId}.`);
        setProgress(((i + 1) / forecastsToProcess.length) * 100);
      }

      addLog("Commentary backfill complete.");
      toast({
        title: "Backfill Complete",
        description: `Successfully processed ${forecastsToProcess.length} forecasts.`,
      });

    } catch (error) {
      console.error("Commentary backfill failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      addLog(`ERROR: ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Backfill Failed",
        description: "Could not backfill commentary. Check console for details.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-6 w-6 text-accent" /> Commentary Backfill Engine
          </CardTitle>
          <CardDescription>
            Automatically generate and persist replay commentary for all
            historical forecasts that lack it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleBackfill} disabled={loading || !user}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Backfilling..." : "Start Backfill"}
          </Button>
        </CardContent>
      </Card>
        
        {loading && (
            <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <Card className="max-h-60 overflow-y-auto bg-muted/50 p-4">
                    <pre className="text-xs font-mono text-muted-foreground">
                    <code>
                        {logs.map((log, i) => <p key={i}>{log}</p>)}
                    </code>
                    </pre>
                </Card>
            </div>
        )}
    </div>
  );
}
