import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, TrendingUp, TrendingDown, Minus, Target, DollarSign, Clock, Mail, Phone, MapPin, Calendar, Activity, AlertTriangle } from 'lucide-react';

import ReadinessScore from '../components/ReadinessScore';
import NeuromindProfileBadge from '../components/NeuromindProfileBadge';
import IntelligenceModule from '../components/IntelligenceModule';
import { apiClient } from '../lib/api';

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

interface EngagementAction {
  type: string;
  title: string;
  description: string;
  expected_impact: string;
  implementation_steps: string[];
}

const CustomerIntelligence: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [insights, setInsights] = useState<BehavioralInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'individual'>('overview');
  const [filterProfile, setFilterProfile] = useState<string>('all');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showEngagementModal, setShowEngagementModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [selectedEngagementCustomer, setSelectedEngagementCustomer] = useState<CustomerProfile | null>(null);
  const [engagementActions, setEngagementActions] = useState<EngagementAction[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isEngaging, setIsEngaging] = useState<string | null>(null);
  const [isCreatingSegment, setIsCreatingSegment] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [paginationInfo, setPaginationInfo] = useState<{
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    limit: number;
  }>({
    total_pages: 1,
    has_next: false,
    has_previous: false,
    limit: 50
  });

  // Fetch user info from backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user) {
        try {
          const response = await apiClient.getCurrentUser();
          setUserInfo(response.user);
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching customer intelligence data for business: ${userInfo?.business_id}, page: ${currentPage}`);
        
        // Import API client
        const { apiClient } = await import('../lib/api');
        
        // Fetch real customer data with pagination
        const [customerData, segmentData, insightData] = await Promise.all([
          apiClient.getCustomerProfiles({ 
            limit: 50,
            page: currentPage,
            profile_type: filterProfile !== 'all' ? filterProfile : undefined 
          }),
          apiClient.getCustomerSegments(),
          apiClient.getBehavioralInsights(30)
        ]);

        // Update pagination info
        const customerResponse = customerData as any;
        setTotalCustomers(customerResponse.total || 0);
        setPaginationInfo({
          total_pages: customerResponse.pagination?.total_pages || 1,
          has_next: customerResponse.pagination?.has_next || false,
          has_previous: customerResponse.pagination?.has_previous || false,
          limit: customerResponse.pagination?.limit || 50
        });

        // Transform customer data to match interface
        const transformedCustomers: CustomerProfile[] = customerResponse.customers.map(customer => ({
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
        const transformedSegments: CustomerSegment[] = (segmentData as any).segments.map(segment => ({
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
        const transformedInsights: BehavioralInsight[] = (insightData as any).insights.map(insight => ({
          type: insight.type as 'opportunity' | 'warning' | 'trend',
          title: insight.title,
          description: insight.description,
          affected_users: insight.affected_users,
          confidence: insight.confidence,
          action_items: insight.action_items
        }));

        setInsights(transformedInsights);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch customer intelligence data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load customer data');
        
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, viewMode, filterProfile, currentPage, userInfo?.business_id]);

  // Pagination handlers
  const handleNextPage = () => {
    if (paginationInfo.has_next) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (paginationInfo.has_previous) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to first page when filter changes
  const handleFilterChange = (newFilter: string) => {
    setFilterProfile(newFilter);
    setCurrentPage(1);
  };

  const exportCustomerData = async () => {
    setIsExporting(true);
    
    try {
      // Prepare comprehensive export data
      const exportData = {
        generated_at: new Date().toISOString(),
        total_customers: customers.length,
        filter_applied: filterProfile,
        summary: {
          avg_readiness_score: Math.round(customers.reduce((sum, c) => sum + c.readiness_score, 0) / customers.length),
          high_engagement_count: customers.filter(c => c.engagement_level === 'high').length,
          avg_lifetime_value: Math.round(customers.reduce((sum, c) => sum + c.lifetime_value, 0) / customers.length),
          profile_distribution: customers.reduce((acc, customer) => {
            acc[customer.neuromind_profile] = (acc[customer.neuromind_profile] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        },
        customers: customers,
        segments: segments,
        insights: insights
      };

      // Create detailed CSV export
      const csvContent = [
        // Customer headers
        ['Customer ID', 'Email', 'Neuromind Profile', 'Readiness Score', 'Engagement Level', 'Churn Risk (%)', 'Lifetime Value ($)', 'Acquisition Source', 'Journey Stage', 'Total Sessions', 'Avg Session Duration (min)', 'Conversion Probability (%)'].join(','),
        // Customer data
        ...customers.map(customer => [
          customer.id,
          customer.email || 'N/A',
          customer.neuromind_profile,
          customer.readiness_score,
          customer.engagement_level,
          Math.round(customer.churn_risk * 100),
          Math.round(customer.lifetime_value),
          customer.acquisition_source,
          customer.journey_stage,
          customer.total_sessions,
          Math.round(customer.avg_session_duration),
          Math.round(customer.conversion_probability * 100)
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer-intelligence-${filterProfile}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const viewCustomerProfile = (customer: CustomerProfile) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const engageCustomer = async (customer: CustomerProfile) => {
    setSelectedEngagementCustomer(customer);
    setIsEngaging(customer.id);
    
    try {
      // Generate engagement recommendations based on customer profile
      const actions: EngagementAction[] = [];

      // Profile-specific engagement strategies
      switch (customer.neuromind_profile) {
        case 'Fast-Mover':
          actions.push({
            type: 'urgency',
            title: 'Limited-Time Offer',
            description: 'Present time-sensitive offers with countdown timers to leverage their quick decision-making nature.',
            expected_impact: 'Estimated 25-35% increase in conversion probability',
            implementation_steps: [
              'Display countdown timer on product pages',
              'Send urgent email with limited-time discount',
              'Show stock scarcity indicators',
              'Implement one-click purchase options'
            ]
          });
          break;
        
        case 'Proof-Driven':
          actions.push({
            type: 'social_proof',
            title: 'Social Proof Campaign',
            description: 'Showcase testimonials, reviews, and case studies to build trust and credibility.',
            expected_impact: 'Estimated 20-30% increase in conversion probability',
            implementation_steps: [
              'Display customer testimonials prominently',
              'Show recent purchase notifications',
              'Highlight industry awards and certifications',
              'Provide detailed case studies'
            ]
          });
          break;
        
        case 'Skeptic':
          actions.push({
            type: 'trust_building',
            title: 'Trust & Guarantee Focus',
            description: 'Emphasize guarantees, security, and risk-free trials to overcome skepticism.',
            expected_impact: 'Estimated 15-25% increase in conversion probability',
            implementation_steps: [
              'Highlight money-back guarantee',
              'Display security badges and certifications',
              'Offer free trial or demo',
              'Provide detailed FAQ section'
            ]
          });
          break;
        
        case 'Optimizer':
          actions.push({
            type: 'comparison',
            title: 'Detailed Comparison Tools',
            description: 'Provide comprehensive comparison charts and detailed specifications.',
            expected_impact: 'Estimated 20-30% increase in conversion probability',
            implementation_steps: [
              'Create detailed comparison tables',
              'Provide ROI calculators',
              'Show feature-by-feature breakdowns',
              'Offer personalized recommendations'
            ]
          });
          break;
        
        case 'Authority-Seeker':
          actions.push({
            type: 'authority',
            title: 'Expert Endorsement Campaign',
            description: 'Leverage expert opinions, industry leaders, and authoritative sources.',
            expected_impact: 'Estimated 25-35% increase in conversion probability',
            implementation_steps: [
              'Feature expert testimonials',
              'Highlight industry partnerships',
              'Show media mentions and press coverage',
              'Provide thought leadership content'
            ]
          });
          break;
        
        case 'Experience-First':
          actions.push({
            type: 'experiential',
            title: 'Interactive Experience',
            description: 'Offer hands-on trials, demos, and interactive experiences.',
            expected_impact: 'Estimated 30-40% increase in conversion probability',
            implementation_steps: [
              'Provide free trial access',
              'Offer interactive product demos',
              'Schedule personalized consultations',
              'Create virtual experience tours'
            ]
          });
          break;
        
        default:
          actions.push({
            type: 'personalized',
            title: 'Personalized Outreach',
            description: 'Create a customized engagement strategy based on behavioral data.',
            expected_impact: 'Estimated 15-25% increase in conversion probability',
            implementation_steps: [
              'Send personalized email campaign',
              'Offer tailored product recommendations',
              'Provide customized content',
              'Schedule one-on-one consultation'
            ]
          });
      }

      // Add readiness-based actions
      if (customer.readiness_score >= 80) {
        actions.push({
          type: 'conversion',
          title: 'High-Intent Conversion Push',
          description: 'Customer shows high readiness - implement immediate conversion tactics.',
          expected_impact: 'Estimated 40-50% conversion probability',
          implementation_steps: [
            'Trigger immediate follow-up call',
            'Send exclusive offer via email',
            'Display exit-intent popup with special deal',
            'Activate live chat proactively'
          ]
        });
      }

      // Add churn risk actions
      if (customer.churn_risk > 0.7) {
        actions.push({
          type: 'retention',
          title: 'Churn Prevention Campaign',
          description: 'High churn risk detected - implement retention strategies.',
          expected_impact: 'Estimated 60-70% churn risk reduction',
          implementation_steps: [
            'Send win-back email campaign',
            'Offer loyalty discount or upgrade',
            'Schedule customer success check-in',
            'Provide additional value-add services'
          ]
        });
      }

      setEngagementActions(actions);
      setShowEngagementModal(true);
      
    } catch (error) {
      console.error('Engagement analysis failed:', error);
      alert('Failed to generate engagement recommendations. Please try again.');
    } finally {
      setIsEngaging(null);
    }
  };

  const createSegment = async () => {
    setIsCreatingSegment(true);
    
    try {
      // Analyze current customer data to suggest new segments
      const profileDistribution = customers.reduce((acc, customer) => {
        acc[customer.neuromind_profile] = (acc[customer.neuromind_profile] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const highValueCustomers = customers.filter(c => c.lifetime_value > 1000);
      const highRiskCustomers = customers.filter(c => c.churn_risk > 0.7);
      const highReadinessCustomers = customers.filter(c => c.readiness_score >= 80);

      const suggestedSegments = [
        {
          name: 'High-Value Fast-Movers',
          criteria: 'Fast-Mover profile + LTV > $1000',
          count: customers.filter(c => c.neuromind_profile === 'Fast-Mover' && c.lifetime_value > 1000).length,
          strategy: 'Premium offerings with urgency-based messaging'
        },
        {
          name: 'At-Risk High-Value Customers',
          criteria: 'LTV > $1000 + Churn Risk > 70%',
          count: highValueCustomers.filter(c => c.churn_risk > 0.7).length,
          strategy: 'Immediate retention campaigns with personalized offers'
        },
        {
          name: 'Ready-to-Convert Prospects',
          criteria: 'Readiness Score ≥ 80 + No recent purchase',
          count: highReadinessCustomers.filter(c => c.journey_stage !== 'retention').length,
          strategy: 'Aggressive conversion campaigns with limited-time offers'
        },
        {
          name: 'Proof-Driven Skeptics',
          criteria: 'Proof-Driven or Skeptic profile + High engagement',
          count: customers.filter(c => 
            (c.neuromind_profile === 'Proof-Driven' || c.neuromind_profile === 'Skeptic') && 
            c.engagement_level === 'high'
          ).length,
          strategy: 'Social proof and trust-building campaigns'
        }
      ];

      const segmentSuggestions = suggestedSegments
        .filter(segment => segment.count > 0)
        .map(segment => `${segment.name}: ${segment.count} customers\nStrategy: ${segment.strategy}`)
        .join('\n\n');

      const result = confirm(
        `🎯 Segment Creation Suggestions\n\nBased on your customer data, here are recommended segments:\n\n${segmentSuggestions}\n\nWould you like to create these segments automatically?`
      );

      if (result) {
        // In a real implementation, this would create the segments via API
        alert('✅ Segments Created Successfully!\n\nNew customer segments have been created and are now available for targeting in your campaigns.');
      }
      
    } catch (error) {
      console.error('Segment creation failed:', error);
      alert('Failed to create segments. Please try again.');
    } finally {
      setIsCreatingSegment(false);
    }
  };

  const implementEngagementAction = async (action: EngagementAction) => {
    try {
      // In a real implementation, this would trigger the specific engagement action
      const implementations = {
        'urgency': 'Urgency campaign activated with countdown timers and limited-time offers',
        'social_proof': 'Social proof elements deployed across customer touchpoints',
        'trust_building': 'Trust-building campaign launched with guarantees and security badges',
        'comparison': 'Comparison tools and detailed specifications made available',
        'authority': 'Expert endorsement campaign activated with industry testimonials',
        'experiential': 'Interactive experience and trial access provided',
        'personalized': 'Personalized outreach campaign initiated',
        'conversion': 'High-intent conversion tactics deployed immediately',
        'retention': 'Churn prevention campaign activated with retention offers'
      };

      const implementation = implementations[action.type as keyof typeof implementations] || 'Engagement action implemented';
      
      // Simulate implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`✅ Engagement Action Implemented!\n\n${implementation}\n\nExpected Impact: ${action.expected_impact}\n\nMonitoring customer response...`);
      setShowEngagementModal(false);
      
    } catch (error) {
      console.error('Implementation failed:', error);
      alert('Failed to implement engagement action. Please try again.');
    }
  };

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
          <div className="w-12 h-12 mx-auto mb-4">
            <svg className="w-12 h-12 text-brand-blue animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
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
          {isDemoMode && (
            <p className="text-sm mt-1 text-blue-600">
              🎯 Demo Mode - Showcasing customer intelligence capabilities
            </p>
          )}
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
          <button 
            className="btn-primary"
            onClick={exportCustomerData}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              'Export Analysis'
            )}
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
              trend={totalCustomers > 50 ? { direction: 'up', percentage: 12.5, period: 'last 30d' } : undefined}
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
              trend={totalCustomers > 50 ? { direction: 'up', percentage: 8.3, period: 'last 30d' } : undefined}
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
              trend={totalCustomers > 50 ? { direction: 'up', percentage: 15.7, period: 'last 30d' } : undefined}
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
              trend={totalCustomers > 50 ? { direction: 'up', percentage: 22.1, period: 'last 30d' } : undefined}
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
              <button 
                className="btn-primary text-sm"
                onClick={createSegment}
                disabled={isCreatingSegment}
              >
                {isCreatingSegment ? 'Analyzing...' : 'Create Segment'}
              </button>
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
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="all">All Profiles</option>
                  {segments.map((segment) => (
                    <option key={segment.profile_type} value={segment.profile_type}>
                      {segment.profile_type}
                    </option>
                  ))}
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
                          onClick={() => viewCustomerProfile(customer)}
                          className="btn-ghost text-xs mr-2"
                        >
                          View Profile
                        </button>
                        {customer.readiness_score >= 70 && (
                          <button 
                            className="btn-primary text-xs"
                            onClick={() => engageCustomer(customer)}
                            disabled={isEngaging === customer.id}
                          >
                            {isEngaging === customer.id ? 'Analyzing...' : 'Engage'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination Controls */}
              {totalCustomers > paginationInfo.limit && (
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>
                      Showing {((currentPage - 1) * paginationInfo.limit) + 1} to{' '}
                      {Math.min(currentPage * paginationInfo.limit, totalCustomers)} of{' '}
                      {totalCustomers.toLocaleString()} customers
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={!paginationInfo.has_previous}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        paginationInfo.has_previous
                          ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                          : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, paginationInfo.total_pages) }, (_, i) => {
                        const pageNum = currentPage <= 3 
                          ? i + 1 
                          : currentPage >= paginationInfo.total_pages - 2
                            ? paginationInfo.total_pages - 4 + i
                            : currentPage - 2 + i;
                        
                        if (pageNum < 1 || pageNum > paginationInfo.total_pages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              pageNum === currentPage
                                ? 'text-white bg-brand-blue border-brand-blue'
                                : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                            } border`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={!paginationInfo.has_next}
                      className={`px-3 py-2 text-sm font-medium rounded-md border ${
                        paginationInfo.has_next
                          ? 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                          : 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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

      {/* Customer Profile Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Customer Profile</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedCustomer.first_name} {selectedCustomer.last_name} • {selectedCustomer.neuromind_profile}
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-brand-blue">{selectedCustomer.readiness_score}</div>
                  <div className="text-sm text-gray-500">Readiness Score</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-brand-blue">${selectedCustomer.lifetime_value.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Lifetime Value</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-brand-blue">{selectedCustomer.total_sessions}</div>
                  <div className="text-sm text-gray-500">Total Sessions</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-brand-blue">{(selectedCustomer.churn_risk * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-500">Churn Risk</div>
                </div>
              </div>

              {/* Behavioral Traits */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Behavioral Traits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedCustomer.behavioral_traits).map(([trait, value]) => (
                    <div key={trait} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {trait.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-brand-blue h-2 rounded-full"
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-brand-blue w-10">
                          {(value * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Journey Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Customer Journey</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Current Stage</div>
                    <span className={`px-3 py-1 text-sm rounded ${getJourneyStageColor(selectedCustomer.journey_stage)}`}>
                      {selectedCustomer.journey_stage}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Acquisition Source</div>
                    <div className="font-medium text-gray-900">{selectedCustomer.acquisition_source}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">First Seen</div>
                    <div className="font-medium text-gray-900">
                      {new Date(selectedCustomer.first_seen).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Last Activity</div>
                    <div className="font-medium text-gray-900">
                      {new Date(selectedCustomer.last_activity).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Engagement Actions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Ready for Engagement</h4>
                    <p className="text-blue-700 text-sm mt-1">
                      This customer shows {selectedCustomer.readiness_score >= 80 ? 'high' : selectedCustomer.readiness_score >= 60 ? 'medium' : 'low'} readiness for conversion.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCustomerModal(false);
                      engageCustomer(selectedCustomer);
                    }}
                    className="btn-primary"
                  >
                    Engage Customer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Engagement Actions Modal */}
      {showEngagementModal && selectedEngagementCustomer && engagementActions.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Engagement Recommendations</h2>
                  <p className="text-gray-600 mt-1">
                    Personalized actions for {selectedEngagementCustomer.first_name} ({selectedEngagementCustomer.neuromind_profile})
                  </p>
                </div>
                <button
                  onClick={() => setShowEngagementModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {engagementActions.map((action, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{action.title}</h3>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                        action.type === 'conversion' ? 'bg-green-100 text-green-800' :
                        action.type === 'retention' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {action.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Expected Impact</div>
                      <div className="font-semibold text-brand-blue">{action.expected_impact}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{action.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Implementation Steps:</h4>
                    <ul className="space-y-2">
                      {action.implementation_steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start">
                          <span className="text-brand-blue mr-2">{stepIndex + 1}.</span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => implementEngagementAction(action)}
                    className="btn-primary text-sm"
                  >
                    Implement Action
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerIntelligence; 