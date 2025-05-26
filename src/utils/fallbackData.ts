// Comprehensive fallback data for all dashboard components
// This ensures the frontend works when deployed to Vercel without backend access

export const fallbackDashboardData = {
  period: {
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date().toISOString(),
    days: 30
  },
  metric_intelligence: {
    cvr: 13.2,
    aov: 127.50,
    roas: 4.8,
    mer: 3.1
  },
  customer_intelligence: {
    total_users: 2847,
    average_readiness_score: 67.3,
    high_readiness_users: 342,
    churn_risk: 12.4
  },
  ad_intelligence: {
    ad_spend: 15420,
    impressions: 487000,
    clicks: 12400,
    conversions: 398,
    ctr: 2.55
  },
  behavior_intelligence: {
    avg_session_duration: 4.2,
    bounce_rate: 32.1,
    friction_points: 7
  },
  market_intelligence: {
    market_sentiment: 78.4,
    competitor_price_diff: -15.2
  },
  copy_intelligence: {
    message_resonance: 84.3,
    friction_analysis: 23.1
  },
  neuromind_profiles: [
    { type: 'Proof-Driven', count: 847 },
    { type: 'Optimizer', count: 623 },
    { type: 'Fast-Mover', count: 512 },
    { type: 'Skeptic', count: 398 },
    { type: 'Authority-Seeker', count: 287 },
    { type: 'Experience-First', count: 180 }
  ],
  structural_tension: {
    current_revenue: 127500,
    goal_revenue: 191250,
    current_cvr: 13.2,
    goal_cvr: 19.8,
    current_aov: 127.50,
    goal_aov: 153.00
  }
};

export const fallbackCustomerProfiles = [
  {
    id: 'user_001',
    email: 'sarah.johnson@example.com',
    neuromind_profile: 'Proof-Driven',
    readiness_score: 78.5,
    engagement_level: 'high',
    churn_risk: 0.12,
    lifetime_value: 2450,
    acquisition_source: 'Organic Search',
    first_seen: '2024-01-15T10:30:00Z',
    last_activity: '2024-01-20T14:22:00Z',
    total_sessions: 12,
    avg_session_duration: 6.8,
    conversion_probability: 0.785,
    journey_stage: 'consideration'
  },
  {
    id: 'user_002',
    email: 'mike.chen@example.com',
    neuromind_profile: 'Fast-Mover',
    readiness_score: 92.1,
    engagement_level: 'high',
    churn_risk: 0.05,
    lifetime_value: 3200,
    acquisition_source: 'Paid Social',
    first_seen: '2024-01-18T09:15:00Z',
    last_activity: '2024-01-20T16:45:00Z',
    total_sessions: 8,
    avg_session_duration: 3.2,
    conversion_probability: 0.921,
    journey_stage: 'decision'
  },
  {
    id: 'user_003',
    email: 'emma.davis@example.com',
    neuromind_profile: 'Skeptic',
    readiness_score: 45.3,
    engagement_level: 'medium',
    churn_risk: 0.34,
    lifetime_value: 890,
    acquisition_source: 'Direct',
    first_seen: '2024-01-10T11:20:00Z',
    last_activity: '2024-01-19T13:10:00Z',
    total_sessions: 15,
    avg_session_duration: 8.5,
    conversion_probability: 0.453,
    journey_stage: 'awareness'
  },
  {
    id: 'user_004',
    email: 'alex.rodriguez@example.com',
    neuromind_profile: 'Optimizer',
    readiness_score: 67.8,
    engagement_level: 'high',
    churn_risk: 0.18,
    lifetime_value: 1750,
    acquisition_source: 'Google Ads',
    first_seen: '2024-01-12T14:45:00Z',
    last_activity: '2024-01-20T11:30:00Z',
    total_sessions: 9,
    avg_session_duration: 5.4,
    conversion_probability: 0.678,
    journey_stage: 'consideration'
  },
  {
    id: 'user_005',
    email: 'lisa.thompson@example.com',
    neuromind_profile: 'Authority-Seeker',
    readiness_score: 83.2,
    engagement_level: 'medium',
    churn_risk: 0.09,
    lifetime_value: 2100,
    acquisition_source: 'Referral',
    first_seen: '2024-01-14T16:20:00Z',
    last_activity: '2024-01-20T09:15:00Z',
    total_sessions: 7,
    avg_session_duration: 7.1,
    conversion_probability: 0.832,
    journey_stage: 'decision'
  }
];

