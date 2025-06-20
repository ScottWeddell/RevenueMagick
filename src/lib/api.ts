import { supabase } from './supabase';

// API Client v2.2 - Fixed exports for frontend compatibility
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Check if API_BASE_URL already includes /api/v1
const hasApiV1 = API_BASE_URL.includes('/api/v1');
const baseUrl = hasApiV1 ? API_BASE_URL : `${API_BASE_URL}/api/v1`;

// Simple in-memory cache for API responses
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry>();
  private pendingRequests = new Map<string, Promise<any>>();

  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  get(url: string, options?: RequestInit, ttl: number = 300000): CacheEntry | null {
    const key = this.generateKey(url, options);
    const entry = this.cache.get(key);
    
    if (entry && (Date.now() - entry.timestamp) < entry.ttl) {
      return entry;
    }
    
    // Clean up expired entry
    if (entry) {
      this.cache.delete(key);
    }
    
    return null;
  }

  set(url: string, data: any, options?: RequestInit, ttl: number = 300000): void {
    const key = this.generateKey(url, options);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Handle pending requests to prevent duplicate API calls
  getPendingRequest(url: string, options?: RequestInit): Promise<any> | null {
    const key = this.generateKey(url, options);
    return this.pendingRequests.get(key) || null;
  }

  setPendingRequest(url: string, promise: Promise<any>, options?: RequestInit): void {
    const key = this.generateKey(url, options);
    this.pendingRequests.set(key, promise);
    
    // Clean up when promise resolves
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      // Invalidate entries matching pattern
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
    this.pendingRequests.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

const apiCache = new APICache();

// Session cache to prevent excessive auth requests
class SessionCache {
  private cachedSession: any = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 30000; // 30 seconds

  async getSession() {
    const now = Date.now();
    
    // Return cached session if still valid
    if (this.cachedSession && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      console.log('Session cache HIT - using cached session');
      return this.cachedSession;
    }

    // Fetch fresh session
    console.log('Session cache MISS - fetching fresh session from Supabase');
    const { data: { session } } = await supabase.auth.getSession();
    
    // Cache the session
    this.cachedSession = session;
    this.cacheTimestamp = now;
    
    return session;
  }

  clearCache() {
    this.cachedSession = null;
    this.cacheTimestamp = 0;
  }
}

const sessionCache = new SessionCache();

// Listen for authentication state changes to clear cache
if (typeof window !== 'undefined') {
  // Clear session cache when auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || !session) {
      console.log('Auth state changed, clearing session cache:', event);
      sessionCache.clearCache();
    }
  });
}

class ApiClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await sessionCache.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    cacheTTL: number = 300000
  ): Promise<T> {
    const url = `${baseUrl}${endpoint}`;
    
    // Only cache GET requests
    const shouldCache = (!options.method || options.method === 'GET') && cacheTTL > 0;
    
    // Check cache first
    if (shouldCache) {
      const cached = apiCache.get(url, options, cacheTTL);
      if (cached) {
        console.log(`Cache HIT: ${endpoint}`);
        return cached.data;
      }

      // Check for pending request
      const pending = apiCache.getPendingRequest(url, options);
      if (pending) {
        console.log(`Pending request: ${endpoint}`);
        return pending;
      }
    }

    const headers = await this.getAuthHeaders();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    const requestPromise = fetch(url, requestOptions).then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      return response.json();
    });

    // Store pending request
    if (shouldCache) {
      apiCache.setPendingRequest(url, requestPromise, options);
    }

    try {
      const data = await requestPromise;
      
      // Cache successful response
      if (shouldCache) {
        apiCache.set(url, data, options, cacheTTL);
        console.log(`Cache SET: ${endpoint} (TTL: ${cacheTTL}ms)`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      
      // Clear session cache on auth errors
      if (error instanceof Error && (
        error.message.includes('401') || 
        error.message.includes('403') || 
        error.message.includes('Unauthorized') ||
        error.message.includes('authentication')
      )) {
        console.log('Clearing session cache due to auth error');
        sessionCache.clearCache();
      }
      
      throw error;
    }
  }

  // Dashboard and Analytics endpoints
  async getDashboardData(days: number = 30) {
    return this.request(`/analytics/dashboard?days=${days}`, {}, 180000); // 3 minutes
  }

  async getBehavioralInsights(days: number = 30) {
    return this.request(`/analytics/behavioral-insights?days=${days}`, {}, 300000); // 5 minutes
  }

  async getCustomerProfiles(options: number | { 
    limit?: number; 
    offset?: number;
    page?: number;
    profile_type?: string; 
    min_readiness_score?: number; 
    max_churn_risk?: number;
  } = 50) {
    // Handle both number and object parameters
    let limit = 50;
    let queryParams = '';
    
    if (typeof options === 'number') {
      limit = options;
      queryParams = `?limit=${limit}`;
    } else {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset !== undefined) params.append('offset', options.offset.toString());
      if (options.page !== undefined) params.append('page', options.page.toString());
      if (options.profile_type) params.append('profile_type', options.profile_type);
      if (options.min_readiness_score) params.append('min_readiness_score', options.min_readiness_score.toString());
      if (options.max_churn_risk) params.append('max_churn_risk', options.max_churn_risk.toString());
      queryParams = params.toString() ? `?${params.toString()}` : '';
    }
    
    return this.request(`/analytics/customer-profiles${queryParams}`, {}, 600000); // 10 minutes
  }

  async getCustomerSegments() {
    return this.request('/analytics/customer-segments', {}, 600000); // 10 minutes
  }

  async getBehavioralSignals(timeRange: string = '24h') {
    return this.request(`/analytics/behavioral-signals?time_range=${timeRange}`, {}, 120000); // 2 minutes
  }

  async getDigitalBodyLanguageSessions(options: number | { limit?: number; time_filter?: string } = 50) {
    // Handle both number and object parameters
    let queryParams = '';
    
    if (typeof options === 'number') {
      queryParams = `?limit=${options}`;
    } else {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.time_filter) params.append('time_filter', options.time_filter);
      queryParams = params.toString() ? `?${params.toString()}` : '';
    }
    
    return this.request(`/analytics/digital-body-language-sessions${queryParams}`, {}, 300000); // 5 minutes
  }

  async getStrategicRecommendations(options: number | { limit?: number; category?: string } = 20) {
    // Handle both number and object parameters
    let queryParams = '';
    
    if (typeof options === 'number') {
      queryParams = `?limit=${options}`;
    } else {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.category) params.append('category', options.category);
      queryParams = params.toString() ? `?${params.toString()}` : '';
    }
    
    return this.request(`/analytics/strategic-recommendations${queryParams}`, {}, 900000); // 15 minutes
  }

  // Strategy endpoints
  async getSmallCompoundingActions() {
    return this.request('/strategy/small-compounding-actions', {}, 900000); // 15 minutes
  }

  async getRevenueSimulations() {
    return this.request('/strategy/revenue-simulations', {}, 600000); // 10 minutes
  }

  async getMarketInsights() {
    return this.request('/strategy/market-insights', {}, 1800000); // 30 minutes
  }

  // Ad Intelligence endpoints
  async getAdInsights(days: number = 30) {
    return this.request(`/analytics/ad-metrics?days=${days}`, {}, 300000); // 5 minutes
  }

  async getAdIntelligenceSummary(days: number = 30) {
    return this.request(`/analytics/ad-intelligence-summary?days=${days}`, {}, 180000); // 3 minutes cache
  }

  async getAdPerformance(platform?: string) {
    const query = platform ? `?platform=${platform}` : '';
    return this.request(`/analytics/campaign-performance${query}`, {}, 300000); // 5 minutes
  }

  // Integration endpoints - no caching for real-time status
  async getIntegrations() {
    return this.request('/integrations/', {}, 0); // No cache
  }

  async getIntegrationProviders() {
    // This endpoint is public and doesn't require authentication
    const url = `${baseUrl}/integrations/providers`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      console.log('✅ Successfully fetched providers without auth:', data);
      return { providers: data };
    } catch (error) {
      console.error('❌ Failed to fetch providers:', error);
      throw error;
    }
  }

  // Auth endpoints with improved caching and deduplication
  async getTokenInfo() {
    return this.request('/auth/user', {}, 60000); // 1 minute cache
  }

  // Alias for getTokenInfo to match component expectations
  // This method now uses the same caching and deduplication as other requests
  async getCurrentUser() {
    const tokenInfo = await this.getTokenInfo();
    return { user: tokenInfo }; // Wrap in user object to match expected format
  }

  // Cache management methods
  invalidateCache(pattern?: string) {
    apiCache.invalidate(pattern);
  }

  getCacheStats() {
    return apiCache.getStats();
  }

  // Dashboard sync methods
  async syncDashboard(): Promise<any> {
    return this.request('/analytics/sync-dashboard', {
      method: 'POST'
    }, 0); // No cache for sync operation
  }

  async getSyncStatus(): Promise<any> {
    return this.request('/analytics/sync-status', {
      method: 'GET'
    }, 30000); // Cache for 30 seconds
  }

  async getTaskStatus(taskId: string): Promise<any> {
    return this.request(`/analytics/task-status/${taskId}`, {
      method: 'GET'
    }, 0); // No cache for task status
  }

  // Enhanced cache clearing with backend coordination
  async clearAllCache(): Promise<any> {
    // Clear frontend cache
    this.invalidateCache();
    
    // Clear backend cache
    try {
      const result = await this.request('/analytics/cache-invalidate', {
        method: 'POST'
      }, 0);
      return result;
    } catch (error) {
      console.warn('Backend cache clear failed:', error);
      return { frontend_cleared: true, backend_cleared: false };
    }
  }

  // Additional missing methods
  async getCampaignPerformance(options: { platform?: string; limit?: number } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (options.platform && options.platform !== 'all') {
      params.append('platform', options.platform);
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/analytics/campaign-performance-extended?${queryString}` : '/analytics/campaign-performance-extended';
    return this.request(endpoint, {}, 300000); // 5 minutes cache
  }

  async getCreativePerformance(options: { platform?: string; limit?: number } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (options.platform && options.platform !== 'all') {
      params.append('platform', options.platform);
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/analytics/creative-performance-extended?${queryString}` : '/analytics/creative-performance-extended';
    return this.request(endpoint, {}, 300000); // 5 minutes cache
  }

  async getChannelInsights(options: { platform?: string; limit?: number } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (options.platform && options.platform !== 'all') {
      params.append('platform', options.platform);
    }
    if (options.limit) {
      params.append('limit', options.limit.toString());
    }
    const queryString = params.toString();
    const endpoint = queryString ? `/analytics/channel-insights-extended?${queryString}` : '/analytics/channel-insights-extended';
    return this.request(endpoint, {}, 300000); // 5 minutes cache
  }

  async generateStrategyRecommendations(analysisData: any): Promise<any> {
    return this.request('/strategy/recommendations', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  async generateNeuromindProfiles(forceRegenerate: boolean = false): Promise<any> {
    const params = forceRegenerate ? '?force_regenerate=true' : '';
    return this.request(`/analytics/generate-neuromind-profiles${params}`, {
      method: 'POST'
    }, 0); // No cache for generation
  }

  async getSyncProgress(): Promise<any> {
    return this.request('/sync/status');
  }

  // Auth token method for credential forms
  async getAuthToken(): Promise<string> {
    const session = await sessionCache.getSession();
    return session?.access_token || '';
  }

  // Token refresh method
  async refreshToken(): Promise<void> {
    await supabase.auth.refreshSession();
  }

  // Integration methods - all authenticated and secure
  async testGoHighLevelCredentials(credentials: any): Promise<any> {
    return this.request('/integrations/gohighlevel/test-credentials', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }, 0); // No cache for testing
  }

  async saveGoHighLevelIntegration(credentials: any): Promise<any> {
    return this.request('/integrations/gohighlevel/save', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }, 0); // No cache for saving
  }

  async testFacebookCredentials(credentials: any): Promise<any> {
    return this.request('/integrations/facebook/test-credentials', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }, 0); // No cache for testing
  }

  async saveFacebookIntegration(credentials: any): Promise<any> {
    return this.request('/integrations/facebook/save', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }, 0); // No cache for saving
  }

  async deleteIntegration(integrationId: string): Promise<any> {
    return this.request(`/integrations/${integrationId}`, {
      method: 'DELETE'
    }, 0); // No cache for deletion
  }

  async getDataPointsStats(integrationId?: string): Promise<any> {
    const params = integrationId ? `?integration_id=${integrationId}` : '';
    return this.request(`/integrations/data-points/stats${params}`, {
      method: 'GET'
    }, 300); // Cache for 5 minutes
  }

  // UTM Attribution Analysis endpoints
  async getUtmAttributionAnalysis(options: { 
    platform?: string; 
    utm_source?: string; 
    utm_campaign?: string; 
    days?: number 
  } = {}): Promise<any> {
    const params = new URLSearchParams();
    if (options.platform) params.append('platform', options.platform);
    if (options.utm_source) params.append('utm_source', options.utm_source);
    if (options.utm_campaign) params.append('utm_campaign', options.utm_campaign);
    if (options.days) params.append('days', options.days.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `/analytics/utm-attribution-analysis?${queryString}` : '/analytics/utm-attribution-analysis';
    return this.request(endpoint, {}, 300000); // 5 minutes cache
  }

  async getConversionAttributionMapping(days: number = 30): Promise<any> {
    return this.request(`/analytics/conversion-attribution-mapping?days=${days}`, {}, 600000); // 10 minutes cache
  }

  // Clear all caches including session cache
  clearAllCaches() {
    this.invalidateCache();
    sessionCache.clearCache();
  }
}

