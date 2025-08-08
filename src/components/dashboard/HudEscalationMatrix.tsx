
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
import Link from "next/link";

interface ActionLog {
  id: string;
  details: string;
  timestamp: Date;
}

type Severity = "Warning" | "Critical" | "Catastrophic";

interface ParsedDetails {
    isOverride: boolean;
    rationale: string;
    severity?: Severity;
    domains?: string[];
}

const parseDetails = (details: string): ParsedDetails => {
    const isOverride = details.includes("Override: true");
    const rationaleMatch = details.match(/Rationale: "([^"]*)"/);
    const rationale = rationaleMatch ? rationaleMatch[1] : "";
    const severityMatch = details.match(/Severity: (Warning|Critical|Catastrophic)/);
    const severity = severityMatch ? (severityMatch[1] as Severity) : undefined;
    const domainsMatch = details.match(/involving (.*?)\. Action:/);
    const domains = domainsMatch ? domainsMatch[1].split(', ') : undefined;

    return { isOverride, rationale, severity, domains };
}

const RISK_WEIGHTS: Record<Severity, number> = {
    "Warning": 1,
    "Critical": 3,
    "Catastrophic": 5
};

export default function HudEscalationMatrix() {
    const [logs, setLogs] = useState<ActionLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "hud_actions"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLogs = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
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
        if (logs.length === 0) return null;

        const now = Date.now();
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        const fourteenDaysAgo = now - 14 * 24 * 60 * 60 * 1000;

        const currentLogs = logs.filter(log => log.timestamp.getTime() > sevenDaysAgo);
        const previousLogs = logs.filter(log => log.timestamp.getTime() <= sevenDaysAgo && log.timestamp.getTime() > fourteenDaysAgo);

        const criticalOverrides: Record<string, number> = {};
        
        currentLogs.forEach(log => {
            const { isOverride, severity, domains } = parseDetails(log.details);
            if (isOverride && (severity === 'Critical' || severity === 'Catastrophic')) {
                domains?.forEach(domain => {
                    criticalOverrides[domain] = (criticalOverrides[domain] || 0) + 1;
                });
            }
        });
        
        const topCriticalDomain = Object.entries(criticalOverrides).sort((a, b) => b[1] - a[1])[0];
        
        const calculateRisk = (logs: ActionLog[]) => logs.reduce((acc, log) => {
            const { severity, isOverride } = parseDetails(log.details);
            return acc + (isOverride && severity ? RISK_WEIGHTS[severity] : 0);
        }, 0);

        const currentRisk = calculateRisk(currentLogs);
        const previousRisk = calculateRisk(previousLogs);

        const delta = currentRisk - previousRisk;
        const percentChange = previousRisk > 0 ? Math.round((delta / previousRisk) * 100) : (currentRisk > 0 ? 100 : 0);

        return {
            topDomain: topCriticalDomain ? topCriticalDomain[0] : "None",
            topDomainCount: topCriticalDomain ? topCriticalDomain[1] : 0,
            riskDelta: percentChange,
        };
    }, [logs]);

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

        if (!escalationData || (escalationData.topDomainCount === 0 && escalationData.riskDelta === 0)) {
            return <p className="text-muted-foreground text-center py-4">No significant escalation patterns detected in the last 7 days. System nominal.</p>;
        }
        
        const isHighRisk = escalationData.riskDelta > 20 || escalationData.topDomainCount > 5;

        return (
            <div className={cn("space-y-4 rounded-lg p-4", isHighRisk ? "bg-red-900/30 border border-destructive/50" : "bg-muted/20")}>
                <div>
                     <p className="text-sm font-semibold flex items-center gap-2">
                        <TrendingUp className={cn("h-4 w-4", escalationData.riskDelta > 0 ? "text-destructive" : "text-green-400")} />
                        7-Day Risk Delta: 
                        <span className={cn("font-bold", escalationData.riskDelta > 0 ? "text-destructive" : "text-green-400")}>
                           {escalationData.riskDelta >= 0 && "+"}{escalationData.riskDelta}%
                        </span>
                    </p>
                    <p className="text-xs text-muted-foreground">Change in weighted override risk vs previous period.</p>
                </div>
                <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-orange-400" />
                        Top Stress Zone: 
                        <span className="font-bold text-orange-400">{escalationData.topDomain}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Domain with the most Critical/Catastrophic overrides.</p>
                </div>
                 <Button asChild variant="secondary" size="sm" className="w-full">
                    <Link href="/history">
                        Investigate in Signal Memory
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <Card className="h-full">
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
