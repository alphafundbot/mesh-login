// src/strategist/StrategistSession.ts

interface StrategistSessionData {
  strategistId: string;
  accessTier: string;
  loginTimestamp: number;
}

const SESSION_STORAGE_KEY = 'strategistSession';

export const StrategistSession = {
  // Persists session data to storage
  saveSession: (sessionData: StrategistSessionData): void => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      // Conceptual integration: Notify other modules of session start/update
      // FreeAccountConnector.onSessionUpdate(sessionData);
      // IncomeSanctum.onSessionUpdate(sessionData);
      // SignalConsensusEngine.onSessionUpdate(sessionData);
    } catch (error) {
      console.error('Failed to save strategist session:', error);
      // Implement strategist-grade error handling and audit logging
    }
  },

  // Retrieves session data from storage
  getSession: (): StrategistSessionData | null => {
    try {
      const sessionDataString = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionDataString) {
        const sessionData: StrategistSessionData = JSON.parse(sessionDataString);
        // Optional: Add validation or session expiry check
        return sessionData;
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
      localStorage.removeItem(SESSION_STORAGE_KEY);
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

  // Gets the strategist ID from the current session
  getStrategistId: (): string | null => {
    const session = StrategistSession.getSession();
    return session ? session.strategistId : null;
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