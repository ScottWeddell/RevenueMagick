import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Database, TrendingUp, Users, DollarSign, Eye, MousePointer, BarChart3, RefreshCw, Download, Calendar } from 'lucide-react';

interface GoogleConnectionTestProps {
  onDataRefresh?: () => void;
}

interface ConnectionData {
  success: boolean;
  connection_status: string;
  user_info: {
    id: string;
    name: string;
    email?: string;
  };
  ad_accounts: Array<{
    id: string;
    name: string;
    currency: string;
    timezone: string;
    status: string;
  }>;
  analytics_properties: Array<{
    id: string;
    name: string;
    measurement_id?: string;
    dimensions: number;
    metrics: number;
  }>;
  sample_data: {
    campaigns: Array<{
      id: string;
      name: string;
      status: string;
      type: string;
      created_time: string;
    }>;
    insights: Array<{
      impressions: string;
      clicks: string;
      cost: string;
      conversions: string;
      ctr: string;
      cpc: string;
      conversion_rate: string;
    }>;
  };
  last_tested: string;
}

interface SyncProgress {
  integration_id: string;
  status: string;
  last_sync: string | null;
  sync_start: string | null;
  sync_end: string | null;
  sync_type: string | null;
  days_back: number | null;
  results: {
    success: boolean;
    accounts_processed: number;
    campaigns_synced: number;
    ad_groups_synced: number;
    keywords_synced: number;
    analytics_synced: number;
    errors: string[];
  } | null;
  error: string | null;
}

interface SyncedData {
  integration_id: string;
  status: string;
  last_sync: string | null;
  data_summary: {
    campaigns: number;
    ad_groups: number;
    keywords: number;
    analytics_records: number;
  };
  recent_campaigns: Array<{
    id: string;
    name: string;
    status: string;
    type: string;
    total_cost: number;
    total_impressions: number;
    total_clicks: number;
    ctr: number;
    created_time: string | null;
  }>;
  ad_accounts: Array<{
    id: string;
    name: string;
    currency: string;
    status: string;
  }>;
  analytics_properties: Array<{
    id: string;
    name: string;
    measurement_id?: string;
  }>;
}

