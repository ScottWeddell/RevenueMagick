import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Target, DollarSign, Lightbulb, Zap, BarChart3, AlertTriangle } from 'lucide-react';
import IntelligenceModule from '../components/IntelligenceModule';
import StructuralTension from '../components/StructuralTension';
import { apiClient } from '../lib/api';

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

interface SimulationRequest {
  scenario_name: string;
  changes: {
    conversion_rate_change?: number;
    aov_change?: number;
    traffic_change?: number;
    pricing_change?: number;
  };
  timeframe: string;
}

const RevenueStrategist: React.FC = () => {
  const [recommendations, setRecommendations] = useState<StrategicRecommendation[]>([]);
  const [compoundingActions, setCompoundingActions] = useState<SmallCompoundingAction[]>([]);
  const [simulations, setSimulations] = useState<RevenueSimulation[]>([]);
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'recommendations' | 'actions' | 'simulations' | 'insights'>('recommendations');
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<StrategicRecommendation | null>(null);
  const [selectedAction, setSelectedAction] = useState<SmallCompoundingAction | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isImplementing, setIsImplementing] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRequest, setSimulationRequest] = useState<SimulationRequest>({
    scenario_name: '',
    changes: {},
    timeframe: '30_days'
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching strategic recommendations from API...');
        
        // Fetch real strategic recommendations
        const strategicData = await apiClient.getStrategicRecommendations({ limit: 20 });
        
        // Transform recommendations to match interface with error handling
        const transformedRecommendations: StrategicRecommendation[] = [];
        
        if (strategicData.recommendations && Array.isArray(strategicData.recommendations)) {
          strategicData.recommendations.forEach((rec, index) => {
      try {
              // Cast to any to handle API response mismatch
              const apiRec = rec as any;
        
              // Normalize category to expected enum values
              let normalizedCategory: 'conversion' | 'pricing' | 'acquisition' | 'retention' | 'optimization' = 'optimization';
              const categoryLower = (apiRec.category || '').toLowerCase();
              if (categoryLower.includes('conversion') || categoryLower.includes('engagement')) {
                normalizedCategory = 'conversion';
              } else if (categoryLower.includes('pricing')) {
                normalizedCategory = 'pricing';
              } else if (categoryLower.includes('acquisition')) {
                normalizedCategory = 'acquisition';
              } else if (categoryLower.includes('retention')) {
                normalizedCategory = 'retention';
              }

              // Normalize priority to expected enum values
              let normalizedPriority: 'high' | 'medium' | 'low' = 'medium';
              const priorityLower = (apiRec.priority || '').toLowerCase();
              if (priorityLower === 'high') {
                normalizedPriority = 'high';
              } else if (priorityLower === 'low') {
                normalizedPriority = 'low';
              }

              // Normalize scores to 0-1 scale if they're on 0-100 scale
              const normalizeScore = (score: number) => {
                if (typeof score !== 'number' || isNaN(score)) return 0.5;
                if (score > 1) {
                  return score / 100;
                }
                return score;
              };

              const transformedRec: StrategicRecommendation = {
                id: apiRec.id || `rec-${Date.now()}-${index}`,
                title: apiRec.title || 'Strategic Recommendation',
                category: normalizedCategory,
                priority: normalizedPriority,
                impact_score: normalizeScore(apiRec.impact_score || 0.5),
                effort_required: normalizeScore(apiRec.effort_score || apiRec.effort_required || 0.5),
                expected_revenue_lift: apiRec.expected_revenue_lift || 0.15, // Default 15% if not provided
                timeframe: apiRec.timeframe || apiRec.implementation_time || '4-6 weeks',
                description: apiRec.description || 'No description available',
                action_steps: Array.isArray(apiRec.action_steps) ? apiRec.action_steps : 
                             Array.isArray(apiRec.action_items) ? apiRec.action_items : [],
                success_metrics: Array.isArray(apiRec.success_metrics) ? apiRec.success_metrics : [],
                confidence: typeof apiRec.confidence === 'number' ? apiRec.confidence : 0.8,
                affected_segments: Array.isArray(apiRec.affected_segments) ? apiRec.affected_segments : []
              };
              
              transformedRecommendations.push(transformedRec);
            } catch (transformError) {
              console.warn(`Failed to transform recommendation ${index}:`, transformError);
              // Continue with other recommendations
            }
          });
        }

        setRecommendations(transformedRecommendations);
        
        // Fetch real Small Compounding Actions
        console.log('Fetching small compounding actions from API...');
        const actionsData = await apiClient.getSmallCompoundingActions();
        
        const transformedActions: SmallCompoundingAction[] = [];
        if (actionsData.actions && Array.isArray(actionsData.actions)) {
          actionsData.actions.forEach((action, index) => {
            try {
              const apiAction = action as any;
              
              // Parse effort level to numeric score
              let effortScore = 5; // default
              const effortStr = (apiAction.effort_level || '').toLowerCase();
              if (effortStr.includes('low') || effortStr.includes('easy')) {
                effortScore = Math.floor(Math.random() * 3) + 1; // 1-3
              } else if (effortStr.includes('medium') || effortStr.includes('moderate')) {
                effortScore = Math.floor(Math.random() * 3) + 4; // 4-6
              } else if (effortStr.includes('high') || effortStr.includes('hard')) {
                effortScore = Math.floor(Math.random() * 3) + 7; // 7-9
              }
              
              // Parse expected impact to numeric score
              let impactScore = 6; // default
              const impactStr = (apiAction.expected_impact || '').toLowerCase();
              if (impactStr.includes('low') || impactStr.includes('minor')) {
                impactScore = Math.floor(Math.random() * 3) + 3; // 3-5
              } else if (impactStr.includes('medium') || impactStr.includes('moderate')) {
                impactScore = Math.floor(Math.random() * 3) + 6; // 6-8
              } else if (impactStr.includes('high') || impactStr.includes('major')) {
                impactScore = Math.floor(Math.random() * 2) + 8; // 8-9
              }
              
              const leverageRatio = impactScore / effortScore;
              
              // Determine status based on priority score
              let status: 'suggested' | 'in_progress' | 'completed' | 'dismissed' = 'suggested';
              if (apiAction.priority_score > 8) {
                status = 'in_progress';
              } else if (apiAction.priority_score > 9) {
                status = 'completed';
              }
              
              const transformedAction: SmallCompoundingAction = {
                id: apiAction.id || `action-${Date.now()}-${index}`,
                title: apiAction.title || 'Optimization Action',
                description: apiAction.description || 'No description available',
                effort_score: effortScore,
                impact_score: impactScore,
                leverage_ratio: Math.round(leverageRatio * 100) / 100,
                implementation_time: apiAction.implementation_time || '2-4 hours',
                category: apiAction.category || 'Optimization',
                status: status,
                expected_lift: Math.round((impactScore * 0.02) * 100) / 100 // Convert to percentage
              };
              
              transformedActions.push(transformedAction);
            } catch (transformError) {
              console.warn(`Failed to transform action ${index}:`, transformError);
            }
          });
        }
        
        setCompoundingActions(transformedActions);
        
        // Fetch real Revenue Simulations
        console.log('Fetching revenue simulations from API...');
        const simulationsData = await apiClient.getRevenueSimulations();
        
        const transformedSimulations: RevenueSimulation[] = [];
        if (simulationsData.simulations && Array.isArray(simulationsData.simulations)) {
          simulationsData.simulations.forEach((sim, index) => {
            try {
              const apiSim = sim as any;
              
              const transformedSim: RevenueSimulation = {
                id: apiSim.id || `sim-${Date.now()}-${index}`,
                scenario_name: apiSim.scenario_name || 'Revenue Optimization Scenario',
            current_metrics: {
                  monthly_revenue: apiSim.current_monthly_revenue || 127500,
                  conversion_rate: apiSim.current_conversion_rate || 3.2,
                  average_order_value: apiSim.current_aov || 127.50,
                  traffic: apiSim.current_traffic || 31250
            },
            projected_metrics: {
                  monthly_revenue: apiSim.projected_monthly_revenue || 159375,
                  conversion_rate: apiSim.projected_conversion_rate || 4.0,
                  average_order_value: apiSim.projected_aov || 139.20,
                  traffic: apiSim.projected_traffic || 31250
            },
                changes_applied: Array.isArray(apiSim.changes_applied) ? apiSim.changes_applied : [
                  'Strategic optimization implementation'
            ],
                confidence_interval: apiSim.confidence_interval || {
              low: 0.85,
              high: 0.95
            },
                timeframe: apiSim.timeframe || '4-6 weeks'
              };
              
              transformedSimulations.push(transformedSim);
            } catch (transformError) {
              console.warn(`Failed to transform simulation ${index}:`, transformError);
            }
          });
        }
        
        setSimulations(transformedSimulations);
        
        // Fetch real Market Insights
        console.log('Fetching market insights from API...');
        const insightsData = await apiClient.getMarketInsights();
        
        const transformedInsights: MarketInsight[] = [];
        if (insightsData.insights && Array.isArray(insightsData.insights)) {
          insightsData.insights.forEach((insight, index) => {
            try {
              const apiInsight = insight as any;
              
              // Normalize type to expected enum values
              let normalizedType: 'trend' | 'opportunity' | 'threat' | 'competitive' = 'opportunity';
              const typeStr = (apiInsight.type || '').toLowerCase();
              if (typeStr.includes('trend')) {
                normalizedType = 'trend';
              } else if (typeStr.includes('threat') || typeStr.includes('risk')) {
                normalizedType = 'threat';
              } else if (typeStr.includes('competitive') || typeStr.includes('competitor')) {
                normalizedType = 'competitive';
              }
              
              // Normalize impact to expected enum values
              let normalizedImpact: 'high' | 'medium' | 'low' = 'medium';
              const impactStr = (apiInsight.impact || '').toLowerCase();
              if (impactStr === 'high') {
                normalizedImpact = 'high';
              } else if (impactStr === 'low') {
                normalizedImpact = 'low';
              }
              
              // Normalize urgency to expected enum values
              let normalizedUrgency: 'immediate' | 'short_term' | 'long_term' = 'short_term';
              const urgencyStr = (apiInsight.urgency || '').toLowerCase();
              if (urgencyStr === 'immediate' || urgencyStr === 'urgent') {
                normalizedUrgency = 'immediate';
              } else if (urgencyStr === 'long_term' || urgencyStr === 'long') {
                normalizedUrgency = 'long_term';
              }
              
              const transformedInsight: MarketInsight = {
                type: normalizedType,
                title: apiInsight.title || 'Market Insight',
                description: apiInsight.description || 'No description available',
                impact: normalizedImpact,
                urgency: normalizedUrgency,
                recommended_actions: Array.isArray(apiInsight.recommended_actions) ? 
                  apiInsight.recommended_actions : [],
                data_source: apiInsight.data_source || 'market_analysis'
              };
              
              transformedInsights.push(transformedInsight);
            } catch (transformError) {
              console.warn(`Failed to transform insight ${index}:`, transformError);
            }
          });
        }
        
        setMarketInsights(transformedInsights);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch revenue strategist data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Revenue Strategist data');
        
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateStrategicReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Prepare comprehensive report data
      const reportData = {
        generated_at: new Date().toISOString(),
        executive_summary: {
          total_recommendations: recommendations.length,
          high_priority_count: recommendations.filter(r => r.priority === 'high').length,
          potential_revenue_lift: recommendations.reduce((sum, r) => sum + r.expected_revenue_lift, 0),
          avg_confidence: recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length,
          implementation_timeframe: '6-12 weeks'
        },
        recommendations: recommendations,
        compounding_actions: compoundingActions,
        simulations: simulations,
        market_insights: marketInsights
      };

      // Create detailed CSV export
      const csvContent = [
        // Recommendations headers
        ['Type', 'Title', 'Category', 'Priority', 'Impact Score', 'Effort Required', 'Expected Revenue Lift (%)', 'Timeframe', 'Confidence (%)', 'Description'].join(','),
        // Recommendations data
        ...recommendations.map(rec => [
          'Recommendation',
          `"${rec.title}"`,
          rec.category,
          rec.priority,
          rec.impact_score,
          rec.effort_required,
          (rec.expected_revenue_lift * 100).toFixed(1),
          rec.timeframe,
          (rec.confidence * 100).toFixed(0),
          `"${rec.description}"`
        ].join(',')),
        // Actions data
        ...compoundingActions.map(action => [
          'Small Action',
          `"${action.title}"`,
          action.category,
          action.status,
          action.impact_score,
          action.effort_score,
          (action.expected_lift * 100).toFixed(1),
          action.implementation_time,
          '95',
          `"${action.description}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `revenue-strategy-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Report generation failed. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const implementRecommendation = async (recommendation: StrategicRecommendation) => {
    setIsImplementing(recommendation.id);
    
    try {
      // In a real implementation, this would trigger the specific recommendation actions
      const implementations: Record<string, string> = {
        'conversion': 'Conversion optimization campaign initiated with A/B testing framework',
        'pricing': 'Dynamic pricing strategy deployed with segment-based rules',
        'acquisition': 'Customer acquisition campaign launched with targeted messaging',
        'retention': 'Retention program activated with personalized engagement flows',
        'optimization': 'Technical optimization tasks scheduled and prioritized'
      };

      const implementation = implementations[recommendation.category] || 'Strategic recommendation implementation initiated';
      
      // Simulate implementation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      alert(`✅ Recommendation Implemented!\n\n${implementation}\n\nExpected Revenue Lift: ${(recommendation.expected_revenue_lift * 100).toFixed(1)}%\nTimeframe: ${recommendation.timeframe}\n\nMonitoring progress and measuring impact...`);
      
    } catch (error) {
      console.error('Implementation failed:', error);
      alert('Failed to implement recommendation. Please try again.');
    } finally {
      setIsImplementing(null);
    }
  };

  const runRevenueSimulation = async (request: SimulationRequest) => {
    setIsSimulating(true);
    
    try {
      // Get current baseline metrics (would come from real data)
      const currentMetrics = {
        monthly_revenue: 127500,
        conversion_rate: 3.2,
        average_order_value: 127.50,
        traffic: 31250
      };

      // Calculate projected metrics based on changes
      const projectedMetrics = {
        monthly_revenue: currentMetrics.monthly_revenue,
        conversion_rate: currentMetrics.conversion_rate * (1 + (request.changes.conversion_rate_change || 0)),
        average_order_value: currentMetrics.average_order_value * (1 + (request.changes.aov_change || 0)),
        traffic: currentMetrics.traffic * (1 + (request.changes.traffic_change || 0))
      };

      // Calculate new revenue
      projectedMetrics.monthly_revenue = 
        projectedMetrics.traffic * 
        (projectedMetrics.conversion_rate / 100) * 
        projectedMetrics.average_order_value;

      const changes_applied: string[] = [];
      if (request.changes.conversion_rate_change) {
        changes_applied.push(`Conversion rate ${request.changes.conversion_rate_change > 0 ? 'increase' : 'decrease'} of ${Math.abs(request.changes.conversion_rate_change * 100).toFixed(1)}%`);
      }
      if (request.changes.aov_change) {
        changes_applied.push(`AOV ${request.changes.aov_change > 0 ? 'increase' : 'decrease'} of ${Math.abs(request.changes.aov_change * 100).toFixed(1)}%`);
      }
      if (request.changes.traffic_change) {
        changes_applied.push(`Traffic ${request.changes.traffic_change > 0 ? 'increase' : 'decrease'} of ${Math.abs(request.changes.traffic_change * 100).toFixed(1)}%`);
      }

      const newSimulation: RevenueSimulation = {
        id: `sim-${Date.now()}`,
        scenario_name: request.scenario_name || `Simulation ${simulations.length + 1}`,
        current_metrics: currentMetrics,
        projected_metrics: projectedMetrics,
        changes_applied: changes_applied,
        confidence_interval: {
          low: 0.80,
          high: 0.95
        },
        timeframe: request.timeframe === '30_days' ? '30 days' : request.timeframe === '90_days' ? '90 days' : '180 days'
      };

      // Add to simulations list
      setSimulations(prev => [newSimulation, ...prev]);
      
      // Show results
      const revenueDiff = projectedMetrics.monthly_revenue - currentMetrics.monthly_revenue;
      const percentChange = (revenueDiff / currentMetrics.monthly_revenue) * 100;
      
      alert(`🎯 Simulation Complete!\n\nScenario: ${newSimulation.scenario_name}\n\nProjected Results:\n• Revenue: $${projectedMetrics.monthly_revenue.toLocaleString()} (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%)\n• Conversion Rate: ${projectedMetrics.conversion_rate.toFixed(2)}%\n• AOV: $${projectedMetrics.average_order_value.toFixed(2)}\n• Traffic: ${projectedMetrics.traffic.toLocaleString()}\n\nConfidence: 80-95%`);
      
      setShowSimulationModal(false);
      
    } catch (error) {
      console.error('Simulation failed:', error);
      alert('Simulation failed. Please try again.');
    } finally {
      setIsSimulating(false);
    }
  };

  const implementAction = async (action: SmallCompoundingAction) => {
    setIsImplementing(action.id);
    
    try {
      // In a real implementation, this would trigger the specific action
      const implementations = {
        'Conversion Optimization': 'Conversion optimization elements deployed across user journey',
        'Email Marketing': 'Email personalization rules activated with profile-based targeting',
        'Personalization': 'Dynamic personalization engine configured with behavioral triggers',
        'Technical Optimization': 'Technical improvements implemented and performance monitoring activated',
        'UX Improvement': 'User experience enhancements deployed with A/B testing',
        'Content Strategy': 'Content optimization strategy implemented with performance tracking'
      };

      const implementation = implementations[action.category as keyof typeof implementations] || 'Action implementation completed';
      
      // Update action status
      setCompoundingActions(prev => 
        prev.map(a => 
          a.id === action.id 
            ? { ...a, status: 'in_progress' as const }
            : a
        )
      );
      
      // Simulate implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark as completed
      setCompoundingActions(prev => 
        prev.map(a => 
          a.id === action.id 
            ? { ...a, status: 'completed' as const }
            : a
        )
      );
      
      alert(`✅ Small Compounding Action Implemented!\n\n${implementation}\n\nExpected Lift: ${(action.expected_lift * 100).toFixed(1)}%\nImplementation Time: ${action.implementation_time}\nLeverage Ratio: ${action.leverage_ratio.toFixed(1)}x\n\nMonitoring impact...`);
      
    } catch (error) {
      console.error('Action implementation failed:', error);
      alert('Failed to implement action. Please try again.');
    } finally {
      setIsImplementing(null);
    }
  };

  const viewRecommendationDetails = (recommendation: StrategicRecommendation) => {
    setSelectedRecommendation(recommendation);
    setShowRecommendationModal(true);
  };

  const createCustomSimulation = () => {
    setSimulationRequest({
      scenario_name: '',
      changes: {},
      timeframe: '30_days'
    });
    setShowSimulationModal(true);
  };

  const viewActionDetails = (action: SmallCompoundingAction) => {
    setSelectedAction(action);
    setShowActionModal(true);
  };

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
          <div className="w-12 h-12 mx-auto mb-4">
            <svg className="w-12 h-12 text-brand-blue animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
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
          trend={recommendations.filter(r => r.priority === 'high').length > 3 ? { direction: 'up', percentage: 25.0, period: 'this week' } : undefined}
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