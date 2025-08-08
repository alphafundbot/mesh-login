
export type Severity = "Warning" | "Critical" | "Catastrophic";

export interface ActionLog {
  id: string;
  action: string;
  role: string;
  strategist: string;
  details: string;
  timestamp: Date;
}

export interface ParsedDetails {
    isOverride: boolean;
    rationale: string;
    action: string;
    severity?: Severity;
    domains?: string[];
}

export interface TaggedRationale {
    rationale: string;
    tags: string[];
    severity: Severity;
    domains: string[];
}

export type DomainMetrics = { 
    count: number; 
    severities: Record<Severity, number>;
};

export type ClusterInfo = {
    tag: string;
    items: TaggedRationale[];
    severities: Record<Severity, number>;
    domains: Record<string, DomainMetrics>;
    riskScore: number;
};

export type ClusterMap = Map<string, ClusterInfo>;


export const RISK_WEIGHTS: Record<Severity, number> = {
    "Warning": 1,
    "Critical": 3,
    "Catastrophic": 5
};

export interface Recommendation {
    recommendationId: string;
    text: string;
    confidence: number;
    basedOn: string[];
}


export const parseDetails = (details: string): ParsedDetails => {
    const isOverride = details.includes("Override: true");
    const rationaleMatch = details.match(/Rationale: "([^"]*)"/);
    const rationale = rationaleMatch ? rationaleMatch[1] : "";

    let action = "";
    const actionMatch = details.match(/Action: ([A-Za-z_]+)/);
    if (actionMatch) {
      action = actionMatch[1].replace(/_/g, " ");
    } else if (details.startsWith("Event: Strategist Override Initiated")) {
      action = "Override Initiated";
    }

    const severityMatch = details.match(/Severity: (Warning|Critical|Catastrophic)/);
    let severity = severityMatch ? (severityMatch[1] as Severity) : undefined;
    if (!severity) {
        const eventSeverityMatch = details.match(/Acknowledged (Warning|Critical|Catastrophic) event/);
        if (eventSeverityMatch) {
            severity = eventSeverityMatch[1] as Severity;
        }
    }
    
    const domainsMatch = details.match(/involving (.*?)\./);
    const domains = domainsMatch ? domainsMatch[1].split(', ') : undefined;

    return { isOverride, rationale, action, severity, domains };
}
