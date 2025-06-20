import React, { useState, useEffect } from 'react';
import { Plus, Settings, Code, AlertCircle, CheckCircle, XCircle, Clock, Zap, Database, BarChart3, Users, Target, TrendingUp, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';
import IntelligenceModule from '../components/IntelligenceModule';
import FacebookCredentialsForm from '../components/FacebookCredentialsForm';
import GoogleCredentialsForm from '../components/GoogleCredentialsForm';
import GoHighLevelCredentialsForm from '../components/GoHighLevelCredentialsForm';
import TrackingScriptManager from '../components/TrackingScriptManager';
import { PlusIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon, TrashIcon, Cog6ToothIcon, ChartBarIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

interface SyncProgress {
  integration_id: string;
  provider: string;
  overall_status: string;
  overall_progress: number;
  current_stage: string | null;
  progress_message: string;
  phases: Array<{
    type: string;
    description: string;
    status: string;
    progress_percentage: number;
    total_items?: number;
    processed_items?: number;
    started_at?: string;
    completed_at?: string;
    error_message?: string;
  }>;
  last_updated: string;
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
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'integrations' | 'tracking-script'>('integrations');
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [connectionSummary, setConnectionSummary] = useState<any>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<Record<string, any>>({});
  const [dataPointsStats, setDataPointsStats] = useState<any>(null);

  const loadDataPointsStats = async () => {
    try {
      const stats = await apiClient.getDataPointsStats();
      setDataPointsStats(stats);
    } catch (error) {
      console.error('Error loading data points stats:', error);
    }
  };

  // Simple data fetching without complex caching
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Starting integrations data fetch...');
      console.log('👤 Current user:', user?.id || 'No user');

      // Fetch integrations data
      const [integrationsResponse, providersResponse] = await Promise.all([
        apiClient.getIntegrations().catch(error => {
          console.error('❌ Error fetching integrations:', error);
          return { integrations: [] };
        }),
        apiClient.getIntegrationProviders().catch(error => {
          console.error('❌ Error fetching providers:', error);
          return { providers: {} };
        })
      ]);

      console.log('📊 Raw integrations response:', integrationsResponse);
      console.log('🔌 Raw providers response:', providersResponse);

      if (integrationsResponse && (integrationsResponse as any).integrations) {
        setIntegrations((integrationsResponse as any).integrations);
        console.log('✅ Set integrations:', (integrationsResponse as any).integrations.length);
      } else {
        console.log('⚠️ No integrations found in response');
        setIntegrations([]);
      }

      if (providersResponse && (providersResponse as any).providers) {
        const transformedProviders = Object.entries((providersResponse as any).providers).map(([category, providers]: [string, any]) => 
          (providers as any[]).map(provider => ({ ...provider, category }))
        ).flat();
        
        setAvailableProviders(transformedProviders);
        setProviders(transformedProviders);
        console.log('✅ Set providers:', transformedProviders.length, 'providers');
      } else {
        console.log('⚠️ No providers found in response');
        setAvailableProviders([]);
        setProviders([]);
        if (!error) {
          setError('No integration providers available from backend');
        }
      }

      // Load data points stats
      await loadDataPointsStats();

    } catch (error: any) {
      console.error('❌ Error fetching integrations data:', error);
      console.error('❌ Error stack:', error.stack);
      setError(error.message || 'Failed to load integrations data');
      
      // Don't set fallback providers - show real error state
      setAvailableProviders([]);
      setProviders([]);
    } finally {
      setLoading(false);
      console.log('✅ Finished integrations data fetch');
    }
  };

  // Simple sync progress fetching
  const fetchSyncProgress = async () => {
    if (!user) return;
    
    try {
      console.log('🔄 Fetching sync progress...');
      
      const response = await apiClient.getSyncProgress() as any;
      console.log('📊 Sync progress response:', response);
      
      if (response && response.sync_progress && typeof response.sync_progress === 'object') {
        setSyncProgress(response.sync_progress || {});
        console.log('✅ Sync progress updated:', Object.keys(response.sync_progress).length, 'integrations');
      } else {
        console.warn('⚠️ No sync progress data in response:', response);
        setSyncProgress({});
      }
    } catch (error: any) {
      console.error('❌ Error fetching sync progress:', error);
      setSyncProgress({});
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading]);

  // Periodic sync progress updates (simple)
  useEffect(() => {
    if (integrations.length > 0) {
      // Fetch sync progress once after integrations load
      fetchSyncProgress();
      
      // Set up periodic updates every 30 seconds
      const interval = setInterval(fetchSyncProgress, 30000);
      
      return () => clearInterval(interval);
    }
  }, [integrations.length]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isConnectModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isConnectModalOpen]);

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
  
  // Use API data for total data points calculation
  const totalDataPoints = dataPointsStats?.total_data_points || integrations.reduce((sum, integration) => {
    const progress = syncProgress[integration.id];
    if (progress && progress.phases && Array.isArray(progress.phases)) {
      return sum + progress.phases.reduce((phaseSum, phase) => phaseSum + (phase.processed_items || 0), 0);
    }
    return sum + (integration.data_points_synced || 0);
  }, 0);

  // Simple calculation for last sync date
  const getLastSyncDate = () => {
    const integrationsWithSync = connectedIntegrations.filter(i => i.last_sync);
    if (integrationsWithSync.length === 0) return null;
    
    const timestamps = integrationsWithSync.map(i => new Date(i.last_sync!).getTime()).filter(t => !isNaN(t));
    if (timestamps.length === 0) return null;
    
    return new Date(Math.max(...timestamps));
  };

  const lastSyncDate = getLastSyncDate();

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
    if (provider.id === 'hubspot') {
      alert('HubSpot integration is coming soon! We\'re working on adding this powerful CRM integration.');
      return;
    }
    
    setSelectedProvider(provider);
    setIsConnectModalOpen(true);
  };

  const handleSync = async (integrationId: string) => {
    console.log('Sync is automated - no manual sync needed');
  };

  const handleDisconnect = async (integrationId: string) => {
    if (window.confirm('Are you sure you want to disconnect this integration? This will stop data synchronization.')) {
      try {
        await apiClient.deleteIntegration(integrationId);
        // Remove from local state after successful API call
        setIntegrations(prev => prev.filter(integration => integration.id !== integrationId));
        // Refresh data points stats after disconnection
        await loadDataPointsStats();
      } catch (error) {
        console.error('Error disconnecting integration:', error);
        setError('Failed to disconnect integration. Please try again.');
      }
    }
  };

  const handleCredentialsSuccess = (summary: any) => {
    setIsConnectModalOpen(false);
    setSelectedProvider(null);
    setConnectionSummary(summary);
    
    // Refresh data after successful connection
    fetchData();
    loadDataPointsStats();
  };

  const handleFacebookError = (error: string) => {
    console.error('Facebook integration error:', error);
  };

  const handleGoogleError = (error: string) => {
    console.error('Google integration error:', error);
  };

  const handleGoHighLevelError = (error: string) => {
    console.error('GoHighLevel integration error:', error);
  };

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login message if user is not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please log in to view integrations. No user session found.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
  return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <svg className="w-12 h-12 text-brand-blue animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
      </div>
          <p className="mt-4 text-gray-600">Loading platform connections...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error && availableProviders.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Integrations</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <p className="text-sm text-gray-500 mt-4">
            If this issue persists, please contact support or check your internet connection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('integrations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'integrations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Platform Integrations
            </button>
            <button
              onClick={() => setActiveTab('tracking-script')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tracking-script'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Code className="w-4 h-4 inline mr-2" />
              Tracking Script
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'integrations' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Integrations</h1>
              <p className="text-gray-600 mt-1">Connect your marketing platforms to Revenue Magick</p>
            </div>
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Integration
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800">{error}</span>
              </div>
            </div>
          )}

          {/* Overview Stats */}
          <div className="dashboard-grid mb-8">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4m0 10c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              }
            />
            
            <IntelligenceModule
              title="Last Sync Status"
              value={connectedIntegrations.length > 0 ? 
                (connectedIntegrations.some(i => i.last_sync) ? 'Recent' : 'Pending') : 
                'No Data'
              }
              description={connectedIntegrations.length > 0 && connectedIntegrations.some(i => i.last_sync) ? 
                `Last: ${lastSyncDate ? lastSyncDate.toLocaleDateString() : 'No data'}` :
                'No recent sync activity'
              }
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
          <div className="intelligence-card mb-8">
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
            <div className="intelligence-card mb-8">
              <div className="intelligence-card-header">
                <h3 className="intelligence-title">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Connected Platforms
                </h3>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredIntegrations.map((integration) => {
                  const progress = syncProgress[integration.id];
                  
                  return (
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

                    {/* Sync Progress Section */}
                    {progress && (progress.overall_status === 'running' || progress.overall_status === 'partial') && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">Sync Progress</span>
                          <span className="text-sm text-blue-700">{progress.overall_progress}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progress.overall_progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-blue-700">{progress.progress_message}</p>
                        {progress.current_stage && (
                          <p className="text-xs text-blue-600 mt-1">Current: {progress.current_stage}</p>
                        )}
                      </div>
                    )}

                    {/* Completed Sync Status */}
                    {progress && progress.overall_status === 'completed' && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-900">Sync Complete</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">{progress.progress_message}</p>
                      </div>
                    )}

                    {/* Failed Sync Status */}
                    {progress && progress.overall_status === 'failed' && (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-900">Sync Failed</span>
                        </div>
                        <p className="text-xs text-red-700 mt-1">{progress.progress_message}</p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Data Points:</span>
                        <span className="font-medium">
                          {(() => {
                            // Use API data if available for this specific integration
                            const apiDataForIntegration = dataPointsStats?.breakdown_by_integration?.[integration.id]?.total;
                            if (apiDataForIntegration !== undefined) {
                              return apiDataForIntegration.toLocaleString();
                            }
                            // Fallback to sync progress or integration data
                            if (progress && progress.phases && Array.isArray(progress.phases)) {
                              return progress.phases.reduce((total, phase) => total + (phase.processed_items || 0), 0).toLocaleString();
                            }
                            return integration.data_points_synced?.toLocaleString() || 'Unknown';
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Connection Status:</span>
                        <span className="font-medium capitalize">{integration.status}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Sync Frequency:</span>
                        <span className="font-medium">Manual</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      {/* Show last sync info instead of misleading auto-sync message */}
                      <div className="flex-1 flex items-center justify-center py-2 px-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            Last sync: {integration.last_sync 
                              ? new Date(integration.last_sync).toLocaleString()
                              : 'Never'
                            }
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="btn-secondary text-red-600 hover:bg-red-50 text-sm"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Available Platforms */}
          <div className="intelligence-card mb-8">
            <div className="intelligence-card-header">
              <h3 className="intelligence-title">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Available Platforms
              </h3>
            </div>

            {filteredProviders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Platforms Available</h3>
                <p className="text-gray-600 mb-4">
                  {selectedCategory === 'all' 
                    ? 'No integration platforms are currently available from the backend.'
                    : `No platforms available in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
                  }
                </p>
                <button
                  onClick={fetchData}
                  className="bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry Loading
                </button>
              </div>
            ) : (
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
                            {Array.isArray(provider.capabilities) && provider.capabilities.slice(0, 3).map((capability, index) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                {capability}
                              </span>
                            ))}
                            {Array.isArray(provider.capabilities) && provider.capabilities.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-xs rounded">
                                +{provider.capabilities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Data Types</h5>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(provider.data_types) && provider.data_types.slice(0, 3).map((dataType, index) => (
                              <span key={index} className="px-2 py-1 bg-brand-ice text-xs rounded">
                                {dataType}
                              </span>
                            ))}
                            {Array.isArray(provider.data_types) && provider.data_types.length > 3 && (
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
                            : provider.id === 'facebook_ads'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'border-gray-200 hover:border-brand-blue hover:bg-brand-ice hover:bg-opacity-10'
                        }`}
                      >
                        {isConnected 
                          ? 'Connected' 
                          : provider.id === 'facebook_ads' 
                            ? 'Add Credentials' 
                            : 'Connect'
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tracking-script' && (
        <div>
          <TrackingScriptManager />
        </div>
      )}

      {/* Connect Platform Modal */}
      {isConnectModalOpen && (
        <div 
          className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          style={{ margin: 0, padding: '1rem' }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
                      {Array.isArray(selectedProvider.capabilities) && selectedProvider.capabilities.map((capability, index) => (
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
                        value={selectedProvider?.name}
                        readOnly
                      />
                    </div>
        
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h5 className="font-medium text-yellow-800">API Credentials Required</h5>
                          <p className="text-sm text-yellow-700 mt-1">
                            You'll need to provide your {selectedProvider.name} API credentials. 
                            We securely store your credentials and only use them to fetch your data.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
          
                  <div>
                    {selectedProvider.id === 'facebook_ads' ? (
                      <FacebookCredentialsForm
                        integrationName={selectedProvider.name}
                        onClose={() => {
                          setIsConnectModalOpen(false);
                          setSelectedProvider(null);
                        }}
                        onSuccess={handleCredentialsSuccess}
                        onError={handleFacebookError}
                      />
                    ) : selectedProvider.id === 'facebook_conversions' ? (
                      <FacebookCredentialsForm
                        integrationName={selectedProvider.name}
                        providerType="facebook_conversions"
                        onClose={() => {
                          setIsConnectModalOpen(false);
                          setSelectedProvider(null);
                        }}
                        onSuccess={handleCredentialsSuccess}
                        onError={handleFacebookError}
                      />
                    ) : selectedProvider.id === 'google_ads' ? (
                      <GoogleCredentialsForm
                        integrationName={selectedProvider.name}
                        onClose={() => {
                          setIsConnectModalOpen(false);
                          setSelectedProvider(null);
                        }}
                        onSuccess={handleCredentialsSuccess}
                        onError={handleGoogleError}
                      />
                    ) : selectedProvider.id === 'gohighlevel' ? (
                      <GoHighLevelCredentialsForm
                        integrationName={selectedProvider.name}
                        onClose={() => {
                          setIsConnectModalOpen(false);
                          setSelectedProvider(null);
                        }}
                        onSuccess={handleCredentialsSuccess}
                        onError={handleGoHighLevelError}
                      />
                    ) : (
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            // Simulate OAuth flow for other providers
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
                    )}
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
                            <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(provider.setup_complexity)}`}>
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

      {/* Connection Summary Modal */}
      {connectionSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {connectionSummary.account_type === 'google_ads' ? 'Google Integration Summary' : 
                   connectionSummary.account_type === 'gohighlevel' ? 'GoHighLevel Integration Summary' : 
                   'Facebook Integration Summary'}
                </h2>
                <button
                  onClick={() => setConnectionSummary(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Status Banner */}
              <div className={`rounded-lg border p-4 mb-6 ${
                connectionSummary.permission_level === 'full' ? 'bg-green-50 border-green-200' :
                connectionSummary.permission_level === 'business' ? 'bg-blue-50 border-blue-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center gap-3">
                  {connectionSummary.permission_level === 'full' ? (
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : connectionSummary.permission_level === 'business' ? (
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">
                      {connectionSummary.permission_level === 'full' ? '✅ Full Access Connected' :
                       connectionSummary.permission_level === 'business' ? '🏢 Business Access Connected' :
                       '⚠️ Limited Access Connected'}
                    </h3>
                    <p className="text-sm opacity-75">
                      {connectionSummary.permission_level === 'full' ? 'All Revenue Magick features are available' :
                       connectionSummary.permission_level === 'business' ? 'Most Revenue Magick features are available' :
                       'Basic conversion tracking is available'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Capabilities */}
                <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                  <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Available Capabilities
                  </h4>
                  <ul className="space-y-2">
                    {(connectionSummary.capabilities || []).map((capability: string, index: number) => (
                      <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        {capability}
                      </li>
                    ))}
                  </ul>
                  
                  {/* Analytics Test Results */}
                  {connectionSummary.analytics_test && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                      <h5 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
                        </svg>
                        Analytics Events Test
                      </h5>
                      {connectionSummary.analytics_test.success ? (
                        <div className="space-y-1 text-sm text-green-800">
                          <div className="flex justify-between">
                            <span>Real-time Events:</span>
                            <span className="font-medium">{connectionSummary.analytics_test.real_time_events}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Historical Events:</span>
                            <span className="font-medium">{connectionSummary.analytics_test.historical_events}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Conversion Events:</span>
                            <span className="font-medium">{connectionSummary.analytics_test.conversion_events}</span>
                          </div>
                          {connectionSummary.analytics_test.errors && connectionSummary.analytics_test.errors.length > 0 && (
                            <div className="mt-2 text-xs text-yellow-700">
                              <span className="font-medium">Note:</span> API accessible but authentication needs valid token for data access
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-red-700">
                          Analytics test failed: {connectionSummary.analytics_test.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Limitations */}
                {(connectionSummary.limitations || []).length > 0 && (
                  <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                    <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Current Limitations
                    </h4>
                    <ul className="space-y-2">
                      {(connectionSummary.limitations || []).map((limitation: string, index: number) => (
                        <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Next Steps */}
              <div className="mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Next Steps
                </h4>
                
                <div className="space-y-4">
                  {/* Immediate Actions */}
                  <div>
                    <h5 className="font-medium text-blue-900 mb-2">✅ Ready to Use</h5>
                    <ul className="space-y-1">
                      {(connectionSummary.next_steps?.immediate || []).map((step: string, index: number) => (
                        <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Recommended Improvements */}
                  {(connectionSummary.next_steps?.recommended || []).length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-900 mb-2">🚀 Recommended Improvements</h5>
                      <ul className="space-y-1">
                        {(connectionSummary.next_steps?.recommended || []).map((step: string, index: number) => (
                          <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Advanced Features */}
                  {(connectionSummary.next_steps?.advanced || []).length > 0 && (
                    <div>
                      <h5 className="font-medium text-blue-900 mb-2">⚡ Advanced Features</h5>
                      <ul className="space-y-1">
                        {(connectionSummary.next_steps?.advanced || []).map((step: string, index: number) => (
                          <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setConnectionSummary(null);
                    fetchData(); // Refresh integrations list
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Continue to Dashboard
                </button>
                
                {connectionSummary.permission_level !== 'full' && (
                  <button
                    onClick={() => {
                      setConnectionSummary(null);
                      // Open appropriate credentials form to update token
                      const providerId = connectionSummary.account_type === 'google_ads' ? 'google_ads' : 'facebook_ads';
                      setSelectedProvider(availableProviders.find(p => p.id === providerId) || null);
                      setIsConnectModalOpen(true);
                    }}
                    className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Update Permissions
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations; 