export const fallbackCustomerSegments = [
  {
    id: 'segment-proof-driven',
    name: 'Proof-Driven Segment',
    profile_type: 'Proof-Driven',
    user_count: 847,
    avg_readiness_score: 72.4,
    conversion_rate: 0.45,
    avg_lifetime_value: 2160,
    characteristics: ['Need evidence', 'Compare options thoroughly', 'Value testimonials'],
    recommended_actions: ['Provide detailed case studies', 'Show social proof', 'Offer free trials']
  },
  {
    id: 'segment-fast-mover',
    name: 'Fast-Mover Segment',
    profile_type: 'Fast-Mover',
    user_count: 512,
    avg_readiness_score: 85.7,
    conversion_rate: 0.67,
    avg_lifetime_value: 2571,
    characteristics: ['Quick decision makers', 'Value efficiency', 'Respond to urgency'],
    recommended_actions: ['Use time-limited offers', 'Streamline checkout process', 'Highlight speed benefits']
  },
  {
    id: 'segment-skeptic',
    name: 'Skeptic Segment',
    profile_type: 'Skeptic',
    user_count: 398,
    avg_readiness_score: 48.2,
    conversion_rate: 0.18,
    avg_lifetime_value: 1446,
    characteristics: ['Question claims', 'Need reassurance', 'High price sensitivity'],
    recommended_actions: ['Offer money-back guarantees', 'Provide transparent pricing', 'Use authority figures']
  },
  {
    id: 'segment-optimizer',
    name: 'Optimizer Segment',
    profile_type: 'Optimizer',
    user_count: 623,
    avg_readiness_score: 69.1,
    conversion_rate: 0.52,
    avg_lifetime_value: 2073,
    characteristics: ['Seek best value', 'Compare features', 'Want customization'],
    recommended_actions: ['Highlight ROI', 'Offer comparison tools', 'Provide customization options']
  }
];

export const fallbackBehavioralInsights = [
  {
    type: 'opportunity' as const,
    title: 'High-Readiness Users Ready for Conversion',
    description: '342 users showing strong buying signals and high engagement',
    affected_users: 342,
    confidence: 0.89,
    action_items: [
      'Send personalized offers to high-readiness users',
      'Implement urgency-based messaging',
      'Provide direct sales contact options'
    ]
  },
  {
    type: 'warning' as const,
    title: 'Form Abandonment Spike Detected',
    description: 'Form abandonment increased by 23% in the last 7 days',
    affected_users: 156,
    confidence: 0.76,
    action_items: [
      'Simplify form fields',
      'Add progress indicators',
      'Implement form auto-save functionality'
    ]
  },
  {
    type: 'trend' as const,
    title: 'Mobile Engagement Increasing',
    description: 'Mobile user engagement up 18% with longer session durations',
    affected_users: 1247,
    confidence: 0.82,
    action_items: [
      'Optimize mobile checkout flow',
      'Enhance mobile CTA visibility',
      'Test mobile-specific offers'
    ]
  }
];

