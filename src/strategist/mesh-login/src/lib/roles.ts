
import { logTelemetryEvent } from "../monitoring/LoginTelemetry";

export const ROLES = ["Architect", "Analyst", "Operator"] as const;
export type Role = typeof ROLES[number];

export const ACTIONS = [
    "Escalate", 
    "Quarantine", 
    "Rollback", 
    "viewFinancials", 
    "viewResources", 
    "manageResources",
    "viewApiStatus",
    "useGeminiApi",
    "viewMeshInfo"
] as const;
export type Action = typeof ACTIONS[number];

const PERMISSIONS: Record<Role, readonly Action[]> = {
  Architect: [
    "Escalate", 
    "Quarantine", 
    "Rollback", 
    "viewFinancials", 
    "viewResources", 
    "manageResources",
    "viewApiStatus",
    "useGeminiApi",
    "viewMeshInfo"
  ],
  Analyst: [
    "Escalate", 
    "viewFinancials", 
    "viewResources",
    "viewApiStatus",
    "viewMeshInfo"
  ],
  Operator: ["Quarantine", "Rollback", "viewApiStatus"],
};

export const canUserPerform = (role: Role, action: Action): boolean => {
  const hasPermission = PERMISSIONS[role].includes(action);
  logTelemetryEvent('permission:check', { metadata: { role, action, result: hasPermission } });
  return hasPermission;
};
