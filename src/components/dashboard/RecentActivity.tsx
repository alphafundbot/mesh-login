
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, AlertTriangle, CornerDownRight, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import {
  auditTrailAISummarization,
  type AuditTrailAISummarizationOutput,
} from "@/ai/flows/audit-trail-ai";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

// Sample data to simulate a live log feed for the dashboard
const sampleLogs = `
[2025-08-07T20:10:01Z] CONFIG_UPDATE: user=admin, module=VaultOperations
[2025-08-07T20:10:03Z] PORT_SCAN: source=127.0.0.1, ports=3000-3010
[2025-08-07T20:10:05Z] UNAUTHORIZED_ACCESS: user=guest, module=SignalRouter
[2025-08-07T20:11:15Z] API_CALL: service=Finance, endpoint=/api/v1/ledger, status=200
[2025-08-07T20:12:00Z] LOGIN_SUCCESS: user=strategist, ip=192.168.1.100
`;

export default function RecentActivity() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AuditTrailAISummarizationOutput | null>(null);
  const { toast } = useToast();

  const fetchActivity = async () => {
    setLoading(true);
    setResult(null);
    try {
      const output = await auditTrailAISummarization({ auditLogs: sampleLogs });
      setResult(output);
    } catch (error) {
      console.error("AI summarization failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch AI summary for recent activity.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  const handleAction = (action: string) => {
    toast({
      title: "Action Initiated",
      description: `${action} protocol has been initiated.`,
    });
  };

  return (
    <div className="space-y-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-accent" />
            <CardTitle>Recent Activity (AI Summary)</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={fetchActivity} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
             <>
              <div>
                <h3 className="font-semibold mb-2">Summary:</h3>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
              <div className="border-t border-border pt-4">
                 <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Unusual Activity Detected:
                </h3>
                <div className="space-y-2">
                   <Skeleton className="h-4 w-full" />
                   <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </>
          )}

          {result && !loading && (
            <>
              <div>
                <h3 className="font-semibold mb-2">Summary:</h3>
                <p className="text-muted-foreground">{result.summary}</p>
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Unusual Activity Detected:
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {result.unusualActivities}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button variant="destructive" size="sm" onClick={() => handleAction("Escalate")}>
                    <CornerDownRight className="mr-2 h-4 w-4" />
                    Escalate
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleAction("Quarantine")}>
                    <CornerDownRight className="mr-2 h-4 w-4" />
                    Quarantine
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleAction("Rollback")}>
                    <CornerDownRight className="mr-2 h-4 w-4" />
                    Rollback
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