export const fallbackBehavioralSignals = {
  signals: [
    {
      id: 'scroll_milestone',
      name: 'Scroll Velocity',
      type: 'engagement',
      strength: 0.78,
      frequency: 1247,
      impact_score: 0.62,
      trend: 'increasing',
      description: 'User scroll behavior indicating engagement level'
    },
    {
      id: 'cta_hover',
      name: 'CTA Hover Time',
      type: 'intent',
      strength: 0.85,
      frequency: 892,
      impact_score: 0.89,
      trend: 'stable',
      description: 'Time spent hovering over call-to-action elements'
    },
    {
      id: 'form_field_focus',
      name: 'Form Hesitation',
      type: 'friction',
      strength: 0.45,
      frequency: 234,
      impact_score: 0.34,
      trend: 'decreasing',
      description: 'Hesitation patterns in form completion'
    },
    {
      id: 'viewport_time',
      name: 'Viewport Engagement',
      type: 'engagement',
      strength: 0.72,
      frequency: 1567,
      impact_score: 0.68,
      trend: 'increasing',
      description: 'Time spent in active viewport areas'
    }
  ],
  patterns: [
    {
      id: 'high_intent_pattern',
      name: 'High Intent Sequence',
      signals: ['cta_hover', 'scroll_milestone', 'viewport_time'],
      conversion_correlation: 0.89,
      user_count: 423,
      pattern_type: 'high_intent'
    },
    {
      id: 'abandonment_pattern',
      name: 'Abandonment Risk Pattern',
      signals: ['form_field_focus', 'page_view'],
      conversion_correlation: 0.12,
      user_count: 156,
      pattern_type: 'abandonment_risk'
    }
  ],
  flows: [
    {
      from_signal: 'scroll_milestone',
      to_signal: 'cta_hover',
      transition_probability: 0.67,
      avg_time_between: 45,
      user_count: 423
    },
    {
      from_signal: 'cta_hover',
      to_signal: 'form_field_focus',
      transition_probability: 0.34,
      avg_time_between: 12,
      user_count: 156
    }
  ]
};

export const fallbackAdCampaigns = {
  campaigns: [
    {
      id: 'camp-001',
      name: 'Q4 Revenue Boost Campaign',
      platform: 'facebook',
      status: 'active',
      budget: 15000,
      spend: 12450,
      impressions: 487000,
      clicks: 12400,
      conversions: 398,
      ctr: 2.55,
      cpc: 1.00,
      roas: 4.2,
      creative_fatigue_score: 0.3,
      message_decay_rate: 0.15,
      start_date: '2024-01-01'
    },
    {
      id: 'camp-002',
      name: 'Brand Awareness Drive',
      platform: 'google',
      status: 'active',
      budget: 8000,
      spend: 7200,
      impressions: 234000,
      clicks: 8900,
      conversions: 267,
      ctr: 3.8,
      cpc: 0.81,
      roas: 3.7,
      creative_fatigue_score: 0.6,
      message_decay_rate: 0.25,
      start_date: '2024-01-15'
    },
    {
      id: 'camp-003',
      name: 'LinkedIn Professional Targeting',
      platform: 'linkedin',
      status: 'active',
      budget: 5000,
      spend: 4100,
      impressions: 89000,
      clicks: 2340,
      conversions: 89,
      ctr: 2.63,
      cpc: 1.75,
      roas: 5.1,
      creative_fatigue_score: 0.2,
      message_decay_rate: 0.08,
      start_date: '2024-02-01'
    }
  ],
  creatives: [
    {
      id: 'creative-001',
      campaign_id: 'camp-001',
      creative_type: 'video',
      headline: 'Transform Your Revenue in 30 Days',
      description: 'Discover the AI-powered secrets to 3x your conversion rate',
      impressions: 156000,
      clicks: 4200,
      conversions: 134,
      ctr: 2.69,
      fatigue_score: 0.25,
      engagement_score: 0.87,
      psychological_triggers: ['Urgency', 'Social Proof', 'Authority']
    },
    {
      id: 'creative-002',
      campaign_id: 'camp-001',
      creative_type: 'image',
      headline: 'Revenue Magick: See What Others Can\'t',
      description: 'Decode subconscious buying behavior with AI',
      impressions: 198000,
      clicks: 5100,
      conversions: 167,
      ctr: 2.58,
      fatigue_score: 0.35,
      engagement_score: 0.82,
      psychological_triggers: ['Curiosity', 'Exclusivity', 'Mystery']
    },
    {
      id: 'creative-003',
      campaign_id: 'camp-002',
      creative_type: 'text',
      headline: 'Stop Guessing. Start Knowing.',
      description: 'AI-driven insights that predict customer behavior',
      impressions: 134000,
      clicks: 4800,
      conversions: 145,
      ctr: 3.58,
      fatigue_score: 0.65,
      engagement_score: 0.74,
      psychological_triggers: ['Problem-Solution', 'Certainty', 'Control']
    }
  ],
  channelInsights: [
    {
      platform: 'Facebook',
      total_spend: 12450,
      total_conversions: 398,
      avg_roas: 4.2,
      trend: 'up',
      recommendation: 'Increase budget by 25% - strong performance with room for scale',
      opportunity_score: 0.85
    },
    {
      platform: 'Google',
      total_spend: 7200,
      total_conversions: 267,
      avg_roas: 3.7,
      trend: 'stable',
      recommendation: 'Test new ad copy variations - creative fatigue detected',
      opportunity_score: 0.65
    },
    {
      platform: 'LinkedIn',
      total_spend: 4100,
      total_conversions: 89,
      avg_roas: 5.1,
      trend: 'up',
      recommendation: 'Highest ROAS platform - consider expanding targeting',
      opportunity_score: 0.92
    }
  ]
};

