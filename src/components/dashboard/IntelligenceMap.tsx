
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { domainData } from "@/lib/domains";
import {
  analyzeCrossDomainIntelligence,
  type CrossDomainIntelligenceOutput,
} from "@/ai/flows/cross-domain-intelligence-flow";
import {
  Bot,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ShieldX,
  RefreshCw,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, doc, setDoc } from "firebase/firestore";
import { useUser } from "@/hooks/use-user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

// Generates sample logs for a given domain to simulate fetching real data
const generateDomainLogs = (domainName: string) => {
  const actions = [
    "CONFIG_UPDATE",
    "DEPLOY_SUCCESS",
    "SECURITY_SCAN",
    "USER_LOGIN",
    "API_ERROR",
    "ROLLBACK",
    "UNAUTHORIZED_ACCESS",
  ];
  const strategists = ["Nehemie", "Architect-02", "Operator-01", "Analyst-04"];

  let logs = `Action logs for domain: ${domainName}\n`;
  // Add some random errors to make anomalies more likely
  const errorChance = ["System Core", "Finance & Trading", "Medical & Bio"].includes(domainName.substring(domainName.indexOf(" ") + 1)) ? 0.6 : 0.2;
  for (let i = 0; i < 5 + Math.floor(Math.random() * 5); i++) {
    let action = actions[Math.floor(Math.random() * actions.length)];
    if (Math.random() < errorChance) {
      action = Math.random() > 0.5 ? "API_ERROR" : "UNAUTHORIZED_ACCESS";
    }
    const strategist = strategists[Math.floor(Math.random() * strategists.length)];
    const timestamp = new Date(
      Date.now() - Math.random() * 86400000
    ).toISOString();
    logs += `[${timestamp}] ${action} by ${strategist}\n`;
  }
  return logs;
};

const ANOMALY_THRESHOLD = 70;
type Severity = "Warning" | "Critical" | "Catastrophic";

interface EscalationDetails {
  severity: Severity;
  anomalousDomains: { domain: string; stability: number; security: number }[];
  action?: string;
}

const CustomTick = (props: any) => {
  const { x, y, payload } = props;
  const { value, isAnomaly } = payload;
  
  // Truncate long domain names
  const displayValue = value.length > 15 ? `${value.substring(0, 14)}…` : value;

  if (isAnomaly) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          dy={4}
          textAnchor="middle"
          fill="hsl(var(--destructive))"
          className="text-xs font-bold flex items-center"
        >
          <tspan x="0" dy="-0.5em">
            {displayValue}
          </tspan>
        </text>
        <AlertTriangle className="h-4 w-4 text-destructive" x="-7" y="10" />
      </g>
    );
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={4}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
        className="text-xs"
      >
        {displayValue}
      </text>
    </g>
  );
};

const SEVERITY_CONFIG = {
  Warning: { icon: AlertCircle, color: "text-yellow-500", badge: "secondary" },
  Critical: {
    icon: ShieldAlert,
    color: "text-orange-500",
    badge: "destructive",
  },
  Catastrophic: { icon: ShieldX, color: "text-red-500", badge: "destructive" },
};

const SEVERITY_RATIONALE_TEMPLATES: Record<Severity, string> = {
    Warning: "Acknowledged. Monitoring anomaly for further signal drift.",
    Critical: "Initiating response to prevent propagation of critical failure.",
    Catastrophic: "Initiating emergency rollback to restore mesh integrity.",
};

