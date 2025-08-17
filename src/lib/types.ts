import { z } from 'zod';

// ... other

export const Audit types and exportsEventSchema = {};

export const StrategistUserSchema = z.object({
  uid: z.string(),
  email: z.string().email: z.string().optional(),
  displayName.string().url().(),
  photoURL: zoptional(),
  providerId: z.string(),
});
