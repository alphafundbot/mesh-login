"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, XCircle, Bot } from "lucide-react";
import { checkApiHealth, type HealthCheckOutput } from "@/ai/flows/health-check-flow";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatusClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HealthCheckOutput | null>(null);

  async function handleTest() {
    setLoading(true);
    setResult(null);
    const apiResult = await checkApiHealth();
    setResult(apiResult);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connection Status</CardTitle>
          <CardDescription>
            Click the button below to perform a live test of the connection to the Gemini API using your configured API key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTest} disabled={loading}>
            {loading ? "Testing..." : "Test API Connection"}
          </Button>
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
  );
}