export default function IntelligenceMap() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const [escalation, setEscalation] = useState<EscalationDetails | null>(null);
  const [rationale, setRationale] = useState("");

  const { toast } = useToast();
  const { user } = useUser();

  const handleLogAction = async (action: string, details: string) => {
    try {
      await addDoc(collection(db, "hud_actions"), {
        action,
        role: user.role,
        strategist: user.name,
        timestamp: serverTimestamp(),
        details,
      });
    } catch (error) {
      console.error("Failed to log action:", error);
    }
  };

  const processAnalysis = useCallback((output: CrossDomainIntelligenceOutput) => {
      const dataWithAnomalies = output.metrics.map((metric) => ({
        ...metric,
        isAnomaly:
          metric.stability < ANOMALY_THRESHOLD ||
          metric.security < ANOMALY_THRESHOLD,
      }));

      setChartData(dataWithAnomalies);

      const anomalousDomains = dataWithAnomalies.filter((d) => d.isAnomaly);
      let severity: Severity | null = null;
      
      const coreAnomalies = anomalousDomains.filter(d => d.domain.includes("System Core")).length;

      if (anomalousDomains.length >= 5 || coreAnomalies > 0) {
        severity = "Catastrophic";
      } else if (anomalousDomains.length >= 3) {
        severity = "Critical";
      } else if (anomalousDomains.length >= 1) {
        severity = "Warning";
      }

      if (severity) {
        const details: EscalationDetails = {
          severity,
          anomalousDomains: anomalousDomains.map((d) => ({
            domain: d.domain,
            stability: d.stability,
            security: d.security,
          })),
        };
        setEscalation(details);
        handleLogAction(
          "AUTO_ESCALATE",
          `Severity: ${severity}. Anomalies detected in ${anomalousDomains
            .map((d) => d.domain)
            .join(", ")}.`
        );
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = doc(db, "intelligence_map_cache", "latest");
    const unsubscribe = onSnapshot(q, (doc) => {
        if (doc.exists()) {
            const latestCache = doc.data().analysis as CrossDomainIntelligenceOutput;
            processAnalysis(latestCache);
        }
        setLoading(false);
    }, (error) => {
        console.error("Failed to fetch cached analysis", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [processAnalysis]);


  const getAnalysis = async () => {
    setLoading(true);
    setEscalation(null);
    try {
      const domainLogs: Record<string, string> = {};
      const domainsToAnalyze = domainData;

      for (const domain of domainsToAnalyze) {
        domainLogs[domain.name] = generateDomainLogs(domain.name);
      }

      const output = await analyzeCrossDomainIntelligence({ domainLogs });
      
      await setDoc(doc(db, "intelligence_map_cache", "latest"), {
          analysis: output,
          timestamp: serverTimestamp(),
      });
      
      // The onSnapshot listener will pick up the new cache and update the UI
      
    } catch (error) {
      console.error("AI cross-domain analysis failed:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "Could not get AI analysis for the intelligence map.",
      });
    } finally {
      setLoading(false);
    }
  };


  const handleActionClick = (action: string) => {
    if (!escalation) return;
    const template = SEVERITY_RATIONALE_TEMPLATES[escalation.severity] || "";
    setRationale(template);
    setEscalation({ ...escalation, action });
  };
  
  const handleRationaleSubmit = () => {
    if (!escalation || !escalation.action) return;

    const defaultRationale = SEVERITY_RATIONALE_TEMPLATES[escalation.severity];
    const isOverridden = rationale !== defaultRationale;

    const details = `Action: ${escalation.action} on ${escalation.anomalousDomains.map(d => d.domain).join(', ')}. Severity: ${escalation.severity}. Rationale: "${rationale || "Not provided."}" Override: ${isOverridden}`;
    
    handleLogAction("STRATEGIST_RESPONSE", details);
    toast({
      title: "Action Confirmed",
      description: `Your response ('${escalation.action}') to the ${escalation.severity} event has been logged.`,
    });
    setEscalation(null);
    setRationale("");
  };

  const handleDismiss = () => {
    if (!escalation) return;
    const details = `Dismissed ${escalation.severity} escalation for ${escalation.anomalousDomains.map(d => d.domain).join(', ')}`;
    handleLogAction("DISMISS", details);
    setEscalation(null);
    setRationale("");
  }
  
  const renderActionButtons = () => {
    if (!escalation) return null;

    switch (escalation.severity) {
      case "Warning":
        return (
          <Button onClick={() => handleActionClick("Acknowledge")}>
            Acknowledge
          </Button>
        );
      case "Critical":
        return (
          <>
            <Button onClick={() => handleActionClick("Quarantine")}>
              Quarantine
            </Button>
            <Button onClick={() => handleActionClick("Rollback")}>
              Rollback
            </Button>
          </>
        );
      case "Catastrophic":
        return (
          <>
            <Button variant="destructive" onClick={() => handleActionClick("Rollback")}>
              Rollback
            </Button>
            <Button variant="destructive" onClick={() => handleActionClick("TAKE_ACTION")}>
              Take Action & Log
            </Button>
          </>
        );
      default:
        return (
          <Button onClick={() => handleActionClick("Acknowledge")}>
            Acknowledge
          </Button>
        );
    }
  };

  const SeverityIcon = escalation
    ? SEVERITY_CONFIG[escalation.severity].icon
    : React.Fragment;
  const severityConfig = escalation ? SEVERITY_CONFIG[escalation.severity] : null;

  return (
    <>
      <Card className="h-full transition-shadow duration-300 hover:shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-accent" />
              <CardTitle>Cross-Domain Intelligence</CardTitle>
            </div>
             <Button onClick={getAnalysis} disabled={loading} size="sm" variant="outline">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Synthesize Intelligence
            </Button>
          </div>
          <CardDescription>
            AI-synthesized mesh health across key domains. Anomalies are auto-escalated.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] w-full">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-full space-y-4">
                <Skeleton className="h-8 w-1/4 mx-auto" />
                <Skeleton className="h-[250px] w-full rounded-full" />
                <Skeleton className="h-8 w-3/4 mx-auto" />
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={chartData}
              >
                <defs>
                  <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <PolarGrid />
                <PolarAngleAxis dataKey="domain" tick={<CustomTick />} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                <Radar
                  name="Stability"
                  dataKey="stability"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorStability)"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Security"
                  dataKey="security"
                  stroke="hsl(var(--accent))"
                  fill="url(#colorSecurity)"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Activity"
                  dataKey="activity"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">No intelligence data available. Click "Synthesize" to generate.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {escalation && severityConfig && (
        <Dialog
          open={!!escalation}
          onOpenChange={(open) => !open && handleDismiss()}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle
                className={`flex items-center gap-2 ${severityConfig.color}`}
              >
                <SeverityIcon className="h-6 w-6" />
                {escalation.severity} Escalation Protocol
              </DialogTitle>
              <DialogDescription>
                The system has detected anomalies in{" "}
                {escalation.anomalousDomains.length} domains, requiring
                strategist attention.
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Anomalous Domains:</h4>
                  {escalation.anomalousDomains.map((d) => (
                    <div
                      key={d.domain}
                      className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                    >
                      <span>{d.domain}</span>
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            d.stability < ANOMALY_THRESHOLD
                              ? "destructive"
                              : "secondary"
                          }
                          className="w-24 justify-center"
                        >
                          Stability: {d.stability}
                        </Badge>
                        <Badge
                          variant={
                            d.security < ANOMALY_THRESHOLD
                              ? "destructive"
                              : "secondary"
                          }
                          className="w-24 justify-center"
                        >
                          Security: {d.security}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogDescription>
            </DialogHeader>

            {escalation.action ? (
              <div className="space-y-4 pt-4">
                 <h3 className="font-semibold">Log Rationale for: <Badge variant="destructive">{escalation.action}</Badge></h3>
                <Textarea
                  placeholder="Provide context for this action..."
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  className="min-h-[100px]"
                />
                 <DialogFooter>
                  <Button variant="outline" onClick={() => setEscalation({...escalation, action: undefined })}>Back</Button>
                  <DialogClose asChild>
                    <Button onClick={handleRationaleSubmit}>Submit Action</Button>
                  </DialogClose>
                </DialogFooter>
              </div>
            ) : (
               <DialogFooter>
                 <Button variant="outline" onClick={handleDismiss}>Dismiss</Button>
                 {renderActionButtons()}
               </DialogFooter>
            )}

          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