// Create the API client instance
const apiClient = new ApiClient();

// Make apiClient globally accessible for debugging
if (typeof window !== 'undefined') {
  (window as any).apiClient = apiClient;
  (window as any).clearDashboardCache = () => {
    console.log('🧹 Clearing all frontend cache across all dashboard views...');
    apiClient.invalidateCache();
    console.log('✅ Frontend cache cleared! Refresh any dashboard view to see fresh data.');
  };
  (window as any).syncDashboard = async () => {
    console.log('🔄 Triggering comprehensive dashboard sync across ALL views...');
    try {
      const result = await apiClient.syncDashboard();
      console.log('✅ Comprehensive dashboard sync triggered:', result);
      console.log(`📊 Recalculating ${result.endpoints_recalculating?.length || 14} dashboard endpoints...`);
      return result;
    } catch (error) {
      console.error('❌ Dashboard sync failed:', error);
      throw error;
    }
  };
  (window as any).clearAllCache = async () => {
    console.log('🧹 Clearing ALL cache (frontend + backend) across all dashboard views...');
    try {
      const result = await apiClient.clearAllCache();
      console.log('✅ All cache cleared across all views:', result);
      return result;
    } catch (error) {
      console.error('❌ Cache clearing failed:', error);
      throw error;
    }
  };
}

// Export as both default and named export for compatibility
export default apiClient;
export { apiClient };

// Also export as apiClient2 for components that reference it
export const apiClient2 = apiClient; 