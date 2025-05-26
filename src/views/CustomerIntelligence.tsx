import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NeuralGlyph from '../components/NeuralGlyph';
import ReadinessScore from '../components/ReadinessScore';
import NeuromindProfileBadge from '../components/NeuromindProfileBadge';
import IntelligenceModule from '../components/IntelligenceModule';
import { getFallbackData, isProduction } from '../utils/fallbackData';

// Types for Customer Intelligence data
interface CustomerProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  neuromind_profile: string;
  readiness_score: number;
  engagement_level: 'high' | 'medium' | 'low';
  churn_risk: number;
  lifetime_value: number;
  acquisition_source: string;
  first_seen: string;
  last_activity: string;
  total_sessions: number;
  avg_session_duration: number;
  conversion_probability: number;
  behavioral_traits: {
    decision_speed: number;
    price_sensitivity: number;
    social_proof_influence: number;
    authority_seeking: number;
    risk_tolerance: number;
  };
  journey_stage: 'awareness' | 'consideration' | 'decision' | 'retention' | 'advocacy';
}

interface CustomerSegment {
  id: string;
  name: string;
  profile_type: string;
  user_count: number;
  avg_readiness_score: number;
  conversion_rate: number;
  avg_lifetime_value: number;
  characteristics: string[];
  recommended_actions: string[];
}

interface BehavioralInsight {
  type: 'opportunity' | 'warning' | 'trend';
  title: string;
  description: string;
  affected_users: number;
  confidence: number;
  action_items: string[];
}

