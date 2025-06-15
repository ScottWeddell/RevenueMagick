import { useState, useEffect } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  tokenExpiry: number | null;
  lastRefresh: number | null;
  authError: string | null;
  isRefreshing: boolean;
}

interface AuthEvents {
  onTokenRefreshed?: (expiresAt: number) => void;
  onTokenRefreshFailed?: () => void;
  onAuthenticationError?: (error: string) => void;
}

export const useAuth = (events?: AuthEvents) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: !!localStorage.getItem('auth_token'),
    tokenExpiry: localStorage.getItem('auth_token_expiry') 
      ? parseInt(localStorage.getItem('auth_token_expiry')!) 
      : null,
    lastRefresh: null,
    authError: null,
    isRefreshing: false,
  });

  useEffect(() => {
    const handleTokenRefreshed = (event: CustomEvent) => {
      const { expiresAt } = event.detail;
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        tokenExpiry: expiresAt,
        lastRefresh: Date.now(),
        authError: null,
        isRefreshing: false,
      }));
      events?.onTokenRefreshed?.(expiresAt);
    };

    const handleTokenRefreshFailed = (event: CustomEvent) => {
      setAuthState(prev => ({
        ...prev,
        authError: 'Token refresh failed - using fallback authentication',
        isRefreshing: false,
      }));
      events?.onTokenRefreshFailed?.();
    };

    const handleAuthenticationError = (event: CustomEvent) => {
      const { message } = event.detail;
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        authError: message,
        isRefreshing: false,
      }));
      events?.onAuthenticationError?.(message);
    };

    // Listen for authentication events
    window.addEventListener('tokenRefreshed', handleTokenRefreshed as EventListener);
    window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailed as EventListener);
    window.addEventListener('authenticationError', handleAuthenticationError as EventListener);

    // Check token expiry periodically
    const checkTokenExpiry = () => {
      const tokenExpiry = localStorage.getItem('auth_token_expiry');
      if (tokenExpiry) {
        const expiryTime = parseInt(tokenExpiry);
        const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
        
        if (expiryTime < fiveMinutesFromNow) {
          setAuthState(prev => ({ ...prev, isRefreshing: true }));
        }
      }
    };

    const intervalId = setInterval(checkTokenExpiry, 60 * 1000); // Check every minute

    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed as EventListener);
      window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailed as EventListener);
      window.removeEventListener('authenticationError', handleAuthenticationError as EventListener);
      clearInterval(intervalId);
    };
  }, [events]);

  const clearAuthError = () => {
    setAuthState(prev => ({ ...prev, authError: null }));
  };

  const getTimeUntilExpiry = () => {
    if (!authState.tokenExpiry) return null;
    const timeLeft = authState.tokenExpiry - Date.now();
    return timeLeft > 0 ? timeLeft : 0;
  };

  const getExpiryStatus = () => {
    const timeLeft = getTimeUntilExpiry();
    if (!timeLeft) return 'expired';
    
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    if (hoursLeft < 1) return 'expiring-soon';
    if (hoursLeft < 24) return 'expiring-today';
    return 'valid';
  };

  return {
    ...authState,
    clearAuthError,
    getTimeUntilExpiry,
    getExpiryStatus,
    timeUntilExpiry: getTimeUntilExpiry(),
    expiryStatus: getExpiryStatus(),
  };
}; 