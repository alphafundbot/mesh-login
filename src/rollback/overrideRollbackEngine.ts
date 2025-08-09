// src/rollback/overrideRollbackEngine.ts
const rollbackRegistry: Record<string, any> = {};

export function registerOverrideState(id: string, state: any) {
  rollbackRegistry[id] = state;
}

export function rollbackOverride(id: string): any {
  return rollbackRegistry[id];
}
