
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Bot, History, Clock } from "lucide-react";
import { checkApiHealth, type HealthCheckOutput } from "@/ai/flows/health-check-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { firestore } from "@/lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from "firebase/firestore";
import { useUser } from "@/hooks/use-user";
import { isBrowser } from "@/lib/env-check";

type HistoricalCheck = HealthCheckOutput & {
  id: string;
  timestamp: Date;
}

export default function StatusClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthCheckOutput | null>(null);
  const [history, setHistory] = useState<HistoricalCheck[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    if (!isBrowser() || !user) {
        setLoadingHistory(false);
        return;
    }; 

    const q = query(collection(firestore, "health_checks"), orderBy("timestamp", "desc"), limit(10));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const historicalData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                status: data.status,
                message: data.message,
                timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
            }
        });
        setHistory(historicalData);
        setLoadingHistory(false);
    }, (error) => {
        console.error("Could not fetch health check history", error);
        setLoadingHistory(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function handleTest() {
    if (!isBrowser() || !user) return;
    setLoading(true);
    setResult(null);
    const apiResult = await checkApiHealth();
    setResult(apiResult);
    setLoading(false);
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Connection Status</CardTitle>
            <CardDescription>
              Click the button below to perform a live test of the connection to the Gemini API using your configured API key.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTest} disabled={loading || !user}>
              {loading ? "Testing..." : "Test API Connection"}
            </Button>
             {!user && <p className="text-xs text-muted-foreground mt-2">Please log in to run health checks.</p>}
          </CardContent>
        </Card>

        {loading && (
          <Alert>
              <Bot className="h-4 w-4 animate-spin" />
              <AlertTitle>Testing Connection...</AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-4 w-full" />
                </div>
              </AlertDescription>
          </Alert>
        )}

        {result && (
          <Alert
            variant={result.status === "Error" ? "destructive" : "default"}
            className={result.status === "OK" ? "border-green-500/50" : ""}
          >
            {result.status === "OK" ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {result.status === "OK"
                ? "Connection Successful"
                : "Connection Failed"}
            </AlertTitle>
            <AlertDescription className="whitespace-pre-wrap">{result.message}</AlertDescription>
          </Alert>
        )}
      </div>
      <div>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" /> Recent Checks
                </CardTitle>
                <CardDescription>History of the last 10 API health checks.</CardDescription>
            </CardHeader>
            <CardContent>
                {loadingHistory ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : history.length > 0 ? (
                    <div className="space-y-2">
                        {history.map(check => (
                            <div key={check.id} className="text-xs p-2 rounded-md bg-muted/50 flex items-start gap-2">
                               {check.status === 'OK' ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />}
                               <div>
                                  <p className="font-semibold">{check.status}</p>
                                  <p className="text-muted-foreground">{check.timestamp.toLocaleString()}</p>
                               </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">No historical data.</p>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
