import React, { useState, useEffect } from 'react';
import NeuralGlyph from '../components/NeuralGlyph';
import IntelligenceModule from '../components/IntelligenceModule';
import { getFallbackData, isProduction } from '../utils/fallbackData';

// Types for Ad Intelligence data
interface AdCampaign {
  id: string;
  name: string;
  platform: 'facebook' | 'google' | 'linkedin' | 'tiktok';
  status: 'active' | 'paused' | 'completed';
  budget: number;
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
}

interface CreativePerformance {
  id: string;
  campaign_id: string;
  creative_type: 'image' | 'video' | 'carousel' | 'text';
  headline: string;
  description: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  fatigue_score: number;
  engagement_score: number;
  psychological_triggers: string[];
}

interface ChannelInsight {
  platform: string;
  total_spend: number;
  total_conversions: number;
  avg_roas: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
  opportunity_score: number;
}

const AdIntelligence: React.FC = () => {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [creatives, setCreatives] = useState<CreativePerformance[]>([]);
  const [channelInsights, setChannelInsights] = useState<ChannelInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // If in production/deployed environment, use fallback data immediately
      if (isProduction()) {
        console.log('Production environment detected - using fallback ad intelligence data');
        const adData = getFallbackData('adCampaigns') as any;
        
        if (adData) {
          setCampaigns(adData.campaigns);
          setCreatives(adData.creatives);
          setChannelInsights(adData.channelInsights);
        }
        setIsLoading(false);
        return;
      }
      
      try {
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setCampaigns([
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
        ]);

        setCreatives([
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
        ]);

        setChannelInsights([
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
        ]);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch ad intelligence data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Ad Intelligence data');
        
        // Fallback to comprehensive fallback data on error
        const adData = getFallbackData('adCampaigns') as any;
        
        if (adData) {
          setCampaigns(adData.campaigns);
          setCreatives(adData.creatives);
          setChannelInsights(adData.channelInsights);
        }
        
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange, selectedPlatform]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <div className="w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">f</div>;
      case 'google':
        return <div className="w-6 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold">G</div>;
      case 'linkedin':
        return <div className="w-6 h-6 bg-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">in</div>;
      case 'tiktok':
        return <div className="w-6 h-6 bg-black rounded text-white text-xs flex items-center justify-center font-bold">T</div>;
      default:
        return <div className="w-6 h-6 bg-gray-500 rounded text-white text-xs flex items-center justify-center font-bold">?</div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFatigueColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600 bg-red-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>;
      case 'down':
        return <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>;
      default:
        return <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>;
    }
  };

  // Calculate totals
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgROAS = totalSpend > 0 ? campaigns.reduce((sum, c) => sum + (c.roas * c.spend), 0) / totalSpend : 0;
  const avgCTR = campaigns.reduce((sum, c) => sum + c.ctr, 0) / campaigns.length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <NeuralGlyph size={48} animated variant="complex" />
          <p className="mt-4 text-gray-600">Analyzing Ad Intelligence...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Ad Intelligence
          </h1>
          <p className="page-header-description">
            Channel ROI analysis, creative fatigue detection, and message decay insights
          </p>
        </div>
        <div className="page-header-actions">
          <select 
            value={selectedPlatform} 
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="btn-secondary select-mobile"
          >
            <option value="all">All Platforms</option>
            <option value="facebook">Facebook</option>
            <option value="google">Google</option>
            <option value="linkedin">LinkedIn</option>
            <option value="tiktok">TikTok</option>
          </select>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="btn-secondary select-mobile"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button className="btn-primary">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-grid">
        <IntelligenceModule
          title="Total Ad Spend"
          value={`$${(totalSpend / 1000).toFixed(1)}k`}
          trend={{ direction: 'up', percentage: 12.3, period: 'last 30d' }}
          description="Across all active campaigns"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Total Conversions"
          value={totalConversions}
          trend={{ direction: 'up', percentage: 18.7, period: 'last 30d' }}
          description="Across all platforms"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Average ROAS"
          value={`${avgROAS.toFixed(1)}x`}
          trend={{ direction: 'up', percentage: 8.4, period: 'last 30d' }}
          description="Return on ad spend"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Average CTR"
          value={`${avgCTR.toFixed(2)}%`}
          trend={{ direction: 'down', percentage: 3.2, period: 'last 30d' }}
          description="Click-through rate"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          }
        />
      </div>

      {/* Channel Performance Insights */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Channel Performance Insights
          </h3>
        </div>
        
        <div className="space-y-4">
          {channelInsights.map((insight, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getPlatformIcon(insight.platform.toLowerCase())}
                  <h4 className="font-semibold text-lg">{insight.platform}</h4>
                  {getTrendIcon(insight.trend)}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-blue">
                    {insight.avg_roas.toFixed(1)}x
                  </div>
                  <div className="text-xs text-gray-500">ROAS</div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-500">Spend</div>
                  <div className="font-semibold">${insight.total_spend.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Conversions</div>
                  <div className="font-semibold">{insight.total_conversions}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Opportunity Score</div>
                  <div className="font-semibold">{(insight.opportunity_score * 100).toFixed(0)}%</div>
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-sm font-medium text-blue-900 mb-1">AI Recommendation:</div>
                <p className="text-blue-800 text-sm">{insight.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Campaign Performance Analysis
          </h3>
          <span className="text-sm text-gray-500">{campaigns.length} active campaigns</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spend / Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creative Health
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(campaign.platform)}
                      <span className="text-sm capitalize">{campaign.platform}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium">${campaign.spend.toLocaleString()}</div>
                      <div className="text-gray-500">of ${campaign.budget.toLocaleString()}</div>
                      <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-brand-blue h-1 rounded-full"
                          style={{ width: `${Math.min(100, (campaign.spend / campaign.budget) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium">ROAS: {campaign.roas.toFixed(1)}x</div>
                      <div className="text-gray-500">CTR: {campaign.ctr.toFixed(2)}%</div>
                      <div className="text-gray-500">{campaign.conversions} conversions</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Fatigue:</span>
                        <span className={`px-2 py-1 text-xs rounded ${getFatigueColor(campaign.creative_fatigue_score)}`}>
                          {(campaign.creative_fatigue_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs">Decay:</span>
                        <span className={`px-2 py-1 text-xs rounded ${getFatigueColor(campaign.message_decay_rate)}`}>
                          {(campaign.message_decay_rate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="btn-ghost text-xs mr-2">
                      View Details
                    </button>
                    {campaign.creative_fatigue_score > 0.5 && (
                      <button className="btn-primary text-xs">
                        Refresh Creative
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creative Performance Analysis */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2a1 1 0 01-1-1V4M7 4V1a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1h2a1 1 0 001-1V4m0 0v15a1 1 0 001 1h8a1 1 0 001-1V4M7 4h10" />
            </svg>
            Creative Performance & Psychology Analysis
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {creatives.map((creative) => (
            <div key={creative.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 text-xs rounded ${
                  creative.creative_type === 'video' ? 'bg-purple-100 text-purple-800' :
                  creative.creative_type === 'image' ? 'bg-blue-100 text-blue-800' :
                  creative.creative_type === 'carousel' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {creative.creative_type}
                </span>
                <div className="text-right">
                  <div className="text-lg font-bold text-brand-blue">
                    {creative.ctr.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">CTR</div>
                </div>
              </div>
              
              <h4 className="font-semibold text-sm mb-2">{creative.headline}</h4>
              <p className="text-xs text-gray-600 mb-3">{creative.description}</p>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span>Impressions:</span>
                  <span className="font-medium">{creative.impressions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Conversions:</span>
                  <span className="font-medium">{creative.conversions}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Engagement:</span>
                  <span className="font-medium">{(creative.engagement_score * 100).toFixed(0)}%</span>
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-xs font-medium text-gray-600 mb-1">Psychological Triggers:</div>
                <div className="flex flex-wrap gap-1">
                  {creative.psychological_triggers.map((trigger, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-brand-ice text-brand-blue rounded">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs rounded ${getFatigueColor(creative.fatigue_score)}`}>
                  Fatigue: {(creative.fatigue_score * 100).toFixed(0)}%
                </span>
                <button className="btn-ghost text-xs">
                  Analyze
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdIntelligence; 