// src/strategist/StrategistSession.ts

import { StrategistUser, StrategistUserSchema } from '../lib/types';

const SESSION_STORAGE_KEY = process.env.NEXT_PUBLIC_SESSION_KEY ?? 'meshStrategistSession';
const SESSION_EXPIRY_MS = 1000 * 60 * 60 * 24; // 24 hours

type StoredSession = {
  strategist: StrategistUser;
  timestamp: number;
};

export const StrategistSession = {
  // 🧭 Persist strategist session with timestamp
  setSession: (user: StrategistUser): void => {
    try {
      const payload: StoredSession = {
        strategist: user,
        timestamp: Date.now(),
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save strategist session:', err);
    }
  },

  // 🔍 Retrieve strategist session
  getSession: (): StrategistUser | null => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;

      const parsed: StoredSession = JSON.parse(raw);
      const { strategist, timestamp } = parsed;

      // Expiry check
      if (Date.now() - timestamp > SESSION_EXPIRY_MS) {
        StrategistSession.clearSession();
        return null;
      }

      // Schema validation
      const result = StrategistUserSchema.safeParse(strategist);
      return result.success ? result.data : null;
    } catch (err) {
      console.error('Failed to load strategist session:', err);
    }
    return null;
  },

  // 🆔 Get strategist UID
  getStrategistId: (): string | null => {
    const session = StrategistSession.getSession();
    return session?.uid ?? null;
  },

  // 🧹 Clear strategist session
  clearSession: (): void => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear strategist session:', err);
    }
  },
};
// src/strategist/StrategistSession.ts

import { StrategistUser, StrategistUserSchema } from '../lib/types';

const SESSION_STORAGE_KEY = process.env.NEXT_PUBLIC_SESSION_KEY ?? 'meshStrategistSession';

const EXPIRY_MS = 1000 * 60 * 60 * 24; // 24 hours

export const StrategistSession = {
  // Persists session data to storage
  setSession: (user: StrategistUser): void => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({...user, timestamp: Date.now()}));
      // Conceptual integration: Notify other modules of session start/update
      // FreeAccountConnector.onSessionUpdate(user);
      // IncomeSanctum.onSessionUpdate(sessionData);
      // SignalConsensusEngine.onSessionUpdate(sessionData);
    } catch (error) {
      console.error('Failed to save strategist session:', error);
      // Implement strategist-grade error handling and audit logging
    }
  },

  // Retrieves session data from storage
  getSession: (): StrategistUser | null => {
    try {
      const sessionString = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionString) {
        const parsed = StrategistUserSchema.safeParse(JSON.parse(sessionString));
        if (parsed.success) {
          const session = parsed.data;
          const now = Date.now();
          if ((session as any).timestamp && now - (session as any).timestamp > EXPIRY_MS) return null;
          return session;
        }
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve strategist session:', error);
      // Implement strategist-grade error handling and audit logging
      return null;
    }
  },

  // Clears session data from storage
  clearSession: (): void => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY, );
      // Conceptual integration: Notify other modules of session end
      // FreeAccountConnector.onSessionEnd();
      // IncomeSanctum.onSessionEnd();
      // SignalConsensusEngine.onSessionEnd();
    } catch (error) {
      console.error('Failed to clear strategist session:', error);
      // Implement strategist-grade error handling and audit logging
    }
  },

  // Checks if a session is active
  isActive: (): boolean => {
    return StrategistSession.getSession() !== null;
  },


  // Gets the strategist UID from the current session
  getStrategistId: (): string | null => {
    const session = StrategistSession.getSession();
    return session ? session.uid : null;
  },

  // Gets the access tier from the current session
  getAccessTier: (): string | null => {
    const session = StrategistSession.getSession();
    return session ? session.accessTier : null;
  },
};

// Conceptual integration points for ritual binding or external module interaction:
// You would call these methods from your login success handler, logout process,
// or modules needing session information.

// Example usage (conceptual):
// On successful login:
// StrategistSession.saveSession({
//   strategistId: 'strategist-xyz',
//   accessTier: 'Sovereign',
//   loginTimestamp: Date.now(),
// });

// To check session state:
// if (StrategistSession.isActive()) {
//   const strategistId = StrategistSession.getStrategistId();
//   console.log(`Strategist ${strategistId} is active.`);
// }