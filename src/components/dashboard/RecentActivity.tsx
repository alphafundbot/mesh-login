
"use client";

import { useState, useEffect, useCallback } from "react";
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
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, getDocs, setDoc, doc, where } from "firebase/firestore";
import { useUser } from "@/hooks/use-user";
import { canUserPerform, type Action } from "@/lib/roles";

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
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AuditTrailAISummarizationOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchAndCacheSummary = useCallback(async (logs: string, logId: string) => {
    setLoading(true);
    try {
      const output = await auditTrailAISummarization({ auditLogs: logs });
      setResult(output);
      // Cache the new summary
      await setDoc(doc(db, "audit_log_cache", logId), {
        summary: output.summary,
        unusualActivities: output.unusualActivities,
        originalLogId: logId,
        timestamp: serverTimestamp(),
      });
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
  }, [toast]);
  

  useEffect(() => {
    const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, async (logSnapshot) => {
      if (logSnapshot.empty) {
        // If no logs, generate initial one
        const initialLogs = generateSampleLogs();
        const docRef = await addDoc(collection(db, "audit_logs"), { logs: initialLogs, timestamp: serverTimestamp() });
        fetchAndCacheSummary(initialLogs, docRef.id);
        return;
      }
      
      const latestLogDoc = logSnapshot.docs[0];
      const latestLogId = latestLogDoc.id;
      const latestLogData = latestLogDoc.data();

      // Check for a cached summary first
      const cacheQuery = query(collection(db, "audit_log_cache"), where("originalLogId", "==", latestLogId), limit(1));
      const cacheSnapshot = await getDocs(cacheQuery);

      if (!cacheSnapshot.empty) {
        const cachedData = cacheSnapshot.docs[0].data() as AuditTrailAISummarizationOutput;
        setResult(cachedData);
        setLoading(false);
      } else {
        // If no cache, fetch a new summary and cache it.
        fetchAndCacheSummary(latestLogData.logs, latestLogId);
      }

    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchAndCacheSummary, toast]);


  const handleRefresh = async (isStressTest: boolean) => {
    setLoading(true);
    setResult(null);
    const newLogs = generateSampleLogs(isStressTest);
    try {
      // Add new log, the listener will then pick it up, see no cache, and generate a new summary.
      await addDoc(collection(db, "audit_logs"), { logs: newLogs, timestamp: serverTimestamp() });
    } catch (error) {
      console.error("Error adding new log:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not trigger new activity.",
      });
      setLoading(false);
    }
  };

  const handleAction = async (action: Action) => {
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
  
  const renderActionButtons = () => (
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

  return (
    <Card className="transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-accent" />
          <CardTitle>Recent Activity (AI Summary)</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleRefresh(false)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Simulate Event
          </Button>
          <Button variant="destructive" size="sm" onClick={() => handleRefresh(true)} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Stress Test
          </Button>
        </div>
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
              {renderActionButtons()}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
