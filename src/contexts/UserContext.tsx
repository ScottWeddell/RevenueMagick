import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiClient } from '../lib/api';

// Define the user type
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  business_id: string;
  business_name?: string;
  business_industry?: string;
}

// Create a context with default values
interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

// Create a provider component
export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkExistingAuth = () => {
      const token = localStorage.getItem('auth_token');
      const tokenExpiry = localStorage.getItem('auth_token_expiry');
      
      console.log('Checking existing auth - token:', !!token, 'expiry:', tokenExpiry); // Debug log
      
      if (token && tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        if (Date.now() < expiryTime) {
          // Token is still valid, try to restore user session
          // For now, we'll need to determine user from token or make an API call
          // This is a simplified version - in production you'd validate the token with the server
          
          // Try to extract user info from stored data or make API call
          const storedUser = localStorage.getItem('current_user');
          console.log('Stored user data:', storedUser); // Debug log
          
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              console.log('Parsed stored user:', user); // Debug log
              setCurrentUser(user);
              apiClient.setCurrentUser(user.id);
              console.log('Restored user session:', user.id);
            } catch (error) {
              console.error('Failed to restore user session:', error);
              logout();
            }
          }
        } else {
          // Token expired
          console.log('Token expired, logging out'); // Debug log
          logout();
        }
      }
    };

    checkExistingAuth();
  }, []);

  const isAuthenticated = currentUser !== null;

  const login = (user: User) => {
    setCurrentUser(user);
    apiClient.setCurrentUser(user.id);
    
    // Store user data for session restoration
    localStorage.setItem('current_user', JSON.stringify(user));
    
    console.log(`Logged in as: ${user.id} (business: ${user.business_id})`);
  };

  const logout = () => {
    setCurrentUser(null);
    
    // Clear all auth-related data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiry');
    localStorage.removeItem('current_user');
    localStorage.removeItem('token'); // Clear any old token format
    
    console.log('User logged out');
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      setCurrentUser, 
      isAuthenticated, 
      login, 
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
}

// Create a hook to use the user context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 