export const fallbackRevenueStrategist = {
  recommendations: [
    {
      id: 'rec-001',
      title: 'Implement Dynamic Pricing for Fast-Movers',
      category: 'pricing' as const,
      priority: 'high' as const,
      impact_score: 8.7,
      effort_required: 6.2,
      expected_revenue_lift: 23.5,
      timeframe: '2-3 weeks',
      description: 'Fast-Mover profiles respond well to urgency and premium positioning. Implement time-sensitive pricing tiers.',
      action_steps: [
        'Identify Fast-Mover user segments',
        'Create urgency-based pricing tiers',
        'A/B test pricing presentation',
        'Monitor conversion impact'
      ],
      success_metrics: ['Conversion rate increase', 'Average order value', 'Revenue per Fast-Mover'],
      confidence: 0.87,
      affected_segments: ['Fast-Mover']
    },
    {
      id: 'rec-002',
      title: 'Add Social Proof for Skeptic Conversion',
      category: 'conversion' as const,
      priority: 'high' as const,
      impact_score: 7.9,
      effort_required: 4.1,
      expected_revenue_lift: 18.2,
      timeframe: '1-2 weeks',
      description: 'Skeptic profiles need reassurance through testimonials, reviews, and authority endorsements.',
      action_steps: [
        'Collect customer testimonials',
        'Add review widgets to key pages',
        'Implement trust badges',
        'Create authority endorsement section'
      ],
      success_metrics: ['Skeptic conversion rate', 'Time to conversion', 'Form completion rate'],
      confidence: 0.82,
      affected_segments: ['Skeptic']
    }
  ],
  compoundingActions: [
    {
      id: 'action-001',
      title: 'Add video to FAQ section',
      description: 'Video explanations increase trust and reduce hesitation for Proof-Driven users',
      estimated_impact: 0.18,
      effort_level: 'low',
      implementation_time: '2-3 hours',
      affected_metric: 'conversion_rate',
      confidence: 0.76,
      category: 'trust_building'
    },
    {
      id: 'action-002',
      title: 'Optimize mobile CTA button size',
      description: 'Increase mobile CTA button size by 20% to improve tap accuracy and conversions',
      estimated_impact: 0.12,
      effort_level: 'low',
      implementation_time: '30 minutes',
      affected_metric: 'mobile_conversion_rate',
      confidence: 0.89,
      category: 'mobile_optimization'
    },
    {
      id: 'action-003',
      title: 'Add urgency timer to checkout',
      description: 'Limited-time offers with countdown timers for Fast-Mover profiles',
      estimated_impact: 0.25,
      effort_level: 'medium',
      implementation_time: '4-6 hours',
      affected_metric: 'checkout_completion',
      confidence: 0.71,
      category: 'urgency_optimization'
    }
  ],
  simulations: [
    {
      id: 'sim-001',
      scenario_name: 'Implement Top 3 Recommendations',
      current_metrics: {
        monthly_revenue: 127500,
        conversion_rate: 13.2,
        average_order_value: 127.50,
        traffic: 9659
      },
      projected_metrics: {
        monthly_revenue: 178500,
        conversion_rate: 16.8,
        average_order_value: 139.20,
        traffic: 9659
      },
      changes_applied: [
        'Dynamic pricing for Fast-Movers (+23% revenue)',
        'Social proof for Skeptics (+18% conversions)',
        'Mobile optimization (+15% mobile conversions)'
      ],
      confidence_interval: {
        low: 0.85,
        high: 0.95
      },
      timeframe: '6-8 weeks'
    }
  ]
};

