
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
  writeBatch,
  addDoc,
  serverTimestamp,
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
import { Bot, RefreshCw, History, Zap, BrainCircuit } from "lucide-react";
import {
  generateReplayCommentary,
  type ReplayCommentaryOutput,
} from "@/ai/flows/replay-commentary-flow";
import type { RationaleForecastOutput } from "@/ai/flows/rationale-forecast-flow";
import type { ActionLog } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

export default function AdminClient() {
  const [loadingBackfill, setLoadingBackfill] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(false);
  const [loadingInject, setLoadingInject] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const { toast } = useToast();

  const addLog = (message: string) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  const handleBackfill = async () => {
    setLoadingBackfill(true);
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
        setLoadingBackfill(false);
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
            .map(log => `[${(log.timestamp as any).toDate().toISOString()}] ${log.action} by ${log.role} '${log.strategist}': ${log.details}`)
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
      setLoadingBackfill(false);
    }
  };
  
  const handleIndexVolatility = async () => {
    setLoadingIndex(true);
    setProgress(0);
    setLogs([]);
    addLog("Starting forecast volatility indexing...");
    
    try {
        addLog("Querying for hydrated forecasts without volatility scores...");
        const forecastsQuery = query(
            collection(db, "forecast_analysis"),
            where("commentary", "!=", null),
            where("volatilityScore", "==", null)
        );
        const snapshot = await getDocs(forecastsQuery);
        const forecastsToIndex = snapshot.docs;

        if (forecastsToIndex.length === 0) {
            addLog("No forecasts found needing volatility indexing.");
            toast({ title: "Up to Date", description: "All forecasts are already indexed." });
            setLoadingIndex(false);
            return;
        }

        addLog(`Found ${forecastsToIndex.length} forecasts to index.`);
        
        const batch = writeBatch(db);
        forecastsToIndex.forEach((forecastDoc, i) => {
            const data = forecastDoc.data();
            const commentary = data.commentary as ReplayCommentaryOutput;
            
            const volatilityScore = commentary.divergenceMap.reduce((score, divergence) => {
                const pred = divergence.predicted.toLowerCase();
                const act = divergence.actual.toLowerCase();
                if ((pred.includes("escalate") && act.includes("suppress")) || (pred.includes("suppress") && act.includes("escalate"))) {
                    return score + 20;
                }
                return score + 10;
            }, 0);
            
            const cappedScore = Math.min(100, volatilityScore);
            
            const docRef = doc(db, "forecast_analysis", forecastDoc.id);
            batch.update(docRef, { volatilityScore: cappedScore });

            addLog(`Calculated volatility for forecast ${forecastDoc.id} as ${cappedScore}.`);
            setProgress(((i + 1) / forecastsToIndex.length) * 100);
        });

        await batch.commit();

        addLog(`Successfully indexed volatility for ${forecastsToIndex.length} forecasts.`);
        toast({
            title: "Indexing Complete",
            description: `Successfully indexed ${forecastsToIndex.length} forecasts.`,
        });

    } catch(error) {
        console.error("Volatility indexing failed:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        addLog(`ERROR: ${errorMessage}`);
        toast({
            variant: "destructive",
            title: "Indexing Failed",
            description: "Could not index volatility. Check console for details.",
        });
    } finally {
        setLoadingIndex(false);
    }
  };

  const handleInjectEpochs = async () => {
    setLoadingInject(true);
    setProgress(0);
    setLogs([]);
    addLog("Initiating Omega Epoch data injection...");

    const sampleEpochs = [
      {
        epoch: 1,
        meta_strategy: 'Liquidity Surge',
        capital_state: 'Volatile',
        cognition_loop: 'Capital influx triggered override momentum recalibration.'
      },
      {
        epoch: 2,
        meta_strategy: 'Defensive Mesh',
        capital_state: 'Stable',
        cognition_loop: 'Override dampeners engaged. Commentary replay paused.'
      },
      {
        epoch: 3,
        meta_strategy: 'Aggressive Expansion',
        capital_state: 'Critical',
        cognition_loop: 'Strategist override breached quota threshold. Escalation imminent.'
      }
    ];

    try {
        const collectionRef = collection(db, 'omega_epochs');
        for (let i = 0; i < sampleEpochs.length; i++) {
            const epoch = sampleEpochs[i];
            await addDoc(collectionRef, {
                ...epoch,
                timestamp: serverTimestamp(),
            });
            addLog(`Injected Epoch ${epoch.epoch}: ${epoch.meta_strategy}`);
            setProgress(((i + 1) / sampleEpochs.length) * 100);
        }
        addLog("Data injection complete.");
        toast({
            title: "Epochs Injected",
            description: `Successfully added ${sampleEpochs.length} sample epochs to Firestore.`
        });
    } catch (error) {
        console.error("Epoch injection failed:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        addLog(`ERROR: ${errorMessage}`);
        toast({
            variant: "destructive",
            title: "Injection Failed",
            description: "Could not inject sample epoch data.",
        });
    } finally {
        setLoadingInject(false);
    }
  }

  return (
    <div className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <Button onClick={handleBackfill} disabled={loadingBackfill || loadingIndex || loadingInject}>
                    <RefreshCw
                    className={`mr-2 h-4 w-4 ${loadingBackfill ? "animate-spin" : ""}`}
                    />
                    {loadingBackfill ? "Backfilling..." : "Start Backfill"}
                </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="h-6 w-6 text-accent" /> Forecast Volatility Indexer
                </CardTitle>
                <CardDescription>
                   Bulk-calculate and persist `volatilityScore` for all forecasts based on commentary divergence.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Button onClick={handleIndexVolatility} disabled={loadingIndex || loadingBackfill || loadingInject}>
                    <RefreshCw
                    className={`mr-2 h-4 w-4 ${loadingIndex ? "animate-spin" : ""}`}
                    />
                    {loadingIndex ? "Indexing..." : "Index Volatility"}
                </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BrainCircuit className="h-6 w-6 text-accent" /> Epoch Injection Engine
                </CardTitle>
                <CardDescription>
                   Inject sample Omega Epoch data into Firestore to populate the main dashboard stream.
                </CardDescription>
                </CardHeader>
                <CardContent>
                <Button onClick={handleInjectEpochs} disabled={loadingIndex || loadingBackfill || loadingInject}>
                    <RefreshCw
                    className={`mr-2 h-4 w-4 ${loadingInject ? "animate-spin" : ""}`}
                    />
                    {loadingInject ? "Injecting..." : "Inject Sample Data"}
                </Button>
                </CardContent>
            </Card>
        </div>
        
        {(loadingBackfill || loadingIndex || loadingInject) && (
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

    