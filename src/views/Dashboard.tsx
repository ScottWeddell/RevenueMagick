import React, { useState, useEffect } from 'react';
import IntelligenceModule from '../components/IntelligenceModule';
import StructuralTension from '../components/StructuralTension';
import ReadinessScore from '../components/ReadinessScore';
import NeuromindProfileBadge from '../components/NeuromindProfileBadge';
import NeuralGlyph from '../components/NeuralGlyph';
import { apiClient } from '../lib/api';
import { getFallbackData, isProduction } from '../utils/fallbackData';

// Types for the dashboard data
interface DashboardData {
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
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      // If in production/deployed environment, use fallback data immediately
      if (isProduction()) {
        console.log('Production environment detected - using fallback data');
        setDashboardData(getFallbackData('dashboard') as DashboardData);
        setError('Demo Mode - Using sample data');
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await apiClient.getDashboardData(30);
        setDashboardData(data);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        
        // Fallback to comprehensive fallback data
        setDashboardData(getFallbackData('dashboard') as DashboardData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <NeuralGlyph size={48} animated variant="complex" />
          <p className="mt-4 text-gray-600">Loading Revenue Superintelligence...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { 
    metric_intelligence, 
    customer_intelligence, 
    ad_intelligence, 
    behavior_intelligence, 
    market_intelligence, 
    copy_intelligence, 
    neuromind_profiles, 
    structural_tension 
  } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-header-title">
            <NeuralGlyph size={36} variant="complex" />
            Revenue Superintelligence Dashboard™
          </h1>
          <p className="page-header-description">
            Six Intelligence Modules working in harmony to decode subconscious buying behavior
          </p>
          {error && (
            <p className={`text-sm mt-1 ${error.includes('Demo Mode') ? 'text-blue-600' : 'text-amber-600'}`}>
              {error.includes('Demo Mode') ? '🎯 Demo Mode - Showcasing Revenue Magick capabilities' : '⚠️ Using fallback data - API connection issue'}
            </p>
          )}
        </div>
        <div className="page-header-actions">
          <ReadinessScore score={customer_intelligence.average_readiness_score} size="lg" />
          <button className="btn-primary">
            Generate Strategic Insights
          </button>
        </div>
      </div>

      {/* Structural Tension Model */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StructuralTension
          currentValue={structural_tension.current_revenue}
          goalValue={structural_tension.goal_revenue}
          metric="Monthly Revenue"
          unit="$"
          description="The gap between your current reality and revenue goals creates productive tension that drives strategic action."
          actionItems={[
            "Optimize high-intent user journeys",
            "Reduce friction in checkout process",
            "Implement dynamic pricing strategy"
          ]}
        />
        <StructuralTension
          currentValue={structural_tension.current_cvr}
          goalValue={structural_tension.goal_cvr}
          metric="Conversion Rate"
          unit="%"
          description="Behavioral intelligence reveals conversion optimization opportunities."
          actionItems={[
            "Personalize CTAs by Neuromind Profile™",
            "A/B test social proof elements",
            "Optimize mobile experience"
          ]}
        />
        <StructuralTension
          currentValue={structural_tension.current_aov}
          goalValue={structural_tension.goal_aov}
          metric="Average Order Value"
          unit="$"
          description="Strategic upselling based on customer psychology patterns."
          actionItems={[
            "Bundle products for Optimizer profiles",
            "Add urgency for Fast-Mover profiles",
            "Provide detailed specs for Proof-Driven"
          ]}
        />
      </div>
      
      {/* Six Intelligence Modules */}
      <div>
        <h2 className="text-2xl font-display font-semibold text-gray-900 mb-6">
          Six Intelligence Modules
        </h2>
        
        <div className="dashboard-grid">
          {/* Metric Intelligence */}
          <IntelligenceModule
            title="Metric Intelligence"
            value={`${metric_intelligence.cvr}%`}
            trend={{ direction: 'up', percentage: 12.5, period: 'last 30 days' }}
            description="CVR analysis with behavioral context"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">AOV</div>
                <div className="font-semibold">${metric_intelligence.aov}</div>
              </div>
              <div>
                <div className="text-gray-500">ROAS</div>
                <div className="font-semibold">{metric_intelligence.roas}x</div>
              </div>
            </div>
          </IntelligenceModule>

          {/* Customer Intelligence */}
          <IntelligenceModule
            title="Customer Intelligence"
            value={customer_intelligence.total_users.toLocaleString()}
            trend={{ direction: 'up', percentage: 8.3, period: 'last 30 days' }}
            description="Engagement, readiness, and churn analysis"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          >
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">High Readiness</span>
                <span className="font-semibold text-green-600">{customer_intelligence.high_readiness_users}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Churn Risk</span>
                <span className="font-semibold text-red-600">{customer_intelligence.churn_risk}%</span>
              </div>
            </div>
          </IntelligenceModule>

          {/* Copy Intelligence */}
          <IntelligenceModule
            title="Copy Intelligence"
            value={`${copy_intelligence.message_resonance}%`}
            trend={{ direction: 'up', percentage: 15.2, period: 'last 7 days' }}
            description="Message resonance and friction analysis"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Friction Points</span>
                <span className="font-semibold text-yellow-600">{copy_intelligence.friction_analysis}</span>
              </div>
            </div>
          </IntelligenceModule>

          {/* Ad Intelligence */}
          <IntelligenceModule
            title="Ad Intelligence"
            value={`$${(ad_intelligence.ad_spend / 1000).toFixed(1)}k`}
            trend={{ direction: 'down', percentage: 5.7, period: 'last 30 days' }}
            description="Channel ROI and creative performance"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            }
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">CTR</div>
                <div className="font-semibold">{ad_intelligence.ctr}%</div>
              </div>
              <div>
                <div className="text-gray-500">Conversions</div>
                <div className="font-semibold">{ad_intelligence.conversions}</div>
              </div>
            </div>
          </IntelligenceModule>

          {/* Behavior Intelligence */}
          <IntelligenceModule
            title="Behavior Intelligence"
            value={`${behavior_intelligence.avg_session_duration}m`}
            trend={{ direction: 'up', percentage: 22.1, period: 'last 14 days' }}
            description="Conversion hesitations and friction loops"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
          >
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bounce Rate</span>
                <span className="font-semibold">{behavior_intelligence.bounce_rate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Friction Points</span>
                <span className="font-semibold text-orange-600">{behavior_intelligence.friction_points}</span>
              </div>
            </div>
          </IntelligenceModule>

          {/* Market Intelligence */}
          <IntelligenceModule
            title="Market Intelligence"
            value={`${market_intelligence.market_sentiment}%`}
            trend={{ direction: 'neutral', percentage: 2.1, period: 'last 30 days' }}
            description="Price trends and competitive positioning"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">vs. Competitor</span>
                <span className="font-semibold text-green-600">{market_intelligence.competitor_price_diff}%</span>
              </div>
            </div>
          </IntelligenceModule>
        </div>
      </div>

                {/* Neuromind Profile Distribution */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Neuromind Profile™ Distribution
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {neuromind_profiles.map((profile, index) => (
            <div key={profile.type} className="text-center">
              <NeuromindProfileBadge 
                profileType={profile.type as any} 
                size="lg" 
                className="mb-2"
              />
              <div className="text-2xl font-bold text-brand-blue">{profile.count}</div>
              <div className="text-sm text-gray-500">users</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <NeuralGlyph size={20} animated />
            AI Strategic Insights
          </h3>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-blue-900">High-Impact Opportunity Detected</h4>
                <p className="text-blue-700 text-sm mt-1">
                  {customer_intelligence.high_readiness_users} users show high readiness scores but haven't converted. Consider implementing urgency-based CTAs for Fast-Mover profiles and detailed product comparisons for Proof-Driven users.
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-medium text-green-900">Conversion Optimization Success</h4>
                <p className="text-green-700 text-sm mt-1">
                  Your recent A/B test on social proof elements increased conversion rate by 15.2% among Skeptic profiles. Consider expanding this approach to other profile types.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 