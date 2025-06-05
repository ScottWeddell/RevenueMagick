const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshPromise: Promise<void> | null = null; // Prevent concurrent refreshes

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokenFromStorage();
    
    // Auto-refresh token if it's expired or about to expire
    this.ensureValidToken();
    
    // Set up periodic token refresh check (every 10 minutes)
    setInterval(() => {
      if (this.isTokenExpired()) {
        this.ensureValidToken();
      }
    }, 10 * 60 * 1000);
  }

  private loadTokenFromStorage() {
    this.token = localStorage.getItem('auth_token');
    const expiryStr = localStorage.getItem('auth_token_expiry');
    this.tokenExpiry = expiryStr ? parseInt(expiryStr) : null;
  }

  private isTokenExpired(): boolean {
    if (!this.token || !this.tokenExpiry) return true;
    
    // Consider token expired if it expires within the next 5 minutes
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return this.tokenExpiry < fiveMinutesFromNow;
  }

  private async ensureValidToken(): Promise<void> {
    // Prevent concurrent refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (this.isTokenExpired()) {
      console.log('🔄 Token expired or missing, generating fresh token...');
      this.refreshPromise = this.generateFreshToken();
      
      try {
        await this.refreshPromise;
      } finally {
        this.refreshPromise = null;
      }
    }
  }

  private async generateFreshToken(): Promise<void> {
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        // Generate a fresh test token with 24-hour expiry using the backend endpoint
        const response = await fetch(`${this.baseURL}/auth/generate-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            subject: 'test_user',
            expires_hours: 24 
          })
        });

        if (response.ok) {
          const data = await response.json();
          this.setToken(data.access_token, data.expires_at);
          console.log('✅ Generated fresh token from backend');
          
          // Dispatch custom event for UI components to react
          window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
            detail: { success: true, expiresAt: data.expires_at } 
          }));
          return;
        } else {
          console.warn(`Backend token generation failed (attempt ${attempts + 1}):`, response.status, response.statusText);
        }
      } catch (error) {
        console.warn(`Failed to generate fresh token from backend (attempt ${attempts + 1}):`, error);
      }

      attempts++;
      
      // Wait before retrying (exponential backoff)
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
      }
    }

    // All attempts failed - use fallback
    console.log('⚠️ All backend attempts failed, falling back to local token generation');
    this.generateLocalTestToken();
    
    // Dispatch event for UI to show warning
    window.dispatchEvent(new CustomEvent('tokenRefreshFailed', { 
      detail: { fallbackUsed: true } 
    }));
  }

  private generateLocalTestToken(): void {
    // For development fallback, use a simple token that won't be validated by backend
    // This should only be used when backend is not available
    const expiryTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
    const token = `dev_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setToken(token, expiryTime * 1000);
    console.warn('🔧 Using development fallback token - backend authentication may fail');
  }

  setToken(token: string, expiryTimestamp?: number) {
    this.token = token;
    localStorage.setItem('auth_token', token);
    
    // If expiry not provided, decode it from the JWT
    if (!expiryTimestamp && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        expiryTimestamp = payload.exp * 1000; // Convert to milliseconds
      } catch (error) {
        console.warn('Could not decode token expiry:', error);
        // Default to 24 hours from now
        expiryTimestamp = Date.now() + (24 * 60 * 60 * 1000);
      }
    }
    
    if (expiryTimestamp) {
      this.tokenExpiry = expiryTimestamp;
      localStorage.setItem('auth_token_expiry', expiryTimestamp.toString());
    }
  }

  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiry');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure we have a valid token before making the request
    await this.ensureValidToken();
    
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If we get a 401, try refreshing the token once more
    if (response.status === 401 && this.token && !this.token.startsWith('dev_token_')) {
      console.log('🔄 Received 401, attempting to refresh token...');
      
      // Clear the current token and refresh
      this.clearToken();
      await this.ensureValidToken();
      
      // Retry the request with the new token
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
        
        if (response.ok) {
          return response.json();
        }
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Dispatch authentication error event for UI handling
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('authenticationError', { 
          detail: { status: response.status, message: errorData.detail || 'Authentication failed' } 
        }));
      }
      
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Authentication
  async login(email: string, password: string) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    return this.request<{
      access_token: string;
      token_type: string;
      user_id: string;
      email: string;
    }>('/auth/login', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async register(email: string) {
    return this.request<{
      access_token: string;
      token_type: string;
      user_id: string;
      email: string;
      message: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getCurrentUser() {
    return this.request<{
      user_id: string;
      email: string;
      created_at: string;
      updated_at: string;
    }>('/auth/me');
  }

  // Users
  async getUsers(params: {
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_direction?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      users: Array<{
        id: string;
        email: string;
        created_at: string;
        updated_at: string;
      }>;
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
    }>(`/users?${searchParams}`);
  }

  async getUser(userId: string) {
    return this.request<{
      id: string;
      email: string;
      created_at: string;
      updated_at: string;
    }>(`/users/${userId}`);
  }

  // Tracking
  async trackEvent(eventData: {
    user_id: string;
    session_id: string;
    event_type: string;
    element_id?: string;
    duration?: number;
    metadata?: Record<string, any>;
  }) {
    return this.request<{
      event_id: string;
      status: string;
      timestamp: string;
    }>('/tracking/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async createSession(sessionData: {
    user_id: string;
    source?: string;
    referrer?: string;
    device_type?: string;
    browser?: string;
    location?: string;
  }) {
    return this.request<{
      session_id: string;
      user_id: string;
      start_time: string;
    }>('/tracking/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getUserReadinessScore(userId: string) {
    return this.request<{
      user_id: string;
      score: number;
      calculated_at: string;
      signal_components: Record<string, any>;
      decay_rate: number;
    }>(`/tracking/users/${userId}/readiness-score`);
  }

  async getUserNeuromindProfile(userId: string) {
    return this.request<{
      user_id: string;
      profile_type: string;
      confidence: number;
      created_at: string;
      last_updated: string;
      dominant_signals: Record<string, any>;
    }>(`/tracking/users/${userId}/neuromind-profile`);
  }

  async getUserBehavioralSignals(userId: string, limit: number = 100) {
    return this.request<{
      user_id: string;
      signals: Array<{
        event_id: string;
        event_type: string;
        element_id: string;
        duration: number;
        timestamp: string;
        metadata: Record<string, any>;
      }>;
      total_count: number;
    }>(`/tracking/users/${userId}/behavioral-signals?limit=${limit}`);
  }

  // Integrations
  async getIntegrations(params: {
    user_id?: string;
    page?: number;
    page_size?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      integrations: Array<{
        id: string;
        integration_type: string;
        provider: string;
        name: string;
        status: string;
        created_at: string;
        last_sync: string | null;
      }>;
      total: number;
    }>(`/integrations?${searchParams}`);
  }

  async getIntegration(integrationId: string) {
    return this.request<{
      id: string;
      integration_type: string;
      provider: string;
      name: string;
      status: string;
      settings: Record<string, any>;
      created_at: string;
      updated_at: string;
      last_sync: string | null;
    }>(`/integrations/${integrationId}`);
  }

  async createIntegration(integrationData: {
    integration_type: string;
    provider: string;
    name: string;
    status?: string;
    credentials?: Record<string, any>;
    settings?: Record<string, any>;
    meta_data?: Record<string, any>;
  }) {
    return this.request<{
      id: string;
      integration_type: string;
      provider: string;
      name: string;
      status: string;
      created_at: string;
      message: string;
    }>('/integrations', {
      method: 'POST',
      body: JSON.stringify(integrationData),
    });
  }

  async syncIntegration(integrationId: string) {
    return this.request<{
      sync_id: string;
      status: string;
      message: string;
    }>(`/integrations/${integrationId}/sync`, {
      method: 'POST',
    });
  }

  async getIntegrationProviders() {
    return this.request<{
      ad_platforms: Array<{
        provider: string;
        name: string;
        description: string;
        oauth_required: boolean;
      }>;
      crm_platforms: Array<{
        provider: string;
        name: string;
        description: string;
        oauth_required: boolean;
      }>;
    }>('/integrations/providers');
  }

  // Analytics
  async getAdMetrics(params: {
    start_date?: string;
    end_date?: string;
    platform?: string;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      metrics: Array<{
        id: string;
        campaign_id: string;
        ad_id: string;
        date: string;
        spend: number;
        impressions: number;
        clicks: number;
        conversions: number;
        ctr: number;
        roas: number;
        platform: string;
      }>;
      total: number;
    }>(`/analytics/ad-metrics?${searchParams}`);
  }

  async getCampaignPerformance(params: {
    platform?: string;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      campaigns: Array<{
        id: string;
        external_id: string;
        name: string;
        platform: string;
        status: string;
        budget: number;
        objective: string;
        performance: {
          total_spend: number;
          total_impressions: number;
          total_clicks: number;
          total_conversions: number;
          avg_ctr: number;
          avg_roas: number;
        };
      }>;
      total: number;
    }>(`/analytics/campaign-performance?${searchParams}`);
  }

  async getUserBehaviorSummary(days: number = 30) {
    return this.request<{
      period: {
        start_date: string;
        end_date: string;
        days: number;
      };
      event_summary: Array<{
        event_type: string;
        count: number;
      }>;
      readiness_score_distribution: Record<string, number>;
      total_events: number;
      total_scores: number;
    }>(`/analytics/user-behavior-summary?days=${days}`);
  }

  async getConversionFunnel(days: number = 30) {
    return this.request<{
      period: {
        start_date: string;
        end_date: string;
        days: number;
      };
      funnel: Array<{
        stage: string;
        count: number;
        conversion_rate?: number;
      }>;
    }>(`/analytics/conversion-funnel?days=${days}`);
  }

  async getDashboardData(days: number = 30) {
    return this.request<{
      period: {
        start_date: string;
        end_date: string;
        days: number;
      };
      metric_intelligence: {
        cvr: number;
        aov: number;
        roas: number;
        mer: number;
      };
      customer_intelligence: {
        total_users: number;
        average_readiness_score: number;
        high_readiness_users: number;
        churn_risk: number;
      };
      ad_intelligence: {
        ad_spend: number;
        impressions: number;
        clicks: number;
        conversions: number;
        ctr: number;
      };
      behavior_intelligence: {
        avg_session_duration: number;
        bounce_rate: number;
        friction_points: number;
      };
      market_intelligence: {
        market_sentiment: number;
        competitor_price_diff: number;
      };
      copy_intelligence: {
        message_resonance: number;
        friction_analysis: number;
      };
      neuromind_profiles: Array<{
        type: string;
        count: number;
      }>;
      structural_tension: {
        current_revenue: number;
        goal_revenue: number;
        current_cvr: number;
        goal_cvr: number;
        current_aov: number;
        goal_aov: number;
      };
    }>(`/analytics/dashboard?days=${days}`);
  }

  // Strategy
  async generateStrategyRecommendations(analysisData: Record<string, any>) {
    return this.request<{
      recommendations: Array<{
        type: string;
        priority: string;
        title: string;
        description: string;
        action_items: string[];
        expected_impact: string;
      }>;
      analysis_timestamp: string;
      confidence_score: number;
      total_recommendations: number;
    }>('/strategy/recommendations', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  async simulateRevenueImpact(scenarioData: {
    current_conversion_rate?: number;
    improvement_percentage?: number;
    monthly_traffic?: number;
    average_order_value?: number;
  }) {
    return this.request<{
      scenario: {
        current_conversion_rate: number;
        improved_conversion_rate: number;
        improvement_percentage: number;
        monthly_traffic: number;
        average_order_value: number;
      };
      current_performance: {
        monthly_conversions: number;
        monthly_revenue: number;
      };
      projected_performance: {
        monthly_conversions: number;
        monthly_revenue: number;
      };
      impact: {
        additional_conversions: number;
        additional_revenue: number;
        revenue_lift_percentage: number;
        annual_revenue_impact: number;
      };
      confidence: string;
      simulation_date: string;
    }>('/strategy/simulate-revenue-impact', {
      method: 'POST',
      body: JSON.stringify(scenarioData),
    });
  }

  async getSmallCompoundingActions() {
    return this.request<{
      actions: Array<{
        id: string;
        title: string;
        description: string;
        effort_level: string;
        implementation_time: string;
        expected_impact: string;
        category: string;
        priority_score: number;
      }>;
      total_actions: number;
      estimated_cumulative_impact: string;
      recommended_implementation_order: string[];
      generated_at: string;
    }>('/strategy/small-compounding-actions');
  }

  // Customer Intelligence
  async getCustomerProfiles(params: {
    limit?: number;
    profile_type?: string;
    min_readiness_score?: number;
    max_churn_risk?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      customers: Array<{
        id: string;
        email?: string;
        neuromind_profile: string;
        readiness_score: number;
        engagement_level: string;
        churn_risk: number;
        lifetime_value: number;
        acquisition_source: string;
        first_seen: string;
        last_activity: string;
        total_sessions: number;
        avg_session_duration: number;
        conversion_probability: number;
        journey_stage: string;
      }>;
      total: number;
    }>(`/analytics/customer-profiles?${searchParams}`);
  }

  async getCustomerSegments() {
    return this.request<{
      segments: Array<{
        id: string;
        name: string;
        profile_type: string;
        user_count: number;
        avg_readiness_score: number;
        conversion_rate: number;
        avg_lifetime_value: number;
        characteristics: string[];
        recommended_actions: string[];
      }>;
      total: number;
    }>('/analytics/customer-segments');
  }

  async getBehavioralInsights(days: number = 30) {
    return this.request<{
      insights: Array<{
        type: string;
        title: string;
        description: string;
        affected_users: number;
        confidence: number;
        action_items: string[];
      }>;
      total: number;
    }>(`/analytics/behavioral-insights?days=${days}`);
  }

  // Behavioral Signals
  async getBehavioralSignals(timeRange: string = '24h') {
    return this.request<{
      signals: Array<{
        id: string;
        name: string;
        type: string;
        strength: number;
        frequency: number;
        impact_score: number;
        trend: string;
        description: string;
      }>;
      patterns: Array<{
        id: string;
        name: string;
        signals: string[];
        conversion_correlation: number;
        user_count: number;
        pattern_type: string;
      }>;
      flows: Array<{
        from_signal: string;
        to_signal: string;
        transition_probability: number;
        avg_time_between: number;
        user_count: number;
      }>;
    }>(`/analytics/behavioral-signals?time_range=${timeRange}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient; 