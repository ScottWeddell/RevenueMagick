// Dummy user IDs
export const dummyUserIds = [
  'user-001', 'user-002', 'user-003', 'user-004', 'user-005'
];

// Dummy session data
export const dummySessions = [
  {
    id: 'sess-001',
    user_id: 'user-001',
    start_time: '2023-01-01T10:23:45Z',
    end_time: '2023-01-01T10:45:12Z',
    source: 'google',
    device_type: 'desktop',
    readiness_score: 85,
  },
  {
    id: 'sess-002',
    user_id: 'user-002',
    start_time: '2023-01-01T11:05:22Z',
    end_time: '2023-01-01T11:32:18Z',
    source: 'facebook',
    device_type: 'mobile',
    readiness_score: 62,
  },
  {
    id: 'sess-003',
    user_id: 'user-003',
    start_time: '2023-01-01T12:15:33Z',
    end_time: '2023-01-01T12:27:44Z',
    source: 'direct',
    device_type: 'tablet',
    readiness_score: 41,
  },
  {
    id: 'sess-004',
    user_id: 'user-004',
    start_time: '2023-01-01T13:08:12Z',
    end_time: null,
    source: 'email',
    device_type: 'desktop',
    readiness_score: 73,
  },
  {
    id: 'sess-005',
    user_id: 'user-001',
    start_time: '2023-01-01T14:22:54Z',
    end_time: '2023-01-01T14:55:21Z',
    source: 'referral',
    device_type: 'mobile',
    readiness_score: 89,
  },
];

// Dummy readiness score data
export const dummyReadinessScores = {
  'user-001': {
    user_id: 'user-001',
    score: 85,
    calculated_at: '2023-01-01T14:55:21Z',
    signals: {
      scroll_velocity: 0.85,
      form_interactions: 0.92,
      repeated_visits: 0.78,
      hover_bounce_pattern: 0.65
    }
  },
  'user-002': {
    user_id: 'user-002',
    score: 62,
    calculated_at: '2023-01-01T11:32:18Z',
    signals: {
      scroll_velocity: 0.52,
      form_interactions: 0.67,
      repeated_visits: 0.45,
      hover_bounce_pattern: 0.84
    }
  },
  'user-003': {
    user_id: 'user-003',
    score: 41,
    calculated_at: '2023-01-01T12:27:44Z',
    signals: {
      scroll_velocity: 0.35,
      form_interactions: 0.42,
      repeated_visits: 0.38,
      hover_bounce_pattern: 0.55
    }
  },
  'user-004': {
    user_id: 'user-004',
    score: 73,
    calculated_at: '2023-01-01T13:08:12Z',
    signals: {
      scroll_velocity: 0.68,
      form_interactions: 0.75,
      repeated_visits: 0.82,
      hover_bounce_pattern: 0.62
    }
  },
  'user-005': {
    user_id: 'user-005',
    score: 59,
    calculated_at: '2023-01-01T09:45:33Z',
    signals: {
      scroll_velocity: 0.45,
      form_interactions: 0.65,
      repeated_visits: 0.55,
      hover_bounce_pattern: 0.72
    }
  }
};

// Dummy profile data
export const dummyProfiles = {
  'user-001': {
    user_id: 'user-001',
    profile_type: 'Fast-Mover',
    confidence: 0.87,
    created_at: '2023-01-01T10:23:45Z',
    last_updated: '2023-01-01T14:55:21Z',
    dominant_signals: ['quick_navigation', 'skimming', 'minimal_details_viewed']
  },
  'user-002': {
    user_id: 'user-002',
    profile_type: 'Proof-Driven',
    confidence: 0.92,
    created_at: '2023-01-01T11:05:22Z',
    last_updated: '2023-01-01T11:32:18Z',
    dominant_signals: ['detail_focus', 'case_study_interest', 'testimonial_views']
  },
  'user-003': {
    user_id: 'user-003',
    profile_type: 'Skeptic',
    confidence: 0.76,
    created_at: '2023-01-01T12:15:33Z',
    last_updated: '2023-01-01T12:27:44Z',
    dominant_signals: ['high_bounce_rate', 'limited_engagement', 'quick_exits']
  },
  'user-004': {
    user_id: 'user-004',
    profile_type: 'Reassurer',
    confidence: 0.81,
    created_at: '2023-01-01T13:08:12Z',
    last_updated: '2023-01-01T13:08:12Z',
    dominant_signals: ['repeated_section_views', 'help_section_views', 'chat_interactions']
  },
  'user-005': {
    user_id: 'user-005',
    profile_type: 'Proof-Driven',
    confidence: 0.68,
    created_at: '2023-01-01T09:45:33Z',
    last_updated: '2023-01-01T09:45:33Z',
    dominant_signals: ['detail_focus', 'testimonial_views']
  }
};

// Dummy ad metrics
export const dummyAdMetrics = {
  metrics: [
    {
      campaign_id: 'camp-001',
      ad_id: 'ad-001',
      date: '2023-01-01',
      spend: 1000.00,
      impressions: 10000,
      clicks: 500,
      conversions: 50,
      ctr: 0.05,
      roas: 3.5
    },
    {
      campaign_id: 'camp-001',
      ad_id: 'ad-002',
      date: '2023-01-01',
      spend: 1500.00,
      impressions: 15000,
      clicks: 600,
      conversions: 55,
      ctr: 0.04,
      roas: 2.8
    },
    {
      campaign_id: 'camp-002',
      ad_id: 'ad-003',
      date: '2023-01-01',
      spend: 800.00,
      impressions: 8000,
      clicks: 320,
      conversions: 32,
      ctr: 0.04,
      roas: 3.2
    },
    {
      campaign_id: 'camp-002',
      ad_id: 'ad-004',
      date: '2023-01-01',
      spend: 2000.00,
      impressions: 20000,
      clicks: 1200,
      conversions: 120,
      ctr: 0.06,
      roas: 4.2
    }
  ]
};

// Dummy strategy recommendations
export const dummyStrategy = {
  recommendations: [
    'Increase ad spend on high-ROAS campaigns',
    'Optimize landing page for Proof-Driven profiles',
    'Add more testimonials and case studies'
  ],
  confidence: 0.8,
  generated_at: '2023-01-01T12:00:00Z'
};

// Dummy overview dashboard data
export const dummyDashboardData = {
  readinessData: {
    averageScore: 72,
    userCount: 157,
    recentTrend: 'increasing',
  },
  profileDistribution: {
    'Fast-Mover': 35,
    'Proof-Driven': 42,
    'Reassurer': 15,
    'Skeptic': 8
  },
  adMetrics: {
    totalSpend: 15780,
    impressions: 158900,
    clicks: 7945,
    ctr: 5.0,
    roas: 3.2
  }
}; 