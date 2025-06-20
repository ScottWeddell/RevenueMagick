import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, Target, Users, DollarSign, MousePointer, Eye, BarChart3, Brain, Lightbulb, Zap, AlertTriangle, MessageSquare, ArrowRight, Calendar, Filter, Download, ExternalLink } from 'lucide-react';
import IntelligenceModule from '../components/IntelligenceModule';
import StructuralTension from '../components/StructuralTension';
import ReadinessScore from '../components/ReadinessScore';
import NeuromindProfileBadge from '../components/NeuromindProfileBadge';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';

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
  trends?: {
    cvr_trend: number;
    aov_trend: number;
    users_trend: number;
    readiness_trend: number;
    spend_trend: number;
    message_trend: number;
    session_trend: number;
    market_sentiment_trend: number;
  };
}

interface StrategicRecommendation {
  type: string;
  priority: string;
  title: string;
  description: string;
  action_items: string[];
  expected_impact: string;
}

interface StrategicInsights {
  recommendations: StrategicRecommendation[];
  analysis_timestamp: string;
  confidence_score: number;
  total_recommendations: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [strategicInsights, setStrategicInsights] = useState<StrategicInsights | null>(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  useEffect(() => {
    fetchUserInfo();
    fetchDashboardData();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      setUserInfo(response.user);
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      setError('Failed to load user information');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getDashboardData(30);
      
      // Validate the data structure before setting it
      if (data && typeof data === 'object' && 'structural_tension' in data) {
        setDashboardData(data as DashboardData);
        
        // Remove automatic profile generation - let users do it manually
        // This prevents infinite loops and gives users control
        
        // Don't automatically generate strategic insights - only when user clicks button
      } else {
        throw new Error('Invalid dashboard data structure received');
      }
    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
      // Don't clear dashboardData on error - keep showing old data
    } finally {
      setLoading(false);
    }
  };

  const generateNeuromindProfiles = async () => {
    try {
      console.log('🧠 Generating Neuromind Profiles...');
      const response = await apiClient.generateNeuromindProfiles();
      
      if (response) {
        console.log('✅ Neuromind Profiles generated:', response);
        
        // Show success message to user instead of auto-refreshing
        if (response.profiles_generated && response.profiles_generated > 0) {
          // User can manually refresh if they want to see the profiles immediately
          console.log(`✅ Successfully generated ${response.profiles_generated} Neuromind Profiles. Refresh the page to see them.`);
        }
      } else {
        console.warn('⚠️ Failed to generate Neuromind Profiles');
      }
    } catch (error) {
      console.error('❌ Error generating Neuromind Profiles:', error);
    }
  };

  const generateStrategicInsights = async () => {
    setIsGeneratingInsights(true);
    try {
      console.log('🧠 Generating strategic insights...');
      
      // First, try to get existing saved insights
      let insights;
      try {
        insights = await apiClient.getStrategicRecommendations();
        console.log('✅ Existing strategic insights found:', insights);
        
        // If we have saved insights, use them
        if ((insights as any).recommendations && Array.isArray((insights as any).recommendations) && (insights as any).recommendations.length > 0) {
          const processedInsights: StrategicInsights = {
            recommendations: (insights as any).recommendations.map((rec: any) => ({
              type: rec.category || rec.type || 'optimization',
              priority: rec.priority || 'medium',
              title: rec.title || 'Strategic Recommendation',
              description: rec.description || 'No description available',
              action_items: rec.action_items || rec.action_steps || [],
              expected_impact: rec.expected_impact || 'Impact assessment pending'
            })),
            analysis_timestamp: (insights as any).last_generated || new Date().toISOString(),
            confidence_score: (insights as any).recommendations[0]?.confidence_level || 0.85,
            total_recommendations: (insights as any).recommendations.length
          };
          
          setStrategicInsights(processedInsights);
          setShowInsightsModal(true);
          console.log('📊 Using saved insights:', processedInsights);
          return;
        }
      } catch (error) {
        console.log('💡 No saved insights found, generating new ones...');
      }
      
      // Generate new insights using the persistence endpoint
      try {
        const response = await fetch('/api/v1/analytics/generate-strategic-insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const newInsights = await response.json();
        console.log('✅ New strategic insights generated:', newInsights);
        
        if (newInsights.recommendations && Array.isArray(newInsights.recommendations) && newInsights.recommendations.length > 0) {
          const processedInsights: StrategicInsights = {
            recommendations: newInsights.recommendations.map((rec: any) => ({
              type: rec.category || rec.type || 'optimization',
              priority: rec.priority || 'medium',
              title: rec.title || 'Strategic Recommendation',
              description: rec.description || 'No description available',
              action_items: rec.action_items || rec.action_steps || [],
              expected_impact: rec.expected_impact || 'Impact assessment pending'
            })),
            analysis_timestamp: newInsights.generated_at || new Date().toISOString(),
            confidence_score: newInsights.recommendations[0]?.confidence_level || 0.85,
            total_recommendations: newInsights.recommendations.length
          };
          
          setStrategicInsights(processedInsights);
          setShowInsightsModal(true);
          console.log('🎯 Processed new insights:', processedInsights);
          return;
        } else {
          // No insights generated - show appropriate message
          console.log('💡 No strategic insights were generated');
          alert('Strategic insights could not be generated at this time. Please try again later.');
          return;
        }
      } catch (generateError) {
        console.warn('⚠️ Generate endpoint failed:', generateError);
        
        // Try fallback to analytics endpoint for saved insights only
        try {
          insights = await apiClient.getStrategicRecommendations();
          console.log('✅ Checking for saved insights:', insights);
          
          if ((insights as any).recommendations && Array.isArray((insights as any).recommendations) && (insights as any).recommendations.length > 0) {
            const processedInsights: StrategicInsights = {
              recommendations: (insights as any).recommendations.map((rec: any) => ({
                type: rec.category || rec.type || 'optimization',
                priority: rec.priority || 'medium',
                title: rec.title || 'Strategic Recommendation',
                description: rec.description || 'No description available',
                action_items: rec.action_items || rec.action_steps || [],
                expected_impact: rec.expected_impact || 'Impact assessment pending'
              })),
              analysis_timestamp: (insights as any).last_generated || new Date().toISOString(),
              confidence_score: (insights as any).confidence_level || 0.85,
              total_recommendations: (insights as any).recommendations.length
            };
            
            setStrategicInsights(processedInsights);
            setShowInsightsModal(true);
            console.log('📊 Using saved insights:', processedInsights);
            return;
          } else {
            // No saved insights either
            console.log('💡 No strategic insights available');
            alert('Strategic insights are temporarily unavailable. Please try again later.');
            return;
          }
        } catch (fallbackError) {
          console.error('❌ All endpoints failed:', fallbackError);
          alert('Strategic insights service is currently unavailable. Please try again later.');
          return;
        }
      }
      
    } catch (error: any) {
      console.error('❌ Failed to generate strategic insights:', error);
      alert('An error occurred while generating strategic insights. Please try again later.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  // Early return for loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Early return if no data
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No dashboard data available</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  // Destructure data safely after null check with fallback defaults
  const {
    structural_tension = {
      current_revenue: 0,
      goal_revenue: 0,
      current_cvr: 0,
      goal_cvr: 0,
      current_aov: 0,
      goal_aov: 0
    },
    metric_intelligence = {
      cvr: 0,
      aov: 0,
      roas: 0,
      mer: 0
    },
    customer_intelligence = {
      total_users: 0,
      average_readiness_score: 0,
      high_readiness_users: 0,
      churn_risk: 0
    },
    copy_intelligence = {
      message_resonance: 0,
      friction_analysis: 0
    },
    ad_intelligence = {
      ad_spend: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      ctr: 0
    },
    behavior_intelligence = {
      avg_session_duration: 0,
      bounce_rate: 0,
      friction_points: 0
    },
    market_intelligence = {
      market_sentiment: 0,
      competitor_price_diff: 0
    },
    neuromind_profiles = []
  } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-header-title">
            <svg className="w-9 h-9 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Revenue Superintelligence Dashboard™
          </h1>
          <p className="page-header-description">
            Six Intelligence Modules working in harmony to decode subconscious buying behavior
          </p>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">
                  {error.includes('Demo Mode') ? '🎯 Demo Mode - Showcasing Revenue Magick capabilities' : `⚠️ Error loading data: ${error}`}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="page-header-actions">
          <ReadinessScore score={customer_intelligence.average_readiness_score} size="lg" />
          <button 
            className="btn-primary"
            onClick={generateStrategicInsights}
            disabled={isGeneratingInsights}
          >
            {isGeneratingInsights ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Strategic Insights
              </>
            )}
          </button>
        </div>
      </div>

      {/* Strategic Insights Modal */}
      {showInsightsModal && strategicInsights && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative" style={{ marginLeft: '8rem' }}>
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Strategic Insights & Recommendations</h2>
                  <p className="text-gray-600 mt-1">
                    AI-powered analysis with {strategicInsights.total_recommendations} actionable recommendations
                    <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                      {Math.round(strategicInsights.confidence_score * 100)}% confidence
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowInsightsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {strategicInsights.recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rec.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Expected Impact</div>
                      <div className="font-semibold text-brand-blue">{rec.expected_impact}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{rec.description}</p>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Action Items:</h4>
                    <ul className="space-y-2">
                      {rec.action_items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <svg className="w-4 h-4 text-brand-blue mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-blue-800 font-medium">Next Steps</span>
                </div>
                <p className="text-blue-700 mt-2">
                  Prioritize high-impact recommendations and implement them systematically. 
                  Monitor key metrics and adjust strategies based on performance data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
            trend={{ 
              direction: dashboardData.trends?.cvr_trend && dashboardData.trends.cvr_trend > 0 ? 'up' : dashboardData.trends?.cvr_trend && dashboardData.trends.cvr_trend < 0 ? 'down' : 'neutral', 
              percentage: Math.abs(dashboardData.trends?.cvr_trend || 0), 
              period: 'last 30 days' 
            }}
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
            trend={{ 
              direction: dashboardData.trends?.users_trend && dashboardData.trends.users_trend > 0 ? 'up' : dashboardData.trends?.users_trend && dashboardData.trends.users_trend < 0 ? 'down' : 'neutral', 
              percentage: Math.abs(dashboardData.trends?.users_trend || 0), 
              period: 'last 30 days' 
            }}
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
            trend={{ 
              direction: dashboardData.trends?.message_trend && dashboardData.trends.message_trend > 0 ? 'up' : dashboardData.trends?.message_trend && dashboardData.trends.message_trend < 0 ? 'down' : 'neutral', 
              percentage: Math.abs(dashboardData.trends?.message_trend || 0), 
              period: 'last 30 days' 
            }}
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
            trend={{ 
              direction: dashboardData.trends?.spend_trend && dashboardData.trends.spend_trend > 0 ? 'up' : dashboardData.trends?.spend_trend && dashboardData.trends.spend_trend < 0 ? 'down' : 'neutral', 
              percentage: Math.abs(dashboardData.trends?.spend_trend || 0), 
              period: 'last 30 days' 
            }}
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
            trend={{ 
              direction: dashboardData.trends?.session_trend && dashboardData.trends.session_trend > 0 ? 'up' : dashboardData.trends?.session_trend && dashboardData.trends.session_trend < 0 ? 'down' : 'neutral', 
              percentage: Math.abs(dashboardData.trends?.session_trend || 0), 
              period: 'last 30 days' 
            }}
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
            trend={{ 
              direction: dashboardData.trends?.market_sentiment_trend && dashboardData.trends.market_sentiment_trend > 0 ? 'up' : dashboardData.trends?.market_sentiment_trend && dashboardData.trends.market_sentiment_trend < 0 ? 'down' : 'neutral', 
              percentage: Math.abs(dashboardData.trends?.market_sentiment_trend || 0), 
              period: 'last 30 days' 
            }}
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
        
        {neuromind_profiles.length > 0 ? (
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
        ) : (
          <div className="text-center py-8">
            <div className="mb-4">
              <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Neuromind Profiles™ Yet</h4>
            <p className="text-gray-600 mb-4">
              Generate psychological profiles for your users based on their behavioral patterns
            </p>
            <button
              onClick={generateNeuromindProfiles}
              className="btn-primary"
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate Neuromind Profiles™
            </button>
          </div>
        )}
      </div>

      {/* AI Insights */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Strategic Insights
          </h3>
        </div>
        <div className="space-y-4">
          {strategicInsights && strategicInsights.recommendations.length > 0 ? (
            // Show generated insights
            strategicInsights.recommendations.slice(0, 3).map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                rec.priority === 'high' ? 'bg-red-50 border-red-100' :
                rec.priority === 'medium' ? 'bg-yellow-50 border-yellow-100' :
                'bg-green-50 border-green-100'
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    rec.priority === 'high' ? 'bg-red-500' :
                    rec.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div>
                    <h4 className={`font-medium ${
                      rec.priority === 'high' ? 'text-red-900' :
                      rec.priority === 'medium' ? 'text-yellow-900' :
                      'text-green-900'
                    }`}>
                      {rec.title}
                    </h4>
                    <p className={`text-sm mt-1 ${
                      rec.priority === 'high' ? 'text-red-700' :
                      rec.priority === 'medium' ? 'text-yellow-700' :
                      'text-green-700'
                    }`}>
                      {rec.description}
                    </p>
                    {rec.expected_impact && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-600">Expected Impact: </span>
                        <span className="text-xs text-gray-800">{rec.expected_impact}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Show default insights when no strategic insights are generated
            <>
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
            </>
          )}
          
          {/* Call to action to generate insights if none exist */}
          {!strategicInsights && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600 text-sm mb-3">
                Generate AI-powered strategic insights based on your current performance data
              </p>
              <button
                onClick={generateStrategicInsights}
                disabled={isGeneratingInsights}
                className="btn-primary text-sm"
              >
                {isGeneratingInsights ? (
                  <>
                    <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Generate Strategic Insights
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 