const CustomerIntelligence: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [insights, setInsights] = useState<BehavioralInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'individual'>('overview');
  const [filterProfile, setFilterProfile] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // If in production/deployed environment, use fallback data immediately
      if (isProduction()) {
        console.log('Production environment detected - using fallback customer data');
        const customerData = getFallbackData('customerProfiles') as any;
        const segmentData = getFallbackData('customerSegments') as any;
        const insightData = getFallbackData('behavioralInsights') as any;
        
        if (customerData && segmentData && insightData) {
          // Transform fallback data and set state
          const transformedCustomers: CustomerProfile[] = customerData.customers.map((customer: any) => ({
            ...customer,
            first_name: customer.email?.split('@')[0] || 'User',
            last_name: '',
            behavioral_traits: {
              decision_speed: customer.neuromind_profile === 'Fast-Mover' ? 0.9 : 
                             customer.neuromind_profile === 'Proof-Driven' ? 0.3 : 0.5,
              price_sensitivity: customer.neuromind_profile === 'Skeptic' ? 0.9 : 
                                customer.neuromind_profile === 'Optimizer' ? 0.7 : 0.4,
              social_proof_influence: customer.neuromind_profile === 'Proof-Driven' ? 0.8 : 0.5,
              authority_seeking: customer.neuromind_profile === 'Authority-Seeker' ? 0.9 : 0.4,
              risk_tolerance: customer.neuromind_profile === 'Fast-Mover' ? 0.8 : 
                             customer.neuromind_profile === 'Skeptic' ? 0.1 : 0.5
            }
          }));
          
          setCustomers(transformedCustomers);
          setSegments(segmentData.segments);
          setInsights(insightData.insights);
          setIsDemoMode(true);
        }
        setIsLoading(false);
        return;
      }
      
      try {
        // Import API client
        const { apiClient } = await import('../lib/api');
        
        // Fetch real customer data
        const [customerData, segmentData, insightData] = await Promise.all([
          apiClient.getCustomerProfiles({ 
            limit: 50,
            profile_type: filterProfile !== 'all' ? filterProfile : undefined 
          }),
          apiClient.getCustomerSegments(),
          apiClient.getBehavioralInsights(30)
        ]);

        // Transform customer data to match interface
        const transformedCustomers: CustomerProfile[] = customerData.customers.map(customer => ({
          id: customer.id,
          email: customer.email,
          first_name: customer.email?.split('@')[0] || 'User',
          last_name: '',
          neuromind_profile: customer.neuromind_profile,
          readiness_score: customer.readiness_score,
          engagement_level: customer.engagement_level as 'high' | 'medium' | 'low',
          churn_risk: customer.churn_risk,
          lifetime_value: customer.lifetime_value,
          acquisition_source: customer.acquisition_source,
          first_seen: customer.first_seen,
          last_activity: customer.last_activity,
          total_sessions: customer.total_sessions,
          avg_session_duration: customer.avg_session_duration,
          conversion_probability: customer.conversion_probability,
          behavioral_traits: {
            decision_speed: customer.neuromind_profile === 'Fast-Mover' ? 0.9 : 
                           customer.neuromind_profile === 'Proof-Driven' ? 0.3 : 0.5,
            price_sensitivity: customer.neuromind_profile === 'Skeptic' ? 0.9 : 
                              customer.neuromind_profile === 'Optimizer' ? 0.7 : 0.4,
            social_proof_influence: customer.neuromind_profile === 'Proof-Driven' ? 0.8 : 0.5,
            authority_seeking: customer.neuromind_profile === 'Authority-Seeker' ? 0.9 : 0.4,
            risk_tolerance: customer.neuromind_profile === 'Fast-Mover' ? 0.8 : 
                           customer.neuromind_profile === 'Skeptic' ? 0.1 : 0.5
          },
          journey_stage: customer.journey_stage as 'awareness' | 'consideration' | 'decision' | 'retention' | 'advocacy'
        }));

        setCustomers(transformedCustomers);

        // If viewing individual customer
        if (id && viewMode === 'individual') {
          const customer = transformedCustomers.find(c => c.id === id);
          setSelectedCustomer(customer || null);
        }

        // Transform segment data
        const transformedSegments: CustomerSegment[] = segmentData.segments.map(segment => ({
          id: segment.id,
          name: segment.name,
          profile_type: segment.profile_type,
          user_count: segment.user_count,
          avg_readiness_score: segment.avg_readiness_score,
          conversion_rate: segment.conversion_rate,
          avg_lifetime_value: segment.avg_lifetime_value,
          characteristics: segment.characteristics,
          recommended_actions: segment.recommended_actions
        }));

        setSegments(transformedSegments);

        // Transform insights data
        const transformedInsights: BehavioralInsight[] = insightData.insights.map(insight => ({
          type: insight.type as 'opportunity' | 'warning' | 'trend',
          title: insight.title,
          description: insight.description,
          affected_users: insight.affected_users,
          confidence: insight.confidence,
          action_items: insight.action_items
        }));

        setInsights(transformedInsights);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch customer intelligence data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customer data');
        
        // Fallback to comprehensive fallback data on error
        const customerData = getFallbackData('customerProfiles') as any;
        const segmentData = getFallbackData('customerSegments') as any;
        const insightData = getFallbackData('behavioralInsights') as any;
        
        if (customerData && segmentData && insightData) {
          const transformedCustomers: CustomerProfile[] = customerData.customers.map((customer: any) => ({
            ...customer,
            first_name: customer.email?.split('@')[0] || 'User',
            last_name: '',
            behavioral_traits: {
              decision_speed: customer.neuromind_profile === 'Fast-Mover' ? 0.9 : 
                             customer.neuromind_profile === 'Proof-Driven' ? 0.3 : 0.5,
              price_sensitivity: customer.neuromind_profile === 'Skeptic' ? 0.9 : 
                                customer.neuromind_profile === 'Optimizer' ? 0.7 : 0.4,
              social_proof_influence: customer.neuromind_profile === 'Proof-Driven' ? 0.8 : 0.5,
              authority_seeking: customer.neuromind_profile === 'Authority-Seeker' ? 0.9 : 0.4,
              risk_tolerance: customer.neuromind_profile === 'Fast-Mover' ? 0.8 : 
                             customer.neuromind_profile === 'Skeptic' ? 0.1 : 0.5
            }
          }));
          
          setCustomers(transformedCustomers);
          setSegments(segmentData.segments);
          setInsights(insightData.insights);
          setIsDemoMode(true);
        }
         
        setIsLoading(false);
      }
     };

     fetchData();
   }, [id, viewMode, filterProfile]);

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChurnRiskColor = (risk: number) => {
    if (risk >= 0.7) return 'text-red-600 bg-red-100';
    if (risk >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getJourneyStageColor = (stage: string) => {
    switch (stage) {
      case 'awareness': return 'bg-blue-100 text-blue-800';
      case 'consideration': return 'bg-yellow-100 text-yellow-800';
      case 'decision': return 'bg-green-100 text-green-800';
      case 'retention': return 'bg-purple-100 text-purple-800';
      case 'advocacy': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-red-50 border-red-200';
      case 'trend': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <NeuralGlyph size={48} animated variant="complex" />
          <p className="mt-4 text-gray-600">Analyzing Customer Intelligence...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  // Calculate overview metrics
  const totalCustomers = customers.length;
  const avgReadinessScore = Math.round(customers.reduce((sum, c) => sum + c.readiness_score, 0) / customers.length);
  const highEngagementCount = customers.filter(c => c.engagement_level === 'high').length;
  const avgLifetimeValue = Math.round(customers.reduce((sum, c) => sum + c.lifetime_value, 0) / customers.length);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-header-title">
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Customer Intelligence
          </h1>
          <p className="page-header-description">
            Neuromind Profiles™, behavioral analysis, and customer journey insights
          </p>
        </div>
        <div className="page-header-actions">
          <div className="toggle-group-mobile">
            <button 
              onClick={() => setViewMode('overview')}
              className={`${
                viewMode === 'overview' 
                  ? 'bg-white text-brand-blue shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setViewMode('individual')}
              className={`${
                viewMode === 'individual' 
                  ? 'bg-white text-brand-blue shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Individual
            </button>
          </div>
          <button className="btn-primary">
            Export Analysis
          </button>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <>
          {/* Overview Metrics */}
          <div className="dashboard-grid">
            <IntelligenceModule
              title="Total Customers"
              value={totalCustomers.toLocaleString()}
              trend={{ direction: 'up', percentage: 12.5, period: 'last 30d' }}
              description="Active customer profiles"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            
            <IntelligenceModule
              title="Avg Readiness Score"
              value={avgReadinessScore}
              trend={{ direction: 'up', percentage: 8.3, period: 'last 30d' }}
              description="Overall conversion readiness"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            
            <IntelligenceModule
              title="High Engagement"
              value={highEngagementCount}
              trend={{ direction: 'up', percentage: 15.7, period: 'last 30d' }}
              description="Highly engaged customers"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            />
            
            <IntelligenceModule
              title="Avg Lifetime Value"
              value={`$${avgLifetimeValue.toLocaleString()}`}
              trend={{ direction: 'up', percentage: 22.1, period: 'last 30d' }}
              description="Customer lifetime value"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
            />
          </div>

          {/* Customer Segments */}
          <div className="intelligence-card">
            <div className="intelligence-card-header">
              <h3 className="intelligence-title">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Neuromind Profile™ Segments
              </h3>
            </div>
            
            <div className="space-y-6">
              {segments.map((segment) => (
                <div key={segment.id} className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-lg">{segment.name}</h4>
                      <NeuromindProfileBadge profileType={segment.profile_type as any} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand-blue">
                        {segment.user_count}
                      </div>
                      <div className="text-xs text-gray-500">customers</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Avg Readiness Score</div>
                      <div className="text-xl font-semibold">{segment.avg_readiness_score}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Conversion Rate</div>
                      <div className="text-xl font-semibold">{(segment.conversion_rate * 100).toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Avg LTV</div>
                      <div className="text-xl font-semibold">${segment.avg_lifetime_value.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">Key Characteristics:</div>
                      <ul className="space-y-1">
                        {segment.characteristics.map((char, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-brand-blue rounded-full"></span>
                            {char}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-600 mb-2">Recommended Actions:</div>
                      <ul className="space-y-1">
                        {segment.recommended_actions.map((action, index) => (
                          <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Behavioral Insights */}
          <div className="intelligence-card">
            <div className="intelligence-card-header">
              <h3 className="intelligence-title">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI-Powered Customer Insights
              </h3>
            </div>
            
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${
                          insight.type === 'opportunity' ? 'bg-green-500' :
                          insight.type === 'warning' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}></div>
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <span className="text-sm text-gray-500">({insight.affected_users} users)</span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{insight.description}</p>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-sm">
                          <span className="text-gray-500">Confidence: </span>
                          <span className="font-medium">{(insight.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-600">Recommended Actions:</div>
                        {insight.action_items.map((action, actionIndex) => (
                          <div key={actionIndex} className="text-xs text-gray-600 flex items-center gap-2">
                            <span>•</span>
                            <span>{action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="btn-secondary text-xs">
                      Take Action
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer List */}
          <div className="intelligence-card">
            <div className="intelligence-card-header">
              <h3 className="intelligence-title">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Customer Profiles
              </h3>
              <div className="flex items-center gap-2">
                <select 
                  value={filterProfile} 
                  onChange={(e) => setFilterProfile(e.target.value)}
                  className="btn-secondary text-sm"
                >
                  <option value="all">All Profiles</option>
                  <option value="Fast-Mover">Fast-Mover</option>
                  <option value="Proof-Driven">Proof-Driven</option>
                  <option value="Skeptic">Skeptic</option>
                  <option value="Optimizer">Optimizer</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profile & Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Engagement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Journey Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value & Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers
                    .filter(customer => filterProfile === 'all' || customer.neuromind_profile === filterProfile)
                    .map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.first_name} {customer.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          <div className="text-xs text-gray-400">{customer.acquisition_source}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <ReadinessScore score={customer.readiness_score} size="sm" showLabel={false} />
                          <div>
                            <NeuromindProfileBadge profileType={customer.neuromind_profile as any} size="sm" />
                            <div className="text-xs text-gray-500 mt-1">
                              {(customer.conversion_probability * 100).toFixed(0)}% likely to convert
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <span className={`px-2 py-1 text-xs rounded ${getEngagementColor(customer.engagement_level)}`}>
                            {customer.engagement_level}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">
                            {customer.total_sessions} sessions
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${getJourneyStageColor(customer.journey_stage)}`}>
                          {customer.journey_stage}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium">${customer.lifetime_value.toLocaleString()}</div>
                          <span className={`px-2 py-1 text-xs rounded ${getChurnRiskColor(customer.churn_risk)}`}>
                            {(customer.churn_risk * 100).toFixed(0)}% churn risk
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setViewMode('individual');
                          }}
                          className="btn-ghost text-xs mr-2"
                        >
                          View Profile
                        </button>
                        {customer.readiness_score >= 70 && (
                          <button className="btn-primary text-xs">
                            Engage
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Individual Customer View */
        selectedCustomer && (
          <div className="space-y-8">
            {/* Customer Header */}
            <div className="intelligence-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-indigo rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {selectedCustomer.first_name?.charAt(0)}{selectedCustomer.last_name?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCustomer.first_name} {selectedCustomer.last_name}
                    </h2>
                    <p className="text-gray-600">{selectedCustomer.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <NeuromindProfileBadge profileType={selectedCustomer.neuromind_profile as any} />
                      <span className={`px-2 py-1 text-xs rounded ${getJourneyStageColor(selectedCustomer.journey_stage)}`}>
                        {selectedCustomer.journey_stage}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <ReadinessScore score={selectedCustomer.readiness_score} size="lg" />
                </div>
              </div>
            </div>

            {/* Customer Metrics */}
            <div className="dashboard-grid">
              <IntelligenceModule
                title="Lifetime Value"
                value={`$${selectedCustomer.lifetime_value.toLocaleString()}`}
                description="Total customer value"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
              />
              
              <IntelligenceModule
                title="Conversion Probability"
                value={`${(selectedCustomer.conversion_probability * 100).toFixed(0)}%`}
                description="AI-predicted likelihood"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              
              <IntelligenceModule
                title="Total Sessions"
                value={selectedCustomer.total_sessions}
                description={`Avg ${selectedCustomer.avg_session_duration}m duration`}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                }
              />
              
              <IntelligenceModule
                title="Churn Risk"
                value={`${(selectedCustomer.churn_risk * 100).toFixed(0)}%`}
                description="Risk of customer leaving"
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                }
              />
            </div>

            {/* Behavioral Traits */}
            <div className="intelligence-card">
              <div className="intelligence-card-header">
                <h3 className="intelligence-title">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Behavioral Trait Analysis
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(selectedCustomer.behavioral_traits).map(([trait, value]) => (
                  <div key={trait} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {trait.replace('_', ' ')}
                      </h4>
                      <span className="text-sm font-bold text-brand-blue">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-brand-blue h-2 rounded-full transition-all duration-500"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default CustomerIntelligence; 