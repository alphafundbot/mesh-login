
"use client";

import { useMemo } from 'react';
import type { ActionLog, Severity, TaggedRationale, ClusterInfo } from '@/lib/types';
import { parseDetails, RISK_WEIGHTS } from '@/lib/types';


export function useClusterMomentum(cluster: ClusterInfo | undefined, previousLogs: ActionLog[]): {
  riskDelta: number;
  previousScore: number;
} {
    const momentum = useMemo(() => {
        if (!cluster) {
            return { riskDelta: 0, previousScore: 0 };
        }
        
        if (!previousLogs || previousLogs.length === 0) {
            return { riskDelta: cluster.riskScore, previousScore: 0 };
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
            // This is a simple heuristic. A more robust solution might use embeddings.
            if (tagKeywords.every(kw => rationaleText.includes(kw))) {
                 previousScore += RISK_WEIGHTS[r.severity!];
            }
        });

        const riskDelta = cluster.riskScore - previousScore;

        return { riskDelta, previousScore };
    }, [cluster, previousLogs]);

    return momentum;
}

    