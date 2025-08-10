import { AuditEvent, AuditEventSchema } from '../lib/types';

export const logAuditEvent = (eventType: string, payload: Partial<AuditEvent>) => {
  const event: AuditEvent = {
    eventType,
    uid: payload.uid ?? '',
    email: payload.email ?? '',
    error: payload.error ?? '',
    timestamp: new Date().toISOString(),
  };

  const result = AuditEventSchema.safeParse(event);
  if (!result.success) {
    console.warn('Invalid audit event:', result.error.format());
    return;
  }

  try {
    // Replace with actual logging mechanism (e.g., send to server, write to file)
    console.log('[AUDIT]', result.data);
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};