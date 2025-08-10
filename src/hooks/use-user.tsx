
"use client";

import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { ROLES, Role } from '@/lib/roles';
import { auth } from '@/lib/firebaseConfig';
import { onIdTokenChanged, User as FirebaseUser } from 'firebase/auth';
import { isBrowser } from '@/lib/env-check';

interface User {
  uid: string;
  name: string;
  email: string | null;
  role: Role;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUserRole: (role: Role) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUserRole = useCallback((role: Role) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        return { ...currentUser, role: role };
    });
  }, []);

  useEffect(() => {
    if (!isBrowser() || !auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        // Roles are securely set on the backend via custom claims
        // and read from the ID token on the client.
        const role = (tokenResult.claims.role as Role) || 'Analyst';
        
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email || 'Strategist',
          email: firebaseUser.email,
          role: role,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const contextValue = useMemo(() => ({ user, loading, setUserRole }), [user, loading, setUserRole]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