const GoogleConnectionTest: React.FC<GoogleConnectionTestProps> = ({ onDataRefresh }) => {
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [syncedData, setSyncedData] = useState<SyncedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'connection' | 'sync' | 'data'>('connection');

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/oauth/google/test-connection', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setConnectionData(data);
      onDataRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test connection');
    } finally {
      setLoading(false);
    }
  };

  const startHistoricalSync = async (daysBack: number = 90) => {
    setSyncing(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/oauth/google/start-historical-sync?days_back=${daysBack}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Start polling for progress
        pollSyncProgress();
      } else {
        setError(data.message || 'Failed to start sync');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start historical sync');
      setSyncing(false);
    }
  };

  const pollSyncProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/oauth/google/sync-progress', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const progress = await response.json();
        setSyncProgress(progress);
        
        if (progress.status === 'syncing') {
          // Continue polling
          setTimeout(pollSyncProgress, 3000);
        } else {
          setSyncing(false);
          // Refresh synced data
          fetchSyncedData();
        }
      }
    } catch (err) {
      console.error('Error polling sync progress:', err);
    }
  };

  const fetchSyncedData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/oauth/google/synced-data', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSyncedData(data);
      }
    } catch (err) {
      console.error('Error fetching synced data:', err);
    }
  };

  useEffect(() => {
    // Check sync status on component mount
    const checkSyncStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/oauth/google/sync-progress', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const progress = await response.json();
          setSyncProgress(progress);
          
          if (progress.status === 'syncing') {
            setSyncing(true);
            pollSyncProgress();
          }
        }
      } catch (err) {
        console.error('Error checking sync status:', err);
      }
    };

    checkSyncStatus();
    fetchSyncedData();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('connection')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'connection'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Connection Test
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sync'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Data Sync
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'data'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historical Data Overview
          </button>
        </nav>
      </div>

      {/* Connection Test Tab */}
      {activeTab === 'connection' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Google Connection Test</h3>
              <button
                onClick={testConnection}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 font-medium">Error</span>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}

            {connectionData && (
              <div className="space-y-6">
                {/* Connection Status */}
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Connection Successful</h4>
                    <p className="text-green-700 text-sm">Google APIs are accessible and responding</p>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Connected Account</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <p className="font-medium">{connectionData.user_info.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="font-medium">{connectionData.user_info.email || 'Not available'}</p>
                    </div>
                  </div>
                </div>

                {/* Google Ads Accounts */}
                {connectionData.ad_accounts.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Google Ads Accounts ({connectionData.ad_accounts.length})</h4>
                    <div className="space-y-3">
                      {connectionData.ad_accounts.map((account, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{account.name}</p>
                              <p className="text-sm text-gray-500">ID: {account.id}</p>
                            </div>
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                account.status === 'ENABLED' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {account.status}
                              </span>
                              <p className="text-sm text-gray-500 mt-1">{account.currency}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analytics Properties */}
                {connectionData.analytics_properties.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Google Analytics Properties ({connectionData.analytics_properties.length})</h4>
                    <div className="space-y-3">
                      {connectionData.analytics_properties.map((property, index) => (
                        <div key={index} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{property.name}</p>
                              <p className="text-sm text-gray-500">Property ID: {property.id}</p>
                              {property.measurement_id && (
                                <p className="text-sm text-gray-500">Measurement ID: {property.measurement_id}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">{property.dimensions} dimensions</p>
                              <p className="text-sm text-gray-500">{property.metrics} metrics</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Data */}
                {connectionData.sample_data && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sample Campaigns */}
                    {connectionData.sample_data.campaigns.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Sample Campaigns</h4>
                        <div className="space-y-2">
                          {connectionData.sample_data.campaigns.slice(0, 3).map((campaign, index) => (
                            <div key={index} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-sm">{campaign.name}</p>
                                  <p className="text-xs text-gray-500">{campaign.type}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  campaign.status === 'ENABLED' ? 'bg-green-100 text-green-800' :
                                  campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {campaign.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sample Insights */}
                    {connectionData.sample_data.insights.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Sample Performance Data</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {connectionData.sample_data.insights[0] && (
                            <>
                              <div className="bg-white p-3 rounded border text-center">
                                <Eye className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-lg font-semibold">{formatNumber(parseInt(connectionData.sample_data.insights[0].impressions))}</p>
                                <p className="text-xs text-gray-500">Impressions</p>
                              </div>
                              <div className="bg-white p-3 rounded border text-center">
                                <MousePointer className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                <p className="text-lg font-semibold">{formatNumber(parseInt(connectionData.sample_data.insights[0].clicks))}</p>
                                <p className="text-xs text-gray-500">Clicks</p>
                              </div>
                              <div className="bg-white p-3 rounded border text-center">
                                <DollarSign className="w-5 h-5 text-red-600 mx-auto mb-1" />
                                <p className="text-lg font-semibold">{formatCurrency(parseFloat(connectionData.sample_data.insights[0].cost))}</p>
                                <p className="text-xs text-gray-500">Cost</p>
                              </div>
                              <div className="bg-white p-3 rounded border text-center">
                                <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                <p className="text-lg font-semibold">{formatPercentage(parseFloat(connectionData.sample_data.insights[0].ctr))}</p>
                                <p className="text-xs text-gray-500">CTR</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Sync Tab */}
      {activeTab === 'sync' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Historical Data Sync</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => startHistoricalSync(30)}
                  disabled={syncing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  Sync 30 Days
                </button>
                <button
                  onClick={() => startHistoricalSync(90)}
                  disabled={syncing}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  Sync 90 Days
                </button>
              </div>
            </div>

            {syncProgress && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {syncProgress.status === 'syncing' ? (
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                  ) : syncProgress.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-medium">
                    Status: {syncProgress.status.charAt(0).toUpperCase() + syncProgress.status.slice(1)}
                  </span>
                </div>

                {syncProgress.results && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">Campaigns</p>
                      <p className="text-lg font-semibold">{syncProgress.results.campaigns_synced}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">Ad Groups</p>
                      <p className="text-lg font-semibold">{syncProgress.results.ad_groups_synced}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">Keywords</p>
                      <p className="text-lg font-semibold">{syncProgress.results.keywords_synced}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-500">Analytics</p>
                      <p className="text-lg font-semibold">{syncProgress.results.analytics_synced}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Historical Data Overview Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Synced Data Overview</h3>
            
            {syncedData ? (
              <div className="space-y-6">
                {/* Data Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{syncedData.data_summary.campaigns}</p>
                    <p className="text-sm text-blue-700">Campaigns</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <Users className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-900">{syncedData.data_summary.ad_groups}</p>
                    <p className="text-sm text-green-700">Ad Groups</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <Database className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-900">{syncedData.data_summary.keywords}</p>
                    <p className="text-sm text-purple-700">Keywords</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg text-center">
                    <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-900">{syncedData.data_summary.analytics_records}</p>
                    <p className="text-sm text-orange-700">Analytics Records</p>
                  </div>
                </div>

                {/* Recent Campaigns */}
                {syncedData.recent_campaigns.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Recent Campaigns</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {syncedData.recent_campaigns.slice(0, 5).map((campaign, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{campaign.name}</p>
                                  <p className="text-sm text-gray-500">ID: {campaign.id}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{campaign.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  campaign.status === 'ENABLED' ? 'bg-green-100 text-green-800' :
                                  campaign.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {campaign.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(campaign.total_cost)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatNumber(campaign.total_impressions)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPercentage(campaign.ctr)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No synced data available. Start a historical sync to see data here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleConnectionTest; 
 