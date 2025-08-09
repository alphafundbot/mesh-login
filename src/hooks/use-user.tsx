
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
    // For now, we'll default to 'Analyst' for any logged-in user.
    // We can restore the previous default for the known user.
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
        // To maintain a logged-in state for the demo, we can create a default user.
        // In a real application, you would set user to `null` here.
        setUser({
            uid: 'dev-user',
            name: 'Nehemie',
            email: 'nehemie@stratagem.ai',
            role: 'Architect'
        });
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
  // To prevent errors in components that expect a user object during the initial loading phase,
  // we can return a default/mock object or handle the loading state in the component itself.
  // For simplicity here, we ensure components are robust enough for `user` to be `null`.
  return context;
};
