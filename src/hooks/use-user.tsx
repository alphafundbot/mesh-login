
"use client";

import React, { createContext, useState, useContext, useMemo } from 'react';
import { ROLES, Role } from '@/lib/roles';

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

  const setUserRole = (role: Role) => {
    if (ROLES.includes(role)) {
      setUser(prevUser => ({ ...prevUser, role }));
    }
  };

  const contextValue = useMemo(() => ({ user, setUserRole }), [user]);

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
