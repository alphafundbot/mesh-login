
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
  const isOverride =
    details.includes("Override: true") ||
    details.includes("STRATEGIST_OVERRIDE") ||
    details.startsWith("Action: ");

  const rationaleMatch = details.match(/Rationale: "([^"]*)"/i);
  const rationale = rationaleMatch ? rationaleMatch[1] : "";

  let action = "";
  const actionMatch = details.match(/Action: ([^ ]*)/i);
  if (actionMatch) {
    action = actionMatch[1].replace(/\"/g, '');
  } else if (details.startsWith("Event: Strategist Override Initiated")) {
    action = "Override Initiated";
  }

  const severityMatch = details.match(/Severity: (Warning|Critical|Catastrophic)/i);
  let severity = severityMatch ? (severityMatch[1] as Severity) : undefined;
  if (!severity) {
    const eventSeverityMatch = details.match(
      /Acknowledged (Warning|Critical|Catastrophic) event/
    );
     if (eventSeverityMatch) {
      severity = eventSeverityMatch[1] as Severity;
    }
  }

  let domains: string[] | undefined;
  // Regex to find domains after "on", "involving", or "for"
  const domainsMatch = details.match(/(?:on|involving|for) ([\w\s,&\-()]+?)(?:\. Severity:|,| with| due| for)/i);
  
  if (domainsMatch && domainsMatch[1]) {
    domains = domainsMatch[1].split(',').map(d => d.trim().replace(/\.$/, ''));
  } else {
    // Fallback for simple "on <Domain>:"
    const onDomainMatch = details.match(/on (.*?):/);
     if (onDomainMatch) {
       domains = onDomainMatch[1].split(', ').map(d => d.trim());
     }
  }
  
  // A special case for STRATEGIST_RESPONSE
   if (details.includes("Responded with")) {
    const onDomainMatch = details.match(/on (.*?):/);
     if (onDomainMatch) {
       domains = onDomainMatch[1].split(', ').map(d => d.trim());
     }
  }


  return { isOverride, rationale, action, severity, domains };
};

    
