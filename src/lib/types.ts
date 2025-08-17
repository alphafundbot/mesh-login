import { z } from "zod";

export const AuditEventSchema = {};

export const StrategistUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  providerId: z.string(),
});
