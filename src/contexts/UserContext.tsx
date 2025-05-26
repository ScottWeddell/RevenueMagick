import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the user type
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  business_id: string;
}

// Create a context with default values
interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  isAuthenticated: false,
});

// Create a provider component
export function UserProvider({ children }: { children: ReactNode }) {
  // For development purposes, we'll create a mock user
  // In a real app, this would come from authentication
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: "current-user-id",
    email: "user@example.com",
    name: "Demo User",
    role: "admin",
    business_id: "business-1"
  });

  const isAuthenticated = currentUser !== null;

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
}

// Create a hook to use the user context
export function useUser() {
  return useContext(UserContext);
} 