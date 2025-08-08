
"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import { useClusterMomentum } from "@/hooks/use-cluster-momentum";
import { tagRationale } from "@/ai/flows/rationale-tagging-flow";

// Duplicating necessary types and functions from HistoryClient to make component standalone
type Severity = "Warning" | "Critical" | "Catastrophic";
interface ActionLog {
  id: string;
  details: string;
  timestamp: Date;
  action: string;
  role: string;
  strategist: string;
}
interface TaggedRationale {
    rationale: string;
    tags: string[];
    severity: Severity;
    domains: string[];
}
type ClusterMap = Map<string, {
    tag: string;
    items: TaggedRationale[];
    riskScore: number;
    severities: Record<Severity, number>;
    domains: Record<string, any>;
}>;
const parseDetails = (details: string): { isOverride: boolean; rationale: string; severity?: Severity; domains?: string[] } => {
    const isOverride = details.includes("Override: true");
    const rationaleMatch = details.match(/Rationale: "([^"]*)"/);
    const rationale = rationaleMatch ? rationaleMatch[1] : "";
    const severityMatch = details.match(/Severity: (Warning|Critical|Catastrophic)/);
    let severity = severityMatch ? (severityMatch[1] as Severity) : undefined;
    if (!severity) {
        const eventSeverityMatch = details.match(/Acknowledged (Warning|Critical|Catastrophic) event/);
        if (eventSeverityMatch) severity = eventSeverityMatch[1] as Severity;
    }
    const domainsMatch = details.match(/involving (.*?)\./);
    const domains = domainsMatch ? domainsMatch[1].split(', ') : [];
    return { isOverride, rationale, severity, domains };
};
const RISK_WEIGHTS: Record<Severity, number> = { "Warning": 1, "Critical": 3, "Catastrophic": 5 };
const calculateClusters = (rationales: TaggedRationale[]): ClusterMap => {
    const clusters: ClusterMap = new Map();
    rationales.forEach(item => {
        item.tags.forEach(tag => {
            if (!clusters.has(tag)) clusters.set(tag, { tag, items: [], severities: { "Warning": 0, "Critical": 0, "Catastrophic": 0 }, domains: {}, riskScore: 0 });
            const cluster = clusters.get(tag)!;
            cluster.items.push(item);
            cluster.severities[item.severity]++;
        });
    });
    clusters.forEach(cluster => {
        cluster.riskScore = (cluster.severities.Warning * RISK_WEIGHTS.Warning) + (cluster.severities.Critical * RISK_WEIGHTS.Critical) + (cluster.severities.Catastrophic * RISK_WEIGHTS.Catastrophic);
    });
    return clusters;
};

function ClusterMomentumItem({ cluster, previousLogs }: { cluster: any, previousLogs: ActionLog[] }) {
    const { riskDelta } = useClusterMomentum(cluster, previousLogs);
    const Arrow = riskDelta > 0 ? ArrowUp : ArrowDown;
    let color = "text-muted-foreground";
    if (riskDelta > 0) color = "text-green-400";
    if (riskDelta < 0) color = "text-red-400";

    return (
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/40">
            <span className="capitalize font-semibold text-sm">{cluster.tag}</span>
            <Badge variant="outline" className={cn("gap-1 font-mono text-xs", color)}>
                <Arrow className="h-3 w-3" />
                {riskDelta > 0 && "+"}{riskDelta.toFixed(0)} Risk
            </Badge>
        </div>
    )
}

export default function OverrideMomentum() {
    const [allLogs, setAllLogs] = useState<ActionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalClusters, setGlobalClusters] = useState<ClusterMap>(new Map());

    useEffect(() => {
        const q = query(collection(db, "hud_actions"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActionLog));
            setAllLogs(fetchedLogs);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const { currentLogs, previousLogs } = useMemo(() => {
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const current = allLogs.filter(log => now - new Timestamp(log.timestamp.seconds, log.timestamp.nanoseconds).toMillis() < sevenDays);
        const previous = allLogs.filter(log => {
            const logTime = new Timestamp(log.timestamp.seconds, log.timestamp.nanoseconds).toMillis();
            return (now - logTime >= sevenDays) && (now - logTime < 2 * sevenDays);
        });
        return { currentLogs: current, previousLogs: previous };
    }, [allLogs]);

    useEffect(() => {
        const processRationales = async () => {
            if (currentLogs.length === 0) {
                setGlobalClusters(new Map());
                return;
            };
            const rationales = currentLogs.map(l => ({ ...l, parsed: parseDetails(l.details) }))
                .filter(l => l.parsed.isOverride && l.parsed.rationale && l.parsed.severity)
                .map(l => ({ rationale: l.parsed.rationale, tags: [], severity: l.parsed.severity!, domains: l.parsed.domains! }));
            
            try {
                const tagged = await Promise.all(rationales.map(async r => {
                    const { tags } = await tagRationale({ rationale: r.rationale });
                    return { ...r, tags };
                }));
                setGlobalClusters(calculateClusters(tagged));
            } catch (e) {
                console.error("Failed to tag rationales for momentum", e);
            }
        };
        processRationales();
    }, [currentLogs]);
    
    const sortedClusters = useMemo(() => Array.from(globalClusters.values()).sort((a,b) => b.riskScore - a.riskScore), [globalClusters]);

    if(loading) return <Skeleton className="h-48 w-full" />
    if(sortedClusters.length === 0) return <p className="text-sm text-muted-foreground text-center py-4">No override clusters detected.</p>

    return (
         <Card>
            <CardHeader>
                <CardTitle className="text-base">Top Override Momentum</CardTitle>
                <CardDescription className="text-xs">Clusters with the highest change in risk.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {sortedClusters.slice(0, 5).map(cluster => (
                    <ClusterMomentumItem key={cluster.tag} cluster={cluster} previousLogs={previousLogs} />
                ))}
            </CardContent>
         </Card>
    )
}
