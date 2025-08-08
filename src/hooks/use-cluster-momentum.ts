
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

export function useClusterMomentum(cluster: ClusterInfo | undefined, previousLogs: ActionLog[]): {
  riskDelta: number;
  previousScore: number;
} {
    const momentum = useMemo(() => {
        if (!cluster || !previousLogs || previousLogs.length === 0) {
            return { riskDelta: cluster?.riskScore || 0, previousScore: 0 };
        }

        const tagKeywords = cluster.tag.toLowerCase().split(' ');
        
        const previousRationales = previousLogs
            .map(log => ({ ...parseDetails(log.details), log }))
            .filter(d => 
                d.isOverride && 
                d.rationale && 
                d.severity
            );

        let previousScore = 0;
        
        previousRationales.forEach(r => {
            const rationaleText = r.rationale.toLowerCase();
            // Check if all keywords for the cluster tag are present in the rationale
            if (tagKeywords.every(kw => rationaleText.includes(kw))) {
                 previousScore += RISK_WEIGHTS[r.severity!];
            }
        });

        const riskDelta = cluster.riskScore - previousScore;

        return { riskDelta, previousScore };
    }, [cluster, previousLogs]);

    return momentum;
}
