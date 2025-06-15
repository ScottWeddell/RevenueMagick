/**
 * Sentry configuration for Revenue Magick Frontend
 */

import * as Sentry from '@sentry/react';

export const initSentry = () => {
  const sentryDsn = (import.meta as any).env?.VITE_SENTRY_DSN;
  const environment = (import.meta as any).env?.VITE_ENVIRONMENT || 'development';
  
  if (!sentryDsn) {
    console.warn('⚠️  Sentry DSN not configured - skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    
    // Performance Monitoring
    tracesSampleRate: environment === 'development' ? 1.0 : 0.1,
    
    // Release tracking
    release: `revenue-magick-frontend@${environment}`,
    
    // Additional options
    beforeSend(event) {
      // Filter out development errors in production
      if (environment === 'production' && event.exception) {
        const error = event.exception.values?.[0];
        if (error?.value?.includes('ResizeObserver loop limit exceeded')) {
          return null; // Don't send this common React error
        }
      }
      
      return event;
    },
    
    // Don't send personally identifiable information
    beforeSendTransaction(event) {
      // Remove sensitive data from URLs
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/\/users\/[^\/]+/, '/users/[id]');
        event.request.url = event.request.url.replace(/\/businesses\/[^\/]+/, '/businesses/[id]');
      }
      
      return event;
    },
  });
  
  console.log(`✅ Sentry initialized for environment: ${environment}`);
};

// Helper functions for manual error tracking
export const captureException = (error: Error, context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setExtra(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
};

export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) => {
  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setExtra(key, context[key]);
      });
    }
    Sentry.captureMessage(message, level);
  });
};

export const setUserContext = (userId: string, email?: string, businessId?: string) => {
  Sentry.setUser({
    id: userId,
    email,
    business_id: businessId,
  });
};

export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}; 