export const fallbackConversionSpyEngine = {
  sessions: [
    {
      id: 'session-001',
      user_id: 'user-001',
      start_time: new Date(Date.now() - 3600000).toISOString(),
      end_time: new Date(Date.now() - 3000000).toISOString(),
      source: 'Google Ads',
      device_type: 'Desktop',
      browser: 'Chrome',
      readiness_score: 85,
      behavioral_signals: {
        scroll_velocity: 0.8,
        cta_hover_time: 3.2,
        form_interactions: 2,
        hesitation_loops: 1,
        page_revisits: 3,
        click_cadence: 1.5,
        viewport_engagement: 0.9
      },
      conversion_probability: 0.78,
      neuromind_profile: 'Fast-Mover'
    },
    {
      id: 'session-002',
      user_id: 'user-002',
      start_time: new Date(Date.now() - 7200000).toISOString(),
      source: 'Facebook Ads',
      device_type: 'Mobile',
      browser: 'Safari',
      readiness_score: 45,
      behavioral_signals: {
        scroll_velocity: 0.3,
        cta_hover_time: 0.8,
        form_interactions: 0,
        hesitation_loops: 5,
        page_revisits: 8,
        click_cadence: 0.4,
        viewport_engagement: 0.4
      },
      conversion_probability: 0.23,
      neuromind_profile: 'Skeptic'
    },
    {
      id: 'session-003',
      user_id: 'user-003',
      start_time: new Date(Date.now() - 1800000).toISOString(),
      source: 'Organic',
      device_type: 'Desktop',
      browser: 'Firefox',
      readiness_score: 72,
      behavioral_signals: {
        scroll_velocity: 0.6,
        cta_hover_time: 2.1,
        form_interactions: 1,
        hesitation_loops: 2,
        page_revisits: 2,
        click_cadence: 1.2,
        viewport_engagement: 0.7
      },
      conversion_probability: 0.65,
      neuromind_profile: 'Proof-Driven'
    },
    {
      id: 'session-004',
      user_id: 'user-004',
      start_time: new Date(Date.now() - 900000).toISOString(),
      source: 'Direct',
      device_type: 'Tablet',
      browser: 'Safari',
      readiness_score: 91,
      behavioral_signals: {
        scroll_velocity: 0.9,
        cta_hover_time: 4.1,
        form_interactions: 3,
        hesitation_loops: 0,
        page_revisits: 1,
        click_cadence: 2.1,
        viewport_engagement: 0.95
      },
      conversion_probability: 0.89,
      neuromind_profile: 'Fast-Mover'
    }
  ],
  insights: [
    {
      type: 'opportunity' as const,
      title: 'High-Intent Users Not Converting',
      description: '23 users with readiness scores >80 have been active for >10 minutes without converting',
      user_count: 23,
      action_items: [
        'Deploy urgency-based exit-intent popup',
        'Trigger live chat for high-readiness users',
        'Show limited-time offer to Fast-Mover profiles'
      ]
    },
    {
      type: 'warning' as const,
      title: 'High Hesitation Loop Activity',
      description: 'Skeptic profiles showing 3x normal hesitation patterns on pricing page',
      user_count: 47,
      action_items: [
        'Add more social proof elements',
        'Include money-back guarantee prominently',
        'Show competitor comparison table'
      ]
    },
    {
      type: 'success' as const,
      title: 'Optimal Scroll Velocity Detected',
      description: 'Users with 0.6-0.8 scroll velocity converting at 2.3x higher rate',
      user_count: 156,
      action_items: [
        'Optimize content length for this velocity',
        'A/B test content density',
        'Implement scroll-triggered CTAs'
      ]
    }
  ]
};

