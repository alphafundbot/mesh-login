
"use client"

import { useState, useEffect } from "react"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { domainData } from "@/lib/domains"
import { 
  analyzeCrossDomainIntelligence, 
  type CrossDomainIntelligenceOutput 
} from "@/ai/flows/cross-domain-intelligence-flow"
import { Bot, AlertTriangle } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useUser } from "@/hooks/use-user"
import { canUserPerform, type Action } from "@/lib/roles"

// Generates sample logs for a given domain to simulate fetching real data
const generateDomainLogs = (domainName: string) => {
    const actions = ["CONFIG_UPDATE", "DEPLOY_SUCCESS", "SECURITY_SCAN", "USER_LOGIN", "API_ERROR", "ROLLBACK", "UNAUTHORIZED_ACCESS"];
    const strategists = ["Nehemie", "Architect-02", "Operator-01", "Analyst-04"];
    
    let logs = `Action logs for domain: ${domainName}\n`;
    // Add some random errors to make anomalies more likely
    const errorChance = ["System Core", "Finance & Trading", "Medical & Bio"].includes(domainName) ? 0.6 : 0.2;
    for (let i = 0; i < 5 + Math.floor(Math.random() * 5); i++) {
        let action = actions[Math.floor(Math.random() * actions.length)];
        if (Math.random() < errorChance) {
            action = Math.random() > 0.5 ? "API_ERROR" : "UNAUTHORIZED_ACCESS";
        }
        const strategist = strategists[Math.floor(Math.random() * strategists.length)];
        const timestamp = new Date(Date.now() - Math.random() * 86400000).toISOString();
        logs += `[${timestamp}] ${action} by ${strategist}\n`;
    }
    return logs;
}

const ANOMALY_THRESHOLD = 70;
type Severity = "Warning" | "Critical" | "Catastrophic";

const CustomTick = (props: any) => {
  const { x, y, payload } = props;
  const { value, isAnomaly } = payload;
  
  if (isAnomaly) {
    return (
      <g transform={`translate(${x},${y})`}>
        <text dy={4} textAnchor="middle" fill="hsl(var(--destructive))" className="text-xs font-bold flex items-center">
            <tspan x="0" dy="-0.5em">{value}</tspan>
        </text>
        <AlertTriangle className="h-4 w-4 text-destructive" x="-7" y="10" />
      </g>
    );
  }
  
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={4} textAnchor="middle" fill="hsl(var(--muted-foreground))" className="text-xs">
        {value}
      </text>
    </g>
  );
};

export default function IntelligenceMap() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useUser();

  const handleAction = async (action: Action, details: string, severity?: Severity) => {
    try {
      await addDoc(collection(db, "hud_actions"), {
        action,
        role: user.role,
        strategist: "System",
        timestamp: serverTimestamp(),
        details,
      });

      if (action === "Escalate") {
        toast({
            variant: "destructive",
            title: `Risk Escalation Protocol Triggered (${severity})`,
            description: details,
        });
      }

    } catch (error) {
      console.error("Failed to log action:", error);
      toast({
        variant: "destructive",
        title: "Logging Failed",
        description: `Could not log action: ${action}`,
      });
    }
  };

  useEffect(() => {
    const getAnalysis = async () => {
      setLoading(true);
      try {
        const domainLogs: Record<string, string> = {};
        // We will analyze a subset of domains for clarity on the chart
        const domainsToAnalyze = domainData.filter(d => ["System Core", "Finance & Trading", "Security & Privacy", "Cloud & DevOps", "Telecom & IoT", "Medical & Bio"]);
        
        for (const domain of domainsToAnalyze) {
          domainLogs[domain.name] = generateDomainLogs(domain.name);
        }
        
        const output = await analyzeCrossDomainIntelligence({ domainLogs });

        const dataWithAnomalies = output.metrics.map(metric => ({
          ...metric,
          isAnomaly: metric.stability < ANOMALY_THRESHOLD || metric.security < ANOMALY_THRESHOLD,
        }));
        
        const anomalousDomains = dataWithAnomalies.filter(d => d.isAnomaly);
        let severity: Severity | null = null;

        if (anomalousDomains.length >= 5) {
            severity = 'Catastrophic';
        } else if (anomalousDomains.length >= 3) {
            severity = 'Critical';
        } else if (anomalousDomains.length >= 2) {
            severity = 'Warning';
        }

        if (severity) {
            const details = `Anomalies in ${anomalousDomains.map(d => d.domain).join(', ')}`;
            handleAction("Escalate", details, severity);
        }

        setChartData(dataWithAnomalies);
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
    getAnalysis();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-accent" />
            Cross-Domain Intelligence Map
        </CardTitle>
        <CardDescription>
          AI-synthesized view of system mesh health across key domains. Anomalies are highlighted and escalated automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-full space-y-4">
                  <Skeleton className="h-8 w-1/4 mx-auto" />
                  <Skeleton className="h-[300px] w-full rounded-full" />
                  <Skeleton className="h-8 w-3/4 mx-auto" />
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <defs>
                          <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                           <linearGradient id="colorSecurity" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="domain" tick={<CustomTick />} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Tooltip
                          contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              borderColor: 'hsl(var(--border))',
                          }}
                      />
                      <Legend wrapperStyle={{ fontSize: "14px" }}/>
                      <Radar name="Stability" dataKey="stability" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                      <Radar name="Security" dataKey="security" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.6} />
                      <Radar name="Activity" dataKey="activity" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.6} />
                  </RadarChart>
              </ResponsiveContainer>
            )}
        </div>
      </CardContent>
    </Card>
  )
}
