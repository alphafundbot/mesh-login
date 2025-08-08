
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Bot, AlertTriangle, CornerDownRight, RefreshCw, ShieldQuestion } from "lucide-react";
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
import { Badge } from "../ui/badge";

// Sample data to simulate a live log feed for the dashboard
const generateSampleLogs = () => {
  const users = ['admin', 'strategist', 'guest'];
  const modules = ['VaultOperations', 'SignalRouter', 'Finance', 'EcoMesh'];
  const actions = ['CONFIG_UPDATE', 'UNAUTHORIZED_ACCESS', 'API_CALL', 'LOGIN_SUCCESS', 'PORT_SCAN'];
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  const randomUser = users[Math.floor(Math.random() * users.length)];
  const randomModule = modules[Math.floor(Math.random() * modules.length)];
  const timestamp = new Date().toISOString();

  return `[${timestamp}] ${randomAction}: user=${randomUser}, module=${randomModule}`;
};


export default function RecentActivity() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AuditTrailAISummarizationOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchActivity = async (logs: string) => {
    setLoading(true);
    setResult(null);
    try {
      const output = await auditTrailAISummarization({ auditLogs: logs });
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
    const q = query(collection(db, "audit_logs"), orderBy("timestamp", "desc"), limit(1));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const latestLog = snapshot.docs[0].data();
        fetchActivity(latestLog.logs);
      } else {
        const initialLogs = generateSampleLogs();
        addDoc(collection(db, "audit_logs"), { logs: initialLogs, timestamp: serverTimestamp() });
      }
    }, (error) => {
      console.error("Firestore snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    const newLogs = generateSampleLogs();
    try {
      await addDoc(collection(db, "audit_logs"), { logs: newLogs, timestamp: serverTimestamp() });
      // The onSnapshot listener will automatically trigger fetchActivity
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
    <Card className="h-full transition-shadow duration-300 hover:shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-accent" />
          <CardTitle>Recent Activity (AI Summary)</CardTitle>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-2">
            <ShieldQuestion className="h-4 w-4"/>
            Role: {user.role}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Simulate Event
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
