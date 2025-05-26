import React, { useState, useEffect } from 'react';
import NeuralGlyph from '../components/NeuralGlyph';
import IntelligenceModule from '../components/IntelligenceModule';
import { getFallbackData, isProduction } from '../utils/fallbackData';

interface Integration {
  id: string;
  user_id: string;
  business_id: string;
  integration_type: string;
  provider: string;
  name: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  settings?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  last_sync?: string;
  sync_frequency?: string;
  data_points_synced?: number;
  health_score?: number;
}

interface Provider {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  capabilities: string[];
  setup_complexity: 'simple' | 'moderate' | 'advanced';
  data_types: string[];
}

const Integrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // If in production/deployed environment, use fallback data immediately
      if (isProduction()) {
        console.log('Production environment detected - using fallback integrations data');
        const integrationsData = getFallbackData('integrations') as any;
        
        if (integrationsData) {
          setIntegrations(integrationsData.integrations);
          setAvailableProviders(integrationsData.availableProviders);
          setError('Demo Mode - Using sample data');
        }
        setIsLoading(false);
        return;
      }
      
      try {
        // Mock data for integrations following Revenue Magick concept
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIntegrations([
          {
            id: '1',
            user_id: 'user1',
            business_id: 'biz1',
            integration_type: 'ad_intelligence',
            provider: 'facebook_ads',
            name: 'Facebook Ads - Main Account',
            status: 'connected',
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
            status: 'connected',
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
            status: 'connected',
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
            status: 'error',
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString(),
            last_sync: new Date(Date.now() - 3600000).toISOString(),
            sync_frequency: 'Every hour',
            data_points_synced: 0,
            health_score: 0
          }
        ]);

        setAvailableProviders([
          {
            id: 'facebook_ads',
            name: 'Facebook Ads',
            description: 'Connect your Facebook advertising campaigns for comprehensive ad intelligence and performance tracking.',
            logo: '/logos/facebook.svg',
            category: 'ad_intelligence',
            capabilities: ['Campaign Performance', 'Audience Insights', 'Creative Analysis', 'Attribution Tracking'],
            setup_complexity: 'simple',
            data_types: ['Impressions', 'Clicks', 'Conversions', 'Spend', 'CTR', 'CPC']
          },
          {
            id: 'google_ads',
            name: 'Google Ads',
            description: 'Integrate Google Ads for search and display campaign optimization with AI-powered insights.',
            logo: '/logos/google-ads.svg',
            category: 'ad_intelligence',
            capabilities: ['Search Campaigns', 'Display Networks', 'Shopping Ads', 'Performance Max'],
            setup_complexity: 'simple',
            data_types: ['Impressions', 'Clicks', 'Conversions', 'Cost', 'Quality Score']
          },
          {
            id: 'hubspot',
            name: 'HubSpot',
            description: 'Sync your HubSpot CRM to unlock customer intelligence and behavioral insights.',
            logo: '/logos/hubspot.svg',
            category: 'customer_intelligence',
            capabilities: ['Contact Management', 'Deal Tracking', 'Email Campaigns', 'Lead Scoring'],
            setup_complexity: 'simple',
            data_types: ['Contacts', 'Deals', 'Companies', 'Email Engagement']
          },
          {
            id: 'salesforce',
            name: 'Salesforce',
            description: 'Connect Salesforce CRM for enterprise-grade customer intelligence and pipeline analysis.',
            logo: '/logos/salesforce.svg',
            category: 'customer_intelligence',
            capabilities: ['Lead Management', 'Opportunity Tracking', 'Account Management', 'Sales Analytics'],
            setup_complexity: 'moderate',
            data_types: ['Leads', 'Opportunities', 'Accounts', 'Activities']
          },
          {
            id: 'google_analytics',
            name: 'Google Analytics 4',
            description: 'Integrate GA4 for comprehensive behavioral intelligence and user journey analysis.',
            logo: '/logos/google-analytics.svg',
            category: 'behavior_intelligence',
            capabilities: ['User Behavior', 'Conversion Tracking', 'Audience Insights', 'Custom Events'],
            setup_complexity: 'simple',
            data_types: ['Sessions', 'Users', 'Events', 'Conversions', 'Revenue']
          },
          {
            id: 'shopify',
            name: 'Shopify',
            description: 'Connect your Shopify store for e-commerce intelligence and customer behavior analysis.',
            logo: '/logos/shopify.svg',
            category: 'customer_intelligence',
            capabilities: ['Order Tracking', 'Customer Profiles', 'Product Analytics', 'Revenue Intelligence'],
            setup_complexity: 'simple',
            data_types: ['Orders', 'Customers', 'Products', 'Revenue', 'Inventory']
          },
          {
            id: 'stripe',
            name: 'Stripe',
            description: 'Integrate Stripe for payment intelligence and customer lifetime value analysis.',
            logo: '/logos/stripe.svg',
            category: 'customer_intelligence',
            capabilities: ['Payment Processing', 'Subscription Analytics', 'Customer LTV', 'Churn Analysis'],
            setup_complexity: 'moderate',
            data_types: ['Payments', 'Subscriptions', 'Customers', 'Revenue', 'Refunds']
          },
          {
            id: 'linkedin_ads',
            name: 'LinkedIn Ads',
            description: 'Connect LinkedIn advertising for B2B ad intelligence and professional audience insights.',
            logo: '/logos/linkedin.svg',
            category: 'ad_intelligence',
            capabilities: ['B2B Campaigns', 'Professional Targeting', 'Lead Generation', 'Brand Awareness'],
            setup_complexity: 'simple',
            data_types: ['Impressions', 'Clicks', 'Leads', 'Spend', 'Demographics']
          }
        ]);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch integrations data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load integration data');
        
        // Fallback to comprehensive fallback data on error
        const integrationsData = getFallbackData('integrations') as any;
        
        if (integrationsData) {
          setIntegrations(integrationsData.integrations);
          setAvailableProviders(integrationsData.availableProviders);
        }
        
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = [
    { id: 'all', name: 'All Integrations', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'ad_intelligence', name: 'Ad Intelligence', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
    { id: 'customer_intelligence', name: 'Customer Intelligence', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'behavior_intelligence', name: 'Behavior Intelligence', icon: 'M13 10V3L4 14h7v7l9-11h-7z' }
  ];

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(integration => integration.integration_type === selectedCategory);

  const filteredProviders = selectedCategory === 'all'
    ? availableProviders
    : availableProviders.filter(provider => provider.category === selectedCategory);

  const connectedIntegrations = integrations.filter(i => i.status === 'connected');
  const totalDataPoints = integrations.reduce((sum, i) => sum + (i.data_points_synced || 0), 0);
  const avgHealthScore = connectedIntegrations.length > 0 
    ? connectedIntegrations.reduce((sum, i) => sum + (i.health_score || 0), 0) / connectedIntegrations.length 
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-100';
      case 'syncing': return 'text-blue-600 bg-blue-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'disconnected': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'syncing':
        return (
          <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
        default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handleConnect = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsConnectModalOpen(true);
  };

  const handleSync = async (integrationId: string) => {
    // Update integration status to syncing
    setIntegrations(prev => prev.map(integration =>
      integration.id === integrationId
        ? { ...integration, status: 'syncing' as const }
        : integration
    ));

    // Simulate sync process
    setTimeout(() => {
      setIntegrations(prev => prev.map(integration =>
        integration.id === integrationId 
          ? { 
              ...integration, 
              status: 'connected' as const,
              last_sync: new Date().toISOString(),
              data_points_synced: (integration.data_points_synced || 0) + Math.floor(Math.random() * 100)
            }
          : integration
      ));
    }, 2000);
  };

  const handleDisconnect = async (integrationId: string) => {
    if (window.confirm('Are you sure you want to disconnect this integration? This will stop data synchronization.')) {
      setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <NeuralGlyph size={48} animated variant="complex" />
          <p className="mt-4 text-gray-600">Loading platform connections...</p>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
            Platform Connections
          </h1>
          <p className="page-header-description">
            Connect your data sources to unlock Revenue Superintelligence
          </p>
        </div>
        <div className="page-header-actions">
        <button 
            onClick={() => setIsConnectModalOpen(true)}
            className="btn-primary flex items-center gap-2"
        >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Connect Platform
        </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="dashboard-grid">
        <IntelligenceModule
          title="Connected Platforms"
          value={connectedIntegrations.length.toString()}
          trend={{ 
            direction: connectedIntegrations.length > 0 ? 'up' : 'neutral', 
            percentage: connectedIntegrations.length, 
            period: 'active' 
          }}
          description="Data sources connected"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Data Points Synced"
          value={totalDataPoints.toLocaleString()}
          description="Total data points collected"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Health Score"
          value={`${avgHealthScore.toFixed(0)}%`}
          trend={{ 
            direction: avgHealthScore > 90 ? 'up' : avgHealthScore > 70 ? 'neutral' : 'down', 
            percentage: avgHealthScore, 
            period: 'average' 
          }}
          description="Integration health average"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Available Platforms"
          value={availableProviders.length.toString()}
          description="Ready to connect"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        </div>

      {/* Category Navigation */}
      <div className="intelligence-card">
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-brand-blue text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={category.icon} />
                </svg>
                {category.name}
              </button>
            ))}
          </div>
        </div>
          </div>

      {/* Connected Integrations */}
      {filteredIntegrations.length > 0 && (
        <div className="intelligence-card">
          <div className="intelligence-card-header">
            <h3 className="intelligence-title">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Connected Platforms
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredIntegrations.map((integration) => (
              <div key={integration.id} className="p-6 border border-gray-200 rounded-xl hover:border-brand-blue transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                          </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{integration.name}</h4>
                      <p className="text-sm text-gray-500 capitalize">{integration.provider.replace('_', ' ')}</p>
                            </div>
                          </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration.status)}
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(integration.status)}`}>
                          {integration.status}
                        </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Data Points:</span>
                    <span className="font-medium">{integration.data_points_synced?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Health Score:</span>
                    <span className="font-medium">{integration.health_score || 0}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sync Frequency:</span>
                    <span className="font-medium">{integration.sync_frequency || 'Manual'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Sync:</span>
                    <span className="font-medium">
                        {integration.last_sync 
                        ? new Date(integration.last_sync).toLocaleTimeString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => handleSync(integration.id)}
                    disabled={integration.status === 'syncing'}
                    className="btn-secondary flex-1 text-sm"
                        >
                    {integration.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
                        </button>
                        <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="btn-secondary text-red-600 hover:bg-red-50 text-sm"
                  >
                    Disconnect
              </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
      {/* Available Platforms */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Available Platforms
          </h3>
                </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => {
            const isConnected = integrations.some(i => i.provider === provider.id);
            
            return (
              <div key={provider.id} className="p-6 border border-gray-200 rounded-xl hover:border-brand-blue transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      </div>
                      <div>
                      <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(provider.setup_complexity)}`}>
                        {provider.setup_complexity} setup
                      </span>
                        </div>
                        </div>
                      </div>
                
                <p className="text-sm text-gray-600 mb-4">{provider.description}</p>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Capabilities</h5>
                    <div className="flex flex-wrap gap-1">
                      {provider.capabilities.slice(0, 3).map((capability, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                          {capability}
                        </span>
                      ))}
                      {provider.capabilities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                          +{provider.capabilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Data Types</h5>
                    <div className="flex flex-wrap gap-1">
                      {provider.data_types.slice(0, 3).map((dataType, index) => (
                        <span key={index} className="px-2 py-1 bg-brand-ice text-xs rounded">
                          {dataType}
                        </span>
                      ))}
                      {provider.data_types.length > 3 && (
                        <span className="px-2 py-1 bg-brand-ice text-xs rounded">
                          +{provider.data_types.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              
                <button
                  onClick={() => handleConnect(provider)}
                  disabled={isConnected}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    isConnected
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-brand-blue hover:bg-brand-ice hover:bg-opacity-10'
                  }`}
                >
                  {isConnected ? 'Connected' : 'Connect'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connect Platform Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative z-60">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedProvider ? `Connect ${selectedProvider.name}` : 'Connect Platform'}
                    </h3>
                    <p className="text-gray-600">
                      {selectedProvider ? selectedProvider.description : 'Choose a platform to connect'}
                    </p>
            </div>
          </div>
                <button
                  onClick={() => {
                    setIsConnectModalOpen(false);
                    setSelectedProvider(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
          </div>
        </div>
        
            <div className="p-6">
              {selectedProvider ? (
                <div className="space-y-6">
                  <div className="bg-brand-ice bg-opacity-20 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">What you'll get:</h4>
                    <ul className="space-y-1">
                      {selectedProvider.capabilities.map((capability, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {capability}
                        </li>
                      ))}
                    </ul>
        </div>
        
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Integration Name
                      </label>
                      <input
                        type="text"
                        placeholder={`${selectedProvider.name} - Main Account`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      />
        </div>
        
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
        <div>
                          <h5 className="font-medium text-yellow-800">OAuth Authentication Required</h5>
                          <p className="text-sm text-yellow-700 mt-1">
                            You'll be redirected to {selectedProvider.name} to authorize Revenue Magick to access your data. 
                            We only request read-only permissions and never store your login credentials.
                          </p>
          </div>
        </div>
      </div>
          </div>
          
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        // Simulate OAuth flow
                        alert(`Redirecting to ${selectedProvider.name} for authentication...`);
                        setIsConnectModalOpen(false);
                        setSelectedProvider(null);
                      }}
                      className="btn-primary flex-1"
                    >
                      Continue to {selectedProvider.name}
                    </button>
                    <button
                      onClick={() => {
                        setIsConnectModalOpen(false);
                        setSelectedProvider(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
          </div>
          </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableProviders.map((provider) => {
                    const isConnected = integrations.some(i => i.provider === provider.id);
                    
                    return (
                      <button
                        key={provider.id}
                        onClick={() => setSelectedProvider(provider)}
                        disabled={isConnected}
                        className={`p-4 border rounded-lg text-left transition-colors ${
                          isConnected
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : 'border-gray-200 hover:border-brand-blue hover:bg-brand-ice hover:bg-opacity-10'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{provider.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded ${getComplexityColor(provider.setup_complexity)}`}>
                              {provider.setup_complexity}
                            </span>
          </div>
        </div>
                        <p className="text-sm text-gray-600">{provider.description}</p>
                        {isConnected && (
                          <p className="text-xs text-green-600 mt-2">✓ Already connected</p>
                        )}
                      </button>
                    );
                  })}
            </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations; 