export const fallbackIntegrations = {
  integrations: [
    {
      id: '1',
      user_id: 'user1',
      business_id: 'biz1',
      integration_type: 'ad_intelligence',
      provider: 'facebook_ads',
      name: 'Facebook Ads - Main Account',
      status: 'connected' as const,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      last_sync: new Date(Date.now() - 300000).toISOString(),
      sync_frequency: 'Every 5 minutes',
      data_points_synced: 12847,
      health_score: 98
    },
    {
      id: '2',
      user_id: 'user1',
      business_id: 'biz1',
      integration_type: 'ad_intelligence',
      provider: 'google_ads',
      name: 'Google Ads - Performance Max',
      status: 'connected' as const,
      created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      last_sync: new Date(Date.now() - 600000).toISOString(),
      sync_frequency: 'Every 10 minutes',
      data_points_synced: 8934,
      health_score: 95
    },
    {
      id: '3',
      user_id: 'user1',
      business_id: 'biz1',
      integration_type: 'customer_intelligence',
      provider: 'hubspot',
      name: 'HubSpot CRM',
      status: 'connected' as const,
      created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      last_sync: new Date(Date.now() - 180000).toISOString(),
      sync_frequency: 'Every 3 minutes',
      data_points_synced: 5672,
      health_score: 92
    },
    {
      id: '4',
      user_id: 'user1',
      business_id: 'biz1',
      integration_type: 'behavior_intelligence',
      provider: 'google_analytics',
      name: 'Google Analytics 4',
      status: 'error' as const,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      last_sync: new Date(Date.now() - 3600000).toISOString(),
      sync_frequency: 'Every hour',
      data_points_synced: 0,
      health_score: 0
    }
  ],
  availableProviders: [
    {
      id: 'facebook_ads',
      name: 'Facebook Ads',
      description: 'Connect your Facebook advertising campaigns for comprehensive ad intelligence and performance tracking.',
      logo: '/logos/facebook.svg',
      category: 'ad_intelligence',
      capabilities: ['Campaign Performance', 'Audience Insights', 'Creative Analysis', 'Attribution Tracking'],
      setup_complexity: 'simple' as const,
      data_types: ['Impressions', 'Clicks', 'Conversions', 'Spend', 'CTR', 'CPC']
    },
    {
      id: 'google_ads',
      name: 'Google Ads',
      description: 'Integrate Google Ads for search and display campaign optimization with AI-powered insights.',
      logo: '/logos/google-ads.svg',
      category: 'ad_intelligence',
      capabilities: ['Search Campaigns', 'Display Networks', 'Shopping Ads', 'Performance Max'],
      setup_complexity: 'simple' as const,
      data_types: ['Impressions', 'Clicks', 'Conversions', 'Cost', 'Quality Score']
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Sync your HubSpot CRM to unlock customer intelligence and behavioral insights.',
      logo: '/logos/hubspot.svg',
      category: 'customer_intelligence',
      capabilities: ['Contact Management', 'Deal Tracking', 'Email Campaigns', 'Lead Scoring'],
      setup_complexity: 'simple' as const,
      data_types: ['Contacts', 'Deals', 'Companies', 'Email Engagement']
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Connect Salesforce CRM for enterprise-grade customer intelligence and pipeline analysis.',
      logo: '/logos/salesforce.svg',
      category: 'customer_intelligence',
      capabilities: ['Lead Management', 'Opportunity Tracking', 'Account Management', 'Sales Analytics'],
      setup_complexity: 'moderate' as const,
      data_types: ['Leads', 'Opportunities', 'Accounts', 'Activities']
    }
  ]
};

