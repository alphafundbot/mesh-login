
"use client";

import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { ROLES, Role } from '@/lib/roles';
import { db } from '@/lib/firebase'; // Import db to ensure firebase is initialized

interface User {
  name: string;
  role: Role;
}

interface UserContextType {
  user: User;
  setUserRole: (role: Role) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    name: 'Nehemie',
    role: 'Architect', 
  });
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  useEffect(() => {
    // The act of importing 'db' from firebase.ts initializes it.
    // We can use a state to ensure children only render after this effect has run once.
    setIsFirebaseReady(true);
  }, []);


  const setUserRole = (role: Role) => {
    if (ROLES.includes(role)) {
      setUser(prevUser => ({ ...prevUser, role }));
    }
  };

  const contextValue = useMemo(() => ({ user, setUserRole }), [user]);

  if (!isFirebaseReady) {
    return null; // Or a global loading spinner
  }

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
