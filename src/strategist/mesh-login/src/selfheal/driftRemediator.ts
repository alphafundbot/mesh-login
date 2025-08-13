// src/selfheal/driftRemediator.ts
import { rollbackOverride } from '../rollback/overrideRollbackEngine';

export function remediateDrift(signals: any[]) {
  signals.forEach(s => {
    if (s.signal.includes('drift')) rollbackOverride(s.id);
  });
}
