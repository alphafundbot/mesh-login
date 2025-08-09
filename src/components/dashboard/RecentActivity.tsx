
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Bot, AlertTriangle, CornerDownRight, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import {
  auditTrailAISummarization,
  type AuditTrailAISummarizationOutput,
} from "@/ai/flows/audit-trail-ai";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "firebase/firestore";
import { useUser } from "@/hooks/use-user";
import { canUserPerform, type Action } from "@/lib/roles";
import { isBrowser } from "@/lib/env-check";

const generateSampleLogs = (isStressTest: boolean = false) => {
  const users = ['admin', 'strategist', 'guest'];
  const modules = ['VaultOperations', 'SignalRouter', 'Finance', 'EcoMesh', 'SystemCore', 'MedicalVault'];
  const actions = ['CONFIG_UPDATE', 'UNAUTHORIZED_ACCESS', 'API_CALL', 'LOGIN_SUCCESS', 'PORT_SCAN', 'API_ERROR', 'ROLLBACK'];
  
  if (!isStressTest) {
    const randomAction = actions[Math.floor(Math.random() * actions.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomModule = modules[Math.floor(Math.random() * modules.length)];
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${randomAction}: user=${randomUser}, module=${randomModule}`;
  }

  let logs = "";
  const logCount = 5 + Math.floor(Math.random() * 5); // Generate 5-9 logs for a stress test
  for (let i = 0; i < logCount; i++) {
    const action = Math.random() > 0.4 ? actions[Math.floor(Math.random() * actions.length)] : 'API_ERROR';
    const user = users[Math.floor(Math.random() * users.length)];
    const module = modules[Math.floor(Math.random() * modules.length)];
    const timestamp = new Date(Date.now() - (logCount - i) * 1000).toISOString();
    
    if (i % 2 === 0) {
        logs += `[${timestamp}] UNAUTHORIZED_ACCESS: user=external_ip, module=${module}, severity=Critical\n`;
    } else {
        logs += `[${timestamp}] ${action}: user=${user}, module=${module}\n`;
    }
  }
  return logs;
};


export default function RecentActivity() {
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [result, setResult] = useState<AuditTrailAISummarizationOutput | null>(null);
  const [latestLog, setLatestLog] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: userLoading } = useUser();
  

  useEffect(() => {
    if (!isBrowser() || !user) {
      if(!isBrowser()) setLoadingLogs(false);
      return;
    }

    setLoadingLogs(true);
    const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, async (logSnapshot) => {
      if (logSnapshot.empty) {
        const initialLogs = generateSampleLogs();
        try {
            await addDoc(collection(db, "audit_logs"), { logs: initialLogs, timestamp: serverTimestamp() });
        } catch (e) {
            console.error("Failed to add initial audit log", e);
        }
        setLatestLog(initialLogs);
      } else {
         const latestLogDoc = logSnapshot.docs[0];
         const latestLogData = latestLogDoc.data();
         setLatestLog(latestLogData.logs);
      }
      setResult(null); 
      setLoadingLogs(false);
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      toast({
        variant: "destructive",
        title: "Firestore Error",
        description: "Could not fetch recent activity.",
      });
      setLoading(false);
      setLoadingLogs(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleAnalysis = async () => {
    if (!latestLog) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No logs available to analyze.",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const output = await auditTrailAISummarization({ auditLogs: latestLog });
      setResult(output);
    } catch (e) {
      const error = e as Error;
      console.error("AI summarization failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: error.message || "Failed to fetch AI summary for recent activity.",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleRefresh = async (isStressTest: boolean) => {
    if (!isBrowser() || !user) {
        toast({
            title: "Authentication Error",
            description: "You must be logged in to simulate events.",
            variant: "destructive",
        });
        return;
    }
    setLoadingLogs(true);
    setResult(null);
    const newLogs = generateSampleLogs(isStressTest);
    try {
      await addDoc(collection(db, "audit_logs"), { logs: newLogs, timestamp: serverTimestamp() });
    } catch (error) {
      console.error("Error adding new log:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not trigger new activity.",
      });
      setLoadingLogs(false);
    }
  };

  const handleAction = async (action: Action) => {
    if (!isBrowser() || !user) return;
    toast({
      title: "Action Initiated",
      description: `${action} protocol has been initiated by ${user.role}.`,
    });
    try {
      await addDoc(collection(db, "hud_actions"), {
        action,
        role: user.role,
        strategist: user.name,
        timestamp: serverTimestamp(),
        details: result ? `AI Detected Unusual Activity: "${result.unusualActivities}"` : "No details available"
      });
    } catch (error) {
      console.error("Failed to log action:", error);
      toast({
        variant: "destructive",
        title: "Logging Failed",
        description: `Could not log action: ${action}`,
      });
    }
  };
  
  const renderActionButtons = () => {
    if (userLoading || !user) return <Skeleton className="h-9 w-64" />;

    return (
        <div className="flex gap-2 mt-4">
        <Button variant="destructive" size="sm" onClick={() => handleAction("Escalate")} disabled={!canUserPerform(user.role, "Escalate")}>
            <CornerDownRight className="mr-2 h-4 w-4" />
            Escalate
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleAction("Quarantine")} disabled={!canUserPerform(user.role, "Quarantine")}>
            <CornerDownRight className="mr-2 h-4 w-4" />
            Quarantine
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleAction("Rollback")} disabled={!canUserPerform(user.role, "Rollback")}>
            <CornerDownRight className="mr-2 h-4 w-4" />
            Rollback
        </Button>
        </div>
    );
  };

  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl h-full">
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-accent" />
                <CardTitle>Recent Activity Log</CardTitle>
            </div>
            <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleRefresh(false)} disabled={loadingLogs || !user}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                Simulate Event
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleRefresh(true)} disabled={loadingLogs || !user}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loadingLogs ? 'animate-spin' : ''}`} />
                Stress Test
            </Button>
            </div>
        </div>
        <CardDescription>
          Live feed of system events. Use the AI to analyze for unusual activity.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingLogs ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <div>
            <pre className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg overflow-x-auto">
                <code>{latestLog}</code>
            </pre>
            <Button onClick={handleAnalysis} disabled={loading || !latestLog} className="mt-4">
                {loading ? "Analyzing..." : "Analyze with AI"}
            </Button>
          </div>
        )}

        {loading && (
           <div className="border-t border-border pt-4">
             <h3 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
               <AlertTriangle className="h-5 w-5" />
               AI Analysis:
             </h3>
             <div className="space-y-2">
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
             </div>
           </div>
        )}


        {result && !loading && (
          <div className="border-t border-border pt-4">
            <h3 className="font-semibold mb-2">AI Summary:</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
            
            <h3 className="font-semibold mt-4 mb-2 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Unusual Activity Detected:
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {result.unusualActivities}
            </p>
            {renderActionButtons()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
