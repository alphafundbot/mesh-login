import { z } from 'zod';
// 🔐 Strategist Authentication Schemas
export const StrategistUserSchema = z.object({
 uid: z.string(),
 email: z.string().email(),
 displayName: z.string().optional(),
 photoURL: z.string().url().optional(),
 providerId: z.string(),
 lastLogin: z.string(), // ISO timestamp
});
export type StrategistUser = z.infer<typeof StrategistUserSchema>;

export const LoginPayloadSchema = z.object({
 email: z.string().email(),
 password: z.string().min(6),
});
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export const AuditEventSchema = z.object({
 eventType: z.string(),
 uid: z.string().optional(),
 email: z.string().optional(),
 error: z.string().optional(),
 timestamp: z.string(), // ISO timestamp
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

// ⚠️ Risk and Override Intelligence
export type Severity = "Warning" | "Critical" | "Catastrophic";

export const RISK_WEIGHTS: Record<Severity, number> = {
 "Warning": 1,
 "Critical": 3,
 "Catastrophic": 5,
};

export interface ParsedDetails {
 isOverride: boolean;
 rationale?: string;
 action?: string;
 severity?: Severity;
 domains?: string[];
}

export const parseDetails = (details: string): ParsedDetails => {
 const isOverride =
 details.includes("Override: true") ||
 details.includes("STRATEGIST_OVERRIDE") ||
 details.startsWith("Action: ");

 const rationaleMatch = details.match(/Rationale: "([^"]*)"/i);
 const rationale = rationaleMatch ? rationaleMatch[1] : undefined;

 let action: string | undefined = "";
 const actionMatch = details.match(/Action: ([^ ]*)/i);
 if (actionMatch) {
    action = actionMatch[1].replace(/"/g, '');
 } else if (details.startsWith("Event: Strategist Override Initiated")) {
    action = "Override Initiated";
 } else {
    action = undefined;
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
 const domainsMatch = details.match(/(?:on|involving|for) ([\w\s,&\-()\/]+?)(?:\. Severity:|,| with| due| for)/i);

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

// 🧠 Strategist Intelligence Structures
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

export interface Recommendation {
 recommendationId: string;
 text: string;
 confidence: number;
 basedOn: string[];
}

export interface ActionLog {
 id: string;
 action: string;
 role: string;
 strategist: string;
 details: string;
 timestamp: Date;
}
import { z } from 'zod';

import { logTelemetryEvent } from '../monitoring/LoginTelemetry';
// 🔐 Strategist Authentication Schemas
export const StrategistUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  providerId: z.string(),
  lastLogin: z.string(), // ISO timestamp
});
export type StrategistUser = z.infer<typeof StrategistUserSchema>;

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export const AuditEventSchema = z.object({
  eventType: z.string(),
  uid: z.string().optional(),
  email: z.string().optional(),
  error: z.string().optional(),
  timestamp: z.string(), // ISO timestamp
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

// ⚠️ Risk and Override Intelligence
export type Severity = "Warning" | "Critical" | "Catastrophic";

export const RISK_WEIGHTS: Record<Severity, number> = {
  "Warning": 1,
  "Critical": 3,
  "Catastrophic": 5,
};

export interface ParsedDetails {
  isOverride: boolean;
  rationale?: string;
  action?: string;
  severity?: Severity;
  domains?: string[];
}

export const parseDetails = (details: string): ParsedDetails => {
 logTelemetryEvent('parseDetails:start', { metadata: { details } });

  const isOverride =
    details.includes("Override: true") ||
    details.includes("STRATEGIST_OVERRIDE") ||
    details.startsWith("Action: ");

  const rationaleMatch = details.match(/Rationale: "([^"]*)"/i);
  const rationale = rationaleMatch ? rationaleMatch[1] : undefined;

  let action: string | undefined = "";
  const actionMatch = details.match(/Action: ([^ ]*)/i);
  if (actionMatch) {
    action = actionMatch[1].replace(/"/g, '');
  } else if (details.startsWith("Event: Strategist Override Initiated")) {
    action = "Override Initiated";
  } else {
    action = undefined;
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
  const domainsMatch = details.match(/(?:on|involving|for) ([\w\s,&\-()\/]+?)(?:\. Severity:|,| with| due| for|$)/i);
  
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

// 🧠 Strategist Intelligence Structures
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

export interface Recommendation {
  recommendationId: string;
  text: string;
  confidence: number;
  basedOn: string[];
}

export interface ActionLog {
  id: string;
  action: string;
  role: string;
  strategist: string;
  details: string;
  timestamp: Date;
}

import { z } from 'zod';

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
    rationale?: string;
    action?: string;
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
  const rationale = rationaleMatch ? rationaleMatch[1] : undefined;

  let action: string | undefined = "";
  const actionMatch = details.match(/Action: ([^ ]*)/i);
  if (actionMatch) {
    action = actionMatch[1].replace(/\"/g, '');
  } else if (details.startsWith("Event: Strategist Override Initiated")) {
    action = "Override Initiated";
  } else {
    action = undefined;
  }

  const severityMatch = details.match(/Severity: (Warning|Critical|Catastrophic)/i);
  let severity = severityMatch ? (severityMatch[1] as Severity) : undefined;

  let domains: string[] | undefined;
  const domainsMatch = details.match(/(?:on|involving|for) ([\w\s,&\-()\/]+?)(?:\. Severity:|,| with| due| for|$)/i);
  
  if (domainsMatch && domainsMatch[1]) {
    domains = domainsMatch[1].split(',').map(d => d.trim().replace(/\.$/, ''));
  }

  return { isOverride, rationale, action, severity, domains };
};

export const StrategistUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  providerId: z.string(),
  lastLogin: z.string(), // ISO timestamp
});

export type StrategistUser = z.infer<typeof StrategistUserSchema>;

export const LoginPayloadSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginPayload = z.infer<typeof LoginPayloadSchema>;

export const AuditEventSchema = z.object({
  eventType: z.string(),
  uid: z.string().optional(),
  email: z.string().optional(),
  error: z.string().optional(),
  timestamp: z.string(), // ISO timestamp
});

export type AuditEvent = z.infer<typeof AuditEventSchema>;

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
    rationale?: string;
    action?: string;
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
  const rationale = rationaleMatch ? rationaleMatch[1] : undefined;

  let action: string | undefined = "";
  const actionMatch = details.match(/Action: ([^ ]*)/i);
  if (actionMatch) {
    action = actionMatch[1].replace(/\"/g, '');
  } else if (details.startsWith("Event: Strategist Override Initiated")) {
    action = "Override Initiated";
  } else {
    action = undefined;
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
  const domainsMatch = details.match(/(?:on|involving|for) ([\w\s,&\-()\/]+?)(?:\. Severity:|,| with| due| for)/i);
  
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
