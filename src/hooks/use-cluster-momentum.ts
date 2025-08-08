
"use client";

import { useMemo } from 'react';

// These types and helpers need to be consistent with HistoryClient.tsx
type Severity = "Warning" | "Critical" | "Catastrophic";

interface TaggedRationale {
    rationale: string;
    tags: string[];
    severity: Severity;
    domains: string[];
}

interface ActionLog {
  id: string;
  details: string;
  timestamp: Date;
  action: string;
  role: string;
  strategist: string;
}

const parseDetails = (details: string): { isOverride: boolean; rationale: string; severity?: Severity; domains?: string[] } => {
    const isOverride = details.includes("Override: true");
    const rationaleMatch = details.match(/Rationale: "([^"]*)"/);
    const rationale = rationaleMatch ? rationaleMatch[1] : "";
    
    let severity: Severity | undefined;
    const severityMatch = details.match(/Severity: (Warning|Critical|Catastrophic)/);
    if (severityMatch) {
      severity = severityMatch[1] as Severity;
    } else {
        const eventSeverityMatch = details.match(/Acknowledged (Warning|Critical|Catastrophic) event/);
        if (eventSeverityMatch) {
            severity = eventSeverityMatch[1] as Severity;
        }
    }
    
    const domainsMatch = details.match(/involving (.*?)\./);
    const domains = domainsMatch ? domainsMatch[1].split(', ') : [];

    return { isOverride, rationale, severity, domains };
}


const RISK_WEIGHTS: Record<Severity, number> = {
    "Warning": 1,
    "Critical": 3,
    "Catastrophic": 5
};

type DomainMetrics = { 
    count: number; 
    severities: Record<Severity, number>;
};

type ClusterInfo = {
    tag: string;
    items: TaggedRationale[];
    severities: Record<Severity, number>;
    domains: Record<string, DomainMetrics>;
    riskScore: number;
};

type ClusterMap = Map<string, ClusterInfo>;


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
            cluster.severities[item.severity]++;
            item.domains.forEach(domain => {
                if (!cluster.domains[domain]) {
                    cluster.domains[domain] = { count: 0, severities: { "Warning": 0, "Critical": 0, "Catastrophic": 0 } };
                }
                cluster.domains[domain].count++;
                cluster.domains[domain].severities[item.severity]++;
            });
        })
    });

    clusters.forEach(cluster => {
        let score = 0;
        score += cluster.severities.Warning * RISK_WEIGHTS.Warning;
        score += cluster.severities.Critical * RISK_WEIGHTS.Critical;
        score += cluster.severities.Catastrophic * RISK_WEIGHTS.Catastrophic;
        cluster.riskScore = score;
    });

    return clusters;
};


export function useClusterMomentum(cluster: ClusterInfo | undefined, previousLogs: ActionLog[]): {
  riskDelta: number;
  previousScore: number;
} {
    const momentum = useMemo(() => {
        if (!cluster || !previousLogs || previousLogs.length === 0) {
            return { riskDelta: 0, previousScore: 0 };
        }

        const tagKeywords = cluster.tag.split(' ');
        
        const matchingPrevRationales: TaggedRationale[] = previousLogs
            .map(log => ({ ...parseDetails(log.details), log }))
            .filter(d => 
                d.isOverride && 
                d.rationale && 
                d.severity && 
                d.domains &&
                tagKeywords.every(kw => d.rationale.toLowerCase().includes(kw.toLowerCase()))
            )
            .map(d => ({
                rationale: d.rationale!,
                severity: d.severity!,
                domains: d.domains!,
                tags: [cluster.tag] // Assign the current tag for clustering
            }));

        if (matchingPrevRationales.length === 0) {
            return { riskDelta: 0, previousScore: 0 };
        }

        const tempClusterMap = calculateClusters(matchingPrevRationales);
        const previousClusterInfo = tempClusterMap.get(cluster.tag);
        const previousScore = previousClusterInfo?.riskScore ?? 0;
        const riskDelta = cluster.riskScore - previousScore;

        return { riskDelta, previousScore };
    }, [cluster, previousLogs]);

    return momentum;
}
