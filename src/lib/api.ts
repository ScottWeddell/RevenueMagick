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
    this.initializeToken();
    
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
      this.refreshPromise = this.generateFreshToken();
      
      try {
        await this.refreshPromise;
      } finally {
        this.refreshPromise = null;
      }
    }
  }

  private async generateFreshToken(userId?: string): Promise<void> {
    let attempts = 0;
    const maxAttempts = 3;

    // Get the current user ID from localStorage or use the provided userId
    const currentUserId = userId || this.getCurrentUserId();
    
    if (!currentUserId) {
      console.warn('No user ID available for token generation - user must be logged in');
      
      // Dispatch event for UI to show login requirement
      window.dispatchEvent(new CustomEvent('tokenRefreshFailed', { 
        detail: { fallbackUsed: false, loginRequired: true } 
      }));
      
      this.clearToken();
      return;
    }

    while (attempts < maxAttempts) {
      try {
        // Generate a fresh test token with 24-hour expiry using the backend endpoint
        const response = await fetch(`${this.baseURL}/auth/generate-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            subject: currentUserId,
            expires_hours: 24 
          })
        });

        if (response.ok) {
          const data = await response.json();
          this.setToken(data.access_token, data.expires_at);
          
          // Dispatch custom event for UI components to react
          window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
            detail: { success: true, expiresAt: data.expires_at } 
          }));
          return;
        }
      } catch (error) {
        // Backend is not available, continue to next attempt
      }

      attempts++;
      
      // Wait before retrying (exponential backoff)
      if (attempts < maxAttempts) {
        const delay = Math.pow(2, attempts) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // All attempts failed - backend is not available
    console.warn('Backend not available for token generation');
    
    // Dispatch event for UI to show warning
    window.dispatchEvent(new CustomEvent('tokenRefreshFailed', { 
      detail: { fallbackUsed: false, backendUnavailable: true } 
    }));
    
    // Don't set a fallback token - let requests fail and require proper login
    this.clearToken();
  }

  private getCurrentUserId(): string | null {
    // Try to get current user from localStorage or other storage
    const userDataStr = localStorage.getItem('current_user');
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return userData.id;
      } catch (e) {
        // Ignore parsing errors
      }
    }
    return null;
  }

  // Add method to update user context
  setCurrentUser(userId: string): void {
    // Store current user ID for token generation
    localStorage.setItem('current_user', JSON.stringify({ id: userId }));
    
    // Clear current token so it gets regenerated for the new user
    this.clearToken();
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

  async refreshToken(): Promise<void> {
    this.clearToken();
    await this.ensureValidToken();
  }

  getTokenInfo(): { token: string | null; expiry: number | null; isExpired: boolean } {
    return {
      token: this.token,
      expiry: this.tokenExpiry,
      isExpired: this.isTokenExpired()
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure we have a valid token before making the request
    await this.ensureValidToken();
    
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {};

    // Only set Content-Type if not FormData (browser will set it automatically for FormData)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

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
    if (response.status === 401 && this.token) {
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
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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
      user: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
        business_id: string;
        business_name?: string;
        onboarding_completed: boolean;
      };
    }>('/auth/login', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async register(registrationData: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
    business_name: string;
    business_website?: string;
    industry?: string;
  }) {
    return this.request<{
      access_token: string;
      token_type: string;
      user: {
        id: string;
        email: string;
        first_name?: string;
        last_name?: string;
        business_id: string;
        business_name?: string;
        onboarding_completed: boolean;
      };
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(registrationData),
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
        name: string;
        platform: string;
        status: string;
        spend: number;
        impressions: number;
        clicks: number;
        conversions: number;
        ctr: number;
        cpc: number;
        roas: number;
        creative_fatigue_score: number;
        message_decay_rate: number;
        start_date: string;
        end_date?: string;
      }>;
      total: number;
    }>(`/analytics/campaign-performance?${searchParams}`);
  }

  async getCreativePerformance(params: {
    campaign_id?: string;
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
      creatives: Array<{
        id: string;
        campaign_id: string;
        creative_type: string;
        headline: string;
        description: string;
        impressions: number;
        clicks: number;
        conversions: number;
        ctr: number;
        fatigue_score: number;
        engagement_score: number;
        psychological_triggers: string[];
      }>;
      total: number;
    }>(`/analytics/creative-performance?${searchParams}`);
  }

  async getChannelInsights(params: {
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
      channels: Array<{
        platform: string;
          total_spend: number;
          total_conversions: number;
          avg_roas: number;
        trend: string;
        recommendation: string;
        opportunity_score: number;
      }>;
      total: number;
    }>(`/analytics/channel-insights?${searchParams}`);
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

  async getStrategicRecommendations(params: {
    category?: string;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      recommendations: Array<{
        id: string;
        title: string;
        category: string;
        priority: string;
        impact_score: number;
        effort_required: number;
        expected_revenue_lift: number;
        timeframe: string;
        description: string;
        action_steps: string[];
        success_metrics: string[];
        confidence: number;
        business_metrics_context: any;
      }>;
      total: number;
    }>(`/analytics/strategic-recommendations?${searchParams}`);
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

  async getRevenueSimulations() {
    return this.request<{
      simulations: Array<{
        id: string;
        scenario_name: string;
        current_monthly_revenue: number;
        projected_monthly_revenue: number;
        current_conversion_rate: number;
        projected_conversion_rate: number;
        current_aov: number;
        projected_aov: number;
        current_traffic: number;
        projected_traffic: number;
        changes_applied: string[];
        confidence_interval: {
          low: number;
          high: number;
        };
        timeframe: string;
      }>;
      total_simulations: number;
      generated_at: string;
    }>('/strategy/revenue-simulations');
  }

  async getMarketInsights() {
    return this.request<{
      insights: Array<{
        type: string;
        title: string;
        description: string;
        impact: string;
        urgency: string;
        recommended_actions: string[];
        data_source: string;
      }>;
      total_insights: number;
      generated_at: string;
    }>('/strategy/market-insights');
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

  async getDigitalBodyLanguageSessions(params: {
    time_filter?: string;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.request<{
      sessions: Array<{
        id: string;
        user_id: string;
        start_time: string;
        end_time?: string;
        source: string;
        device_type: string;
        browser: string;
        ip_address?: string;
        readiness_score: number;
        conversion_probability: number;
        neuromind_profile: string;
        behavioral_signals: {
          scroll_velocity: number;
          cta_hover_time: number;
          form_interactions: number;
          hesitation_loops: number;
          page_revisits: number;
          click_cadence: number;
          viewport_engagement: number;
        };
      }>;
      total: number;
    }>(`/analytics/digital-body-language-sessions?${searchParams}`);
  }

  private async initializeToken(): Promise<void> {
    if (this.isTokenExpired()) {
      await this.ensureValidToken();
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient; 