export const fallbackDevMonitoring = {
  services: [
    {
      name: 'FastAPI Backend',
      status: 'healthy' as const,
      uptime: 99.8,
      response_time: 45,
      last_check: new Date().toISOString(),
      error_count: 2,
      endpoint: 'http://localhost:8000',
      version: '1.0.0'
    },
    {
      name: 'React Frontend',
      status: 'healthy' as const,
      uptime: 100,
      response_time: 12,
      last_check: new Date().toISOString(),
      error_count: 0,
      endpoint: 'http://localhost:3000',
      version: '1.0.0'
    },
    {
      name: 'Mock API Server',
      status: 'healthy' as const,
      uptime: 98.5,
      response_time: 78,
      last_check: new Date().toISOString(),
      error_count: 5,
      endpoint: 'http://localhost:3001',
      version: '1.0.0'
    },
    {
      name: 'Redis Cache',
      status: 'warning' as const,
      uptime: 97.2,
      response_time: 156,
      last_check: new Date().toISOString(),
      error_count: 12,
      endpoint: 'redis://localhost:6379'
    },
    {
      name: 'PostgreSQL',
      status: 'healthy' as const,
      uptime: 99.9,
      response_time: 23,
      last_check: new Date().toISOString(),
      error_count: 1,
      endpoint: 'postgresql://localhost:5432'
    }
  ],
  database: {
    connection_pool: {
      active: 8,
      idle: 12,
      max: 20
    },
    query_performance: {
      avg_query_time: 23.5,
      slow_queries: 3,
      total_queries: 1247
    },
    storage: {
      size_mb: 156.7,
      growth_rate: 2.3,
      free_space_mb: 8843.3
    },
    replication: {
      lag_ms: 45,
      status: 'synced' as const
    }
  },
  externalAPIs: [
    {
      provider: 'Facebook',
      service: 'Marketing API',
      status: 'connected' as const,
      last_sync: new Date(Date.now() - 300000).toISOString(),
      sync_frequency: '5 minutes',
      rate_limit: {
        used: 1247,
        limit: 5000,
        reset_time: new Date(Date.now() + 3600000).toISOString()
      },
      error_rate: 0.02,
      avg_response_time: 234
    },
    {
      provider: 'Google',
      service: 'Ads API',
      status: 'connected' as const,
      last_sync: new Date(Date.now() - 600000).toISOString(),
      sync_frequency: '10 minutes',
      rate_limit: {
        used: 892,
        limit: 10000,
        reset_time: new Date(Date.now() + 3600000).toISOString()
      },
      error_rate: 0.01,
      avg_response_time: 187
    }
  ],
  systemMetrics: {
    cpu_usage: 23.5,
    memory_usage: 67.2,
    disk_usage: 45.8,
    network_io: {
      bytes_in: 1247890,
      bytes_out: 892340
    },
    active_connections: 156,
    queue_depth: 12
  }
};

// Helper function to check if we're in production/deployed environment
export const isProduction = () => {
  return window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
};

// Helper function to get fallback data when API fails
export const getFallbackData = (dataType: string) => {
  console.warn(`Using fallback data for ${dataType} - API connection failed`);
  
  switch (dataType) {
    case 'dashboard':
      return fallbackDashboardData;
    case 'customerProfiles':
      return { customers: fallbackCustomerProfiles, total: fallbackCustomerProfiles.length };
    case 'customerSegments':
      return { segments: fallbackCustomerSegments, total: fallbackCustomerSegments.length };
    case 'behavioralInsights':
      return { insights: fallbackBehavioralInsights, total: fallbackBehavioralInsights.length };
    case 'behavioralSignals':
      return fallbackBehavioralSignals;
    case 'adCampaigns':
      return fallbackAdCampaigns;
    case 'revenueStrategist':
      return fallbackRevenueStrategist;
    case 'conversionSpyEngine':
      return fallbackConversionSpyEngine;
    case 'integrations':
      return fallbackIntegrations;
    case 'devMonitoring':
      return fallbackDevMonitoring;
    default:
      return null;
  }
}; 