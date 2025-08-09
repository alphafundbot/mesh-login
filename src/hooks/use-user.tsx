
"use client";

import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { ROLES, Role } from '@/lib/roles';
import { auth } from '@/lib/firebaseConfig';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

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
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getRoleForUser = (firebaseUser: FirebaseUser): Role => {
    if (firebaseUser.email?.startsWith('nehemie')) {
        return 'Architect';
    }
    return 'Analyst';
  }

  useEffect(() => {
    // Guard against running on the server
    if (typeof window === 'undefined') {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const role = getRoleForUser(firebaseUser);
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


  const setUserRole = (role: Role) => {
    if (ROLES.includes(role) && user) {
      setUser(prevUser => prevUser ? ({ ...prevUser, role }) : null);
    }
  };

  const logout = useCallback(async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error) {
        console.error("Logout failed:", error);
    }
  }, [router]);

  const contextValue = useMemo(() => ({ user, loading, setUserRole, logout }), [user, loading, logout]);

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
