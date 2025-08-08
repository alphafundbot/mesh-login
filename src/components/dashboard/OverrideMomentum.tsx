
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
import { useRouter } from "next/navigation";
import type { ActionLog, Severity, TaggedRationale, ClusterInfo, ClusterMap } from "@/lib/types";
import { parseDetails, RISK_WEIGHTS } from "@/lib/types";


const calculateClusters = (rationales: TaggedRationale[]): ClusterMap => {
    const clusters: ClusterMap = new Map();
    rationales.forEach(item => {
        item.tags.forEach(tag => {
            if (!clusters.has(tag)) {
                clusters.set(tag, { 
                    tag: tag,
                    items: [], 
                    severities: { "Warning": 0, "Critical": 0, "Catastrophic": 0 }, 
                    domains: {}, 
                    riskScore: 0 
                });
            }
            const cluster = clusters.get(tag)!;
            cluster.items.push(item);
            if(item.severity) cluster.severities[item.severity]++;
        });
    });
    clusters.forEach(cluster => {
        cluster.riskScore = (cluster.severities.Warning * RISK_WEIGHTS.Warning) + (cluster.severities.Critical * RISK_WEIGHTS.Critical) + (cluster.severities.Catastrophic * RISK_WEIGHTS.Catastrophic);
    });
    return clusters;
};

function ClusterMomentumItem({ cluster, previousLogs }: { cluster: ClusterInfo, previousLogs: ActionLog[] }) {
    const { riskDelta } = useClusterMomentum(cluster, previousLogs);
    const router = useRouter();

    if (riskDelta === 0) return null;

    const Arrow = riskDelta > 0 ? ArrowUp : ArrowDown;
    let color = "text-muted-foreground";
    if (riskDelta > 0) color = "text-red-400";
    if (riskDelta < 0) color = "text-green-400";
    
    const handleInvestigate = () => {
        const params = new URLSearchParams({
            time: "7d",
            autostart: "true",
            cluster: cluster.tag,
        });
        router.push(`/history?${params.toString()}`);
    }

    return (
        <div className="flex items-center justify-between p-2 rounded-md bg-muted/40 hover:bg-muted/80 cursor-pointer transition-colors duration-200" onClick={handleInvestigate}>
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
            const fetchedLogs = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    details: data.details,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                    action: data.action,
                    role: data.role,
                    strategist: data.strategist,
                }
            });
            setAllLogs(fetchedLogs);
            setLoading(false);
        }, () => setLoading(false));
        return () => unsubscribe();
    }, []);

    const { currentLogs, previousPeriodLogs } = useMemo(() => {
        const now = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        const current = allLogs.filter(log => now - log.timestamp.getTime() < sevenDays);
        const previous = allLogs.filter(log => {
            const logTime = log.timestamp.getTime();
            return (now - logTime >= sevenDays) && (now - logTime < 2 * sevenDays);
        });
        return { currentLogs: current, previousPeriodLogs: previous };
    }, [allLogs]);

    useEffect(() => {
        const processRationales = async () => {
            if (currentLogs.length === 0) {
                setGlobalClusters(new Map());
                return;
            };
            const rationales = currentLogs.map(l => ({ ...l, parsed: parseDetails(l.details) }))
                .filter(l => l.parsed.isOverride && l.parsed.rationale && l.parsed.severity)
                .map(l => ({ rationale: l.parsed.rationale!, tags: [], severity: l.parsed.severity!, domains: l.parsed.domains! }));
            
            try {
                const tagged = await Promise.all(rationales.map(async r => {
                    if(!r.rationale) return {...r, tags: []};
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
    
    const sortedClusters = useMemo(() => {
        if (globalClusters.size === 0) return [];
        return Array.from(globalClusters.values())
            .map(cluster => ({
                ...cluster,
                momentum: useClusterMomentum(cluster, previousPeriodLogs)
            }))
            .filter(c => c.momentum.riskDelta !== 0)
            .sort((a,b) => Math.abs(b.momentum.riskDelta) - Math.abs(a.momentum.riskDelta));
    }, [globalClusters, previousPeriodLogs]);

    if(loading) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        Top Override Momentum
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
             </Card>
        )
    }

    if(sortedClusters.length === 0) {
        return (
             <Card className="transition-shadow duration-300 hover:shadow-xl">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-accent" />
                        Top Override Momentum
                    </CardTitle>
                </CardHeader>
                 <CardContent>
                    <p className="text-sm text-muted-foreground text-center py-4">No significant override momentum detected.</p>
                 </CardContent>
            </Card>
        )
    }

    return (
         <Card className="transition-shadow duration-300 hover:shadow-xl">
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-accent" />
                    Top Override Momentum
                </CardTitle>
                <CardDescription className="text-xs">Clusters with the highest change in risk over the last 7 days. Click to investigate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {sortedClusters.slice(0, 5).map(cluster => (
                    <ClusterMomentumItem key={cluster.tag} cluster={cluster} previousLogs={previousPeriodLogs} />
                ))}
            </CardContent>
         </Card>
    )
}
