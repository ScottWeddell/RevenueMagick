import React, { useState, useEffect } from 'react';
import NeuralGlyph from '../components/NeuralGlyph';
import IntelligenceModule from '../components/IntelligenceModule';
import StructuralTension from '../components/StructuralTension';
import { getFallbackData, isProduction } from '../utils/fallbackData';

// Types for Revenue Strategist data
interface StrategicRecommendation {
  id: string;
  title: string;
  category: 'conversion' | 'pricing' | 'acquisition' | 'retention' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  impact_score: number;
  effort_required: number;
  expected_revenue_lift: number;
  timeframe: string;
  description: string;
  action_steps: string[];
  success_metrics: string[];
  confidence: number;
  affected_segments: string[];
}

interface SmallCompoundingAction {
  id: string;
  title: string;
  description: string;
  effort_score: number; // 1-10 scale
  impact_score: number; // 1-10 scale
  leverage_ratio: number;
  implementation_time: string;
  category: string;
  status: 'suggested' | 'in_progress' | 'completed' | 'dismissed';
  expected_lift: number;
}

interface RevenueSimulation {
  id: string;
  scenario_name: string;
  current_metrics: {
    monthly_revenue: number;
    conversion_rate: number;
    average_order_value: number;
    traffic: number;
  };
  projected_metrics: {
    monthly_revenue: number;
    conversion_rate: number;
    average_order_value: number;
    traffic: number;
  };
  changes_applied: string[];
  confidence_interval: {
    low: number;
    high: number;
  };
  timeframe: string;
}

interface MarketInsight {
  type: 'trend' | 'opportunity' | 'threat' | 'competitive';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'short_term' | 'long_term';
  recommended_actions: string[];
  data_source: string;
}

