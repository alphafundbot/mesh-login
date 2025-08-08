
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { TrendingUp, ShieldAlert, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import type { ActionLog, Severity } from "@/lib/types";
import { parseDetails, RISK_WEIGHTS } from "@/lib/types";

export default function HudEscalationMatrix() {
    const [logs, setLogs] = useState<ActionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const q = query(collection(db, "hud_actions"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLogs = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    action: data.action,
                    role: data.role,
                    strategist: data.strategist,
                    details: data.details,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                };
            });
            setLogs(fetchedLogs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching HUD actions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const escalationData = useMemo(() => {
        if (logs.length === 0) return {
            topDomain: "None",
            topDomainCount: 0,
            topDomainSeverity: undefined,
            riskDelta: 0,
        };

        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

        const currentLogs = logs.filter(log => log.timestamp.getTime() > sevenDaysAgo);
        const previousLogs = logs.filter(log => log.timestamp.getTime() <= sevenDaysAgo && log.timestamp.getTime() > fourteenDaysAgo);

        const criticalOverrides: Record<string, { count: number, severities: Record<Severity, number> }> = {};
        
        currentLogs.forEach(log => {
            const { isOverride, severity, domains } = parseDetails(log.details);
            if (isOverride && (severity === 'Critical' || severity === 'Catastrophic')) {
                domains?.forEach(domain => {
                    if (!criticalOverrides[domain]) {
                        criticalOverrides[domain] = { count: 0, severities: { "Warning": 0, "Critical": 0, "Catastrophic": 0 }};
                    }
                    criticalOverrides[domain].count++;
                    if(severity) criticalOverrides[domain].severities[severity]++;
                });
            }
        });
        
        const topCriticalDomain = Object.entries(criticalOverrides).sort((a, b) => b[1].count - a[1].count)[0];
        
        const getTopSeverity = (severities: Record<Severity, number>): Severity => {
            if (severities.Catastrophic > 0) return 'Catastrophic';
            if (severities.Critical > 0) return 'Critical';
            return 'Warning';
        }

        const calculateRisk = (logList: ActionLog[]) => logList.reduce((acc, log) => {
            const { severity, isOverride } = parseDetails(log.details);
            if(isOverride && severity && RISK_WEIGHTS[severity]) {
                return acc + RISK_WEIGHTS[severity];
            }
            return acc;
        }, 0);

        const currentRisk = calculateRisk(currentLogs);
        const previousRisk = calculateRisk(previousLogs);

        const delta = currentRisk - previousRisk;
        
        return {
            topDomain: topCriticalDomain ? topCriticalDomain[0] : "None",
            topDomainCount: topCriticalDomain ? topCriticalDomain[1].count : 0,
            topDomainSeverity: topCriticalDomain ? getTopSeverity(topCriticalDomain[1].severities) : undefined,
            riskDelta: delta,
        };
    }, [logs]);

    const handleInvestigate = () => {
        if (!escalationData || !escalationData.topDomain || !escalationData.topDomainSeverity) return;
        const params = new URLSearchParams({
            time: "7d",
            domain: escalationData.topDomain,
            severity: escalationData.topDomainSeverity,
            autostart: "true"
        });
        router.push(`/history?${params.toString()}`);
    }

    const renderContent = () => {
        if (loading) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                </div>
            );
        }

        if (!escalationData) {
             return <p className="text-muted-foreground text-center py-4">Awaiting data...</p>;
        }
        
        const isHighRisk = escalationData.riskDelta > 10 || escalationData.topDomainCount > 5;
        const hasCriticalOverrides = escalationData.topDomainCount > 0;

        return (
            <div className={cn("space-y-4 rounded-lg p-4 transition-colors duration-300 h-full flex flex-col justify-between", isHighRisk ? "bg-red-900/30 border border-destructive/50" : "bg-muted/20")}>
                <div>
                     <p className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className={cn("h-4 w-4", escalationData.riskDelta > 0 ? "text-destructive" : escalationData.riskDelta < 0 ? "text-green-400" : "text-muted-foreground")} />
                        7-Day Risk Delta: 
                        <span className={cn("font-bold font-mono", escalationData.riskDelta > 0 ? "text-destructive" : escalationData.riskDelta < 0 ? "text-green-400" : "text-muted-foreground")}>
                           {escalationData.riskDelta >= 0 && "+"}{escalationData.riskDelta}
                        </span>
                    </p>
                    <p className="text-xs text-muted-foreground">Change in weighted override risk vs previous period.</p>
                </div>
                
                {hasCriticalOverrides && (
                    <div className="cursor-pointer group" onClick={handleInvestigate}>
                        <p className="text-sm font-semibold flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-orange-400" />
                            Top Stress Zone: 
                            <span className="font-bold text-orange-400 group-hover:underline">{escalationData.topDomain}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">Domain with the most Critical/Catastrophic overrides.</p>
                    </div>
                )}

                 <Button onClick={handleInvestigate} variant="secondary" size="sm" className="w-full" disabled={!hasCriticalOverrides}>
                    Investigate in Signal Memory
                </Button>
            </div>
        );
    }

    return (
        <Card className="h-full transition-shadow duration-300 hover:shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-6 w-6 text-accent" />
                    Escalation Matrix
                </CardTitle>
                <CardDescription>
                    AI-surfaced view of critical system stress and risk trends.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
