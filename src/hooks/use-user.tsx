
"use client";

import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { ROLES, Role } from '@/lib/roles';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

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

  // This is a placeholder for mapping Firebase users to app roles.
  // In a real app, this might come from a database or custom claims.
  const getRoleForUser = (firebaseUser: FirebaseUser): Role => {
    // Default to 'Analyst' for any logged-in user.
    // The pre-existing logic for 'nehemie' can be a stand-in for a role lookup.
    if (firebaseUser.email?.startsWith('nehemie')) {
        return 'Architect';
    }
    return 'Analyst';
  }

  useEffect(() => {
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

  const contextValue = useMemo(() => ({ user, loading, setUserRole }), [user, loading]);

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