const RevenueStrategist: React.FC = () => {
  const [recommendations, setRecommendations] = useState<StrategicRecommendation[]>([]);
  const [compoundingActions, setCompoundingActions] = useState<SmallCompoundingAction[]>([]);
  const [simulations, setSimulations] = useState<RevenueSimulation[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'recommendations' | 'actions' | 'simulations' | 'insights'>('recommendations');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // If in production/deployed environment, use fallback data immediately
      if (isProduction()) {
        console.log('Production environment detected - using fallback revenue strategist data');
        const strategistData = getFallbackData('revenueStrategist') as any;
        
        if (strategistData) {
          setRecommendations(strategistData.recommendations);
          setCompoundingActions(strategistData.compoundingActions);
          setSimulations(strategistData.simulations);
          setMarketInsights([]);
          setError('Demo Mode - Using sample data');
        }
        setIsLoading(false);
        return;
      }
      
      try {
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setRecommendations([
          {
            id: 'rec-001',
            title: 'Implement Dynamic Pricing for Fast-Mover Profiles',
            category: 'pricing',
            priority: 'high',
            impact_score: 0.87,
            effort_required: 0.6,
            expected_revenue_lift: 0.23,
            timeframe: '2-3 weeks',
            description: 'Fast-Mover profiles show 40% higher price tolerance. Implement dynamic pricing that increases prices by 15-20% for this segment during high-intent sessions.',
            action_steps: [
              'Set up A/B testing framework for pricing',
              'Create Fast-Mover profile detection logic',
              'Implement dynamic pricing engine',
              'Monitor conversion rates and revenue impact'
            ],
            success_metrics: ['Revenue per Fast-Mover visitor', 'Overall conversion rate maintenance', 'Segment-specific AOV'],
            confidence: 0.84,
            affected_segments: ['Fast-Mover', 'High-Intent Users']
          },
          {
            id: 'rec-002',
            title: 'Add Social Proof Elements for Skeptic Profiles',
            category: 'conversion',
            priority: 'high',
            impact_score: 0.72,
            effort_required: 0.3,
            expected_revenue_lift: 0.18,
            timeframe: '1-2 weeks',
            description: 'Skeptic profiles have 65% higher conversion rates when exposed to social proof. Add testimonials, reviews, and trust badges prominently.',
            action_steps: [
              'Collect customer testimonials and case studies',
              'Design trust badge placement strategy',
              'Implement dynamic social proof display',
              'A/B test different social proof formats'
            ],
            success_metrics: ['Skeptic segment conversion rate', 'Time on page for Skeptics', 'Form completion rates'],
            confidence: 0.91,
            affected_segments: ['Skeptic', 'Proof-Driven']
          },
          {
            id: 'rec-003',
            title: 'Optimize Mobile Experience for High-Traffic Sources',
            category: 'optimization',
            priority: 'medium',
            impact_score: 0.65,
            effort_required: 0.8,
            expected_revenue_lift: 0.15,
            timeframe: '3-4 weeks',
            description: 'Mobile traffic from Facebook Ads shows 45% lower conversion rates. Optimize mobile funnel and implement mobile-specific CTAs.',
            action_steps: [
              'Audit mobile user experience',
              'Redesign mobile checkout flow',
              'Implement mobile-optimized CTAs',
              'Test mobile-specific offers'
            ],
            success_metrics: ['Mobile conversion rate', 'Mobile bounce rate', 'Mobile AOV'],
            confidence: 0.76,
            affected_segments: ['Mobile Users', 'Facebook Traffic']
          }
        ]);

        setCompoundingActions([
          {
            id: 'action-001',
            title: 'Add Exit-Intent Popup for High Readiness Users',
            description: 'Show targeted offers to users with readiness scores >80 when they show exit intent',
            effort_score: 2,
            impact_score: 7,
            leverage_ratio: 3.5,
            implementation_time: '2 hours',
            category: 'Conversion Optimization',
            status: 'suggested',
            expected_lift: 0.08
          },
          {
            id: 'action-002',
            title: 'Personalize Email Subject Lines by Profile',
            description: 'Use Neuromind Profile data to customize email subject lines for better open rates',
            effort_score: 3,
            impact_score: 6,
            leverage_ratio: 2.0,
            implementation_time: '4 hours',
            category: 'Email Marketing',
            status: 'in_progress',
            expected_lift: 0.12
          },
          {
            id: 'action-003',
            title: 'Add Urgency Timers for Fast-Mover Profiles',
            description: 'Display countdown timers on product pages when Fast-Mover profiles are detected',
            effort_score: 4,
            impact_score: 8,
            leverage_ratio: 2.0,
            implementation_time: '6 hours',
            category: 'Personalization',
            status: 'suggested',
            expected_lift: 0.15
          },
          {
            id: 'action-004',
            title: 'Optimize Page Load Speed for Mobile',
            description: 'Compress images and optimize mobile page load times to reduce bounce rate',
            effort_score: 6,
            impact_score: 7,
            leverage_ratio: 1.17,
            implementation_time: '1 day',
            category: 'Technical Optimization',
            status: 'completed',
            expected_lift: 0.09
          }
        ]);

        setSimulations([
          {
            id: 'sim-001',
            scenario_name: 'Implement Top 3 Recommendations',
            current_metrics: {
              monthly_revenue: 127500,
              conversion_rate: 3.2,
              average_order_value: 127.50,
              traffic: 31250
            },
            projected_metrics: {
              monthly_revenue: 178500,
              conversion_rate: 4.1,
              average_order_value: 139.20,
              traffic: 31250
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
          },
          {
            id: 'sim-002',
            scenario_name: 'Focus on Conversion Rate Only',
            current_metrics: {
              monthly_revenue: 127500,
              conversion_rate: 3.2,
              average_order_value: 127.50,
              traffic: 31250
            },
            projected_metrics: {
              monthly_revenue: 159375,
              conversion_rate: 4.0,
              average_order_value: 127.50,
              traffic: 31250
            },
            changes_applied: [
              'Social proof implementation',
              'Mobile UX optimization',
              'Checkout flow improvements'
            ],
            confidence_interval: {
              low: 0.90,
              high: 0.95
            },
            timeframe: '4-6 weeks'
          }
        ]);

        setMarketInsights([
          {
            type: 'opportunity',
            title: 'Competitor Price Increase Creates Opening',
            description: 'Main competitor increased prices by 20% last week. Opportunity to capture price-sensitive customers while maintaining premium positioning.',
            impact: 'high',
            urgency: 'immediate',
            recommended_actions: [
              'Launch competitive pricing campaign',
              'Highlight value proposition vs competitor',
              'Target competitor\'s customers with ads'
            ],
            data_source: 'Competitive Intelligence'
          },
          {
            type: 'trend',
            title: 'Increased Demand for Mobile-First Solutions',
            description: 'Industry data shows 35% increase in mobile-first buyer behavior. Mobile optimization is becoming critical for conversion.',
            impact: 'medium',
            urgency: 'short_term',
            recommended_actions: [
              'Prioritize mobile experience improvements',
              'Develop mobile-specific features',
              'Test mobile-first messaging'
            ],
            data_source: 'Industry Reports'
          },
          {
            type: 'threat',
            title: 'Economic Uncertainty Affecting Purchase Decisions',
            description: 'Market data indicates increased price sensitivity and longer decision cycles across target demographics.',
            impact: 'medium',
            urgency: 'short_term',
            recommended_actions: [
              'Emphasize ROI and value in messaging',
              'Offer flexible payment options',
              'Create risk-reduction guarantees'
            ],
            data_source: 'Economic Indicators'
          }
        ]);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch revenue strategist data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Revenue Strategist data');
        
        // Fallback to comprehensive fallback data on error
        const strategistData = getFallbackData('revenueStrategist') as any;
        
        if (strategistData) {
          setRecommendations(strategistData.recommendations);
          setCompoundingActions(strategistData.compoundingActions);
          setSimulations(strategistData.simulations);
          setMarketInsights([]);
        }
        
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'conversion': return 'bg-blue-100 text-blue-800';
      case 'pricing': return 'bg-purple-100 text-purple-800';
      case 'acquisition': return 'bg-green-100 text-green-800';
      case 'retention': return 'bg-yellow-100 text-yellow-800';
      case 'optimization': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'suggested': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'threat': return 'bg-red-50 border-red-200';
      case 'trend': return 'bg-blue-50 border-blue-200';
      case 'competitive': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-red-600 bg-red-100';
      case 'short_term': return 'text-yellow-600 bg-yellow-100';
      case 'long_term': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <NeuralGlyph size={48} animated variant="complex" />
          <p className="mt-4 text-gray-600">Generating Strategic Insights...</p>
        </div>
      </div>
    );
  }

  if (error && !error.includes('Demo Mode')) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-header-title">
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Revenue Strategist Engine™
          </h1>
          <p className="page-header-description">
            AI-powered strategic recommendations and revenue optimization insights
            {error && error.includes('Demo Mode') && (
              <span className="ml-2 text-blue-600 font-medium">🎯 Demo Mode - Showcasing Revenue Magick capabilities</span>
            )}
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn-secondary">
            Generate New Insights
          </button>
          <button className="btn-primary">
            Export Strategy Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-grid">
        <IntelligenceModule
          title="Active Recommendations"
          value={recommendations.filter(r => r.priority === 'high').length}
          trend={{ direction: 'up', percentage: 25.0, period: 'this week' }}
          description="High-priority strategic actions"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Potential Revenue Lift"
          value={`${(recommendations.reduce((sum, r) => sum + r.expected_revenue_lift, 0) * 100).toFixed(0)}%`}
          description="From implementing all recommendations"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Quick Wins Available"
          value={compoundingActions.filter(a => a.effort_score <= 3 && a.impact_score >= 6).length}
          description="High-impact, low-effort actions"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Market Opportunities"
          value={marketInsights.filter(i => i.type === 'opportunity').length}
          description="Immediate market opportunities"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          }
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'recommendations', label: 'Strategic Recommendations', count: recommendations.length },
            { id: 'actions', label: 'Small Compounding Actions™', count: compoundingActions.length },
            { id: 'simulations', label: 'Revenue Simulations', count: simulations.length },
            { id: 'insights', label: 'Market Insights', count: marketInsights.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'recommendations' && (
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div key={rec.id} className="intelligence-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(rec.priority)}`}>
                      {rec.priority} priority
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getCategoryColor(rec.category)}`}>
                      {rec.category}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{rec.description}</p>
                  
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Expected Lift</div>
                      <div className="text-xl font-bold text-green-600">
                        +{(rec.expected_revenue_lift * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Impact Score</div>
                      <div className="text-xl font-bold text-brand-blue">
                        {(rec.impact_score * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Effort Required</div>
                      <div className="text-xl font-bold text-gray-700">
                        {(rec.effort_required * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Confidence</div>
                      <div className="text-xl font-bold text-purple-600">
                        {(rec.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-6">
                  <div className="text-sm text-gray-500">Timeframe</div>
                  <div className="font-semibold">{rec.timeframe}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Action Steps:</h4>
                  <ul className="space-y-1">
                    {rec.action_steps.map((step, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-brand-blue mt-1">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Success Metrics:</h4>
                  <ul className="space-y-1">
                    {rec.success_metrics.map((metric, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div className="flex gap-2">
                  {rec.affected_segments.map((segment, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-brand-ice text-brand-blue rounded">
                      {segment}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost text-sm">
                    View Details
                  </button>
                  <button className="btn-primary text-sm">
                    Implement
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'actions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {compoundingActions.map((action) => (
            <div key={action.id} className="intelligence-card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-700 mb-3">{action.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${getStatusColor(action.status)}`}>
                  {action.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-500">Effort</div>
                  <div className="text-lg font-bold">{action.effort_score}/10</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Impact</div>
                  <div className="text-lg font-bold text-brand-blue">{action.impact_score}/10</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Leverage</div>
                  <div className="text-lg font-bold text-green-600">{action.leverage_ratio.toFixed(1)}x</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-500">Time: </span>
                  <span className="font-medium">{action.implementation_time}</span>
                </div>
                <div>
                  <span className="text-gray-500">Expected Lift: </span>
                  <span className="font-medium text-green-600">+{(action.expected_lift * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{action.category}</span>
                  <div className="flex gap-2">
                    {action.status === 'suggested' && (
                      <>
                        <button className="btn-ghost text-xs">
                          Dismiss
                        </button>
                        <button className="btn-primary text-xs">
                          Start
                        </button>
                      </>
                    )}
                    {action.status === 'in_progress' && (
                      <button className="btn-secondary text-xs">
                        Mark Complete
                      </button>
                    )}
                    {action.status === 'completed' && (
                      <span className="text-xs text-green-600 font-medium">✓ Completed</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'simulations' && (
        <div className="space-y-6">
          {simulations.map((sim) => (
            <div key={sim.id} className="intelligence-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{sim.scenario_name}</h3>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Confidence</div>
                  <div className="font-semibold">
                    {(sim.confidence_interval.low * 100).toFixed(0)}% - {(sim.confidence_interval.high * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Current State</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Revenue:</span>
                      <span className="font-semibold">${sim.current_metrics.monthly_revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate:</span>
                      <span className="font-semibold">{sim.current_metrics.conversion_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Order Value:</span>
                      <span className="font-semibold">${sim.current_metrics.average_order_value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Traffic:</span>
                      <span className="font-semibold">{sim.current_metrics.traffic.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Projected Results</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Revenue:</span>
                      <div className="text-right">
                        <span className="font-semibold">${sim.projected_metrics.monthly_revenue.toLocaleString()}</span>
                        <span className="text-green-600 text-sm ml-2">
                          (+{(((sim.projected_metrics.monthly_revenue - sim.current_metrics.monthly_revenue) / sim.current_metrics.monthly_revenue) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion Rate:</span>
                      <div className="text-right">
                        <span className="font-semibold">{sim.projected_metrics.conversion_rate}%</span>
                        <span className="text-green-600 text-sm ml-2">
                          (+{(((sim.projected_metrics.conversion_rate - sim.current_metrics.conversion_rate) / sim.current_metrics.conversion_rate) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Order Value:</span>
                      <div className="text-right">
                        <span className="font-semibold">${sim.projected_metrics.average_order_value}</span>
                        <span className="text-green-600 text-sm ml-2">
                          (+{(((sim.projected_metrics.average_order_value - sim.current_metrics.average_order_value) / sim.current_metrics.average_order_value) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly Traffic:</span>
                      <span className="font-semibold">{sim.projected_metrics.traffic.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Changes Applied:</h4>
                <ul className="space-y-1">
                  {sim.changes_applied.map((change, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-brand-blue mt-1">•</span>
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Implementation timeframe: {sim.timeframe}
                </div>
                <button className="btn-primary text-sm">
                  Run This Simulation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'insights' && (
        <div className="space-y-6">
          {marketInsights.map((insight, index) => (
            <div key={index} className={`p-6 rounded-lg border ${getInsightTypeColor(insight.type)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${getUrgencyColor(insight.urgency)}`}>
                      {insight.urgency.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {insight.impact} impact
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{insight.description}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  insight.type === 'opportunity' ? 'bg-green-500' :
                  insight.type === 'threat' ? 'bg-red-500' :
                  insight.type === 'trend' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`}></div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Recommended Actions:</h4>
                <ul className="space-y-1">
                  {insight.recommended_actions.map((action, actionIndex) => (
                    <li key={actionIndex} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-brand-blue mt-1">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Source: {insight.data_source}
                </div>
                <button className="btn-secondary text-sm">
                  Create Action Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RevenueStrategist; 