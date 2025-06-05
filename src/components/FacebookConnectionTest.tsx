import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Database, TrendingUp, Users, DollarSign, Eye, MousePointer, BarChart3, RefreshCw, Download, Calendar } from 'lucide-react';

interface FacebookConnectionTestProps {
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
    account_status: string;
    currency: string;
    timezone_name: string;
    amount_spent?: string;
    balance?: string;
  }>;
  sample_data: {
    campaigns: Array<{
      id: string;
      name: string;
      status: string;
      objective: string;
      created_time: string;
    }>;
    insights: Array<{
      impressions: string;
      clicks: string;
      spend: string;
      reach: string;
      ctr: string;
      cpc: string;
      cpm: string;
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
    ad_sets_synced: number;
    ads_synced: number;
    insights_synced: number;
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
    ad_sets: number;
    ads: number;
    metrics_records: number;
  };
  recent_campaigns: Array<{
    id: string;
    name: string;
    status: string;
    objective: string;
    total_spend: number;
    total_impressions: number;
    total_clicks: number;
    ctr: number;
    created_time: string | null;
  }>;
  ad_accounts: Array<{
    id: string;
    name: string;
    account_status: string;
    currency: string;
  }>;
}

const FacebookConnectionTest: React.FC<FacebookConnectionTestProps> = ({ onDataRefresh }) => {
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
      const response = await fetch('/api/v1/oauth/facebook/test-connection', {
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
      const response = await fetch(`/api/v1/oauth/facebook/start-historical-sync?days_back=${daysBack}`, {
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
      const response = await fetch('/api/v1/oauth/facebook/sync-progress', {
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
      const response = await fetch('/api/v1/oauth/facebook/synced-data', {
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
    // Fetch initial data
    fetchSyncedData();
    
    // Check if there's an ongoing sync
    const checkSyncStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/v1/oauth/facebook/sync-progress', {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('connection')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'connection'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Connection Test
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'sync'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Download className="w-4 h-4 inline mr-2" />
          Data Sync
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'data'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Database className="w-4 h-4 inline mr-2" />
          Synced Data
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Connection Test Tab */}
      {activeTab === 'connection' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Connection Test</h3>
            <button
              onClick={testConnection}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </button>
          </div>

          {connectionData && (
            <div className="space-y-4">
              {/* Connection Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">Connection Active</span>
                  <span className="ml-auto text-sm text-green-600">
                    Last tested: {formatDate(connectionData.last_tested)}
                  </span>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Account Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{connectionData.user_info.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Facebook ID:</span>
                    <span className="font-medium">{connectionData.user_info.id}</span>
                  </div>
                  {connectionData.user_info.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{connectionData.user_info.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ad Accounts */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Ad Accounts ({connectionData.ad_accounts.length})
                </h4>
                <div className="space-y-3">
                  {connectionData.ad_accounts.map((account) => (
                    <div key={account.id} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{account.name}</h5>
                          <p className="text-sm text-gray-600">ID: {account.id}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          account.account_status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {account.account_status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Currency:</span>
                          <span className="ml-1 font-medium">{account.currency}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Timezone:</span>
                          <span className="ml-1 font-medium">{account.timezone_name}</span>
                        </div>
                        {account.amount_spent && (
                          <div>
                            <span className="text-gray-600">Total Spent:</span>
                            <span className="ml-1 font-medium">
                              {formatCurrency(parseFloat(account.amount_spent), account.currency)}
                            </span>
                          </div>
                        )}
                        {account.balance && (
                          <div>
                            <span className="text-gray-600">Balance:</span>
                            <span className="ml-1 font-medium">
                              {formatCurrency(parseFloat(account.balance), account.currency)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Data */}
              {connectionData.sample_data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Sample Campaigns */}
                  {connectionData.sample_data.campaigns.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Sample Campaigns ({connectionData.sample_data.campaigns.length})
                      </h4>
                      <div className="space-y-2">
                        {connectionData.sample_data.campaigns.map((campaign) => (
                          <div key={campaign.id} className="border border-gray-100 rounded p-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h6 className="font-medium text-sm">{campaign.name}</h6>
                                <p className="text-xs text-gray-600">{campaign.objective}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                campaign.status === 'ACTIVE' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
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
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Sample Insights (Last 7 Days)
                      </h4>
                      <div className="space-y-3">
                        {connectionData.sample_data.insights.map((insight, index) => (
                          <div key={index} className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 text-blue-500 mr-2" />
                              <span className="text-gray-600">Impressions:</span>
                              <span className="ml-1 font-medium">{formatNumber(parseInt(insight.impressions))}</span>
                            </div>
                            <div className="flex items-center">
                              <MousePointer className="w-4 h-4 text-green-500 mr-2" />
                              <span className="text-gray-600">Clicks:</span>
                              <span className="ml-1 font-medium">{formatNumber(parseInt(insight.clicks))}</span>
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 text-red-500 mr-2" />
                              <span className="text-gray-600">Spend:</span>
                              <span className="ml-1 font-medium">${parseFloat(insight.spend).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 text-purple-500 mr-2" />
                              <span className="text-gray-600">CTR:</span>
                              <span className="ml-1 font-medium">{parseFloat(insight.ctr).toFixed(2)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Data Sync Tab */}
      {activeTab === 'sync' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Historical Data Sync</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => startHistoricalSync(30)}
                disabled={syncing}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                <Calendar className="w-4 h-4 mr-2" />
                30 Days
              </button>
              <button
                onClick={() => startHistoricalSync(90)}
                disabled={syncing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {syncing ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                90 Days
              </button>
            </div>
          </div>

          {/* Sync Progress */}
          {syncProgress && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Sync Status</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  syncProgress.status === 'syncing' 
                    ? 'bg-blue-100 text-blue-800' 
                    : syncProgress.status === 'connected'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {syncProgress.status.toUpperCase()}
                </span>
              </div>

              {syncProgress.status === 'syncing' && (
                <div className="space-y-3">
                  <div className="flex items-center">
                    <RefreshCw className="w-5 h-5 text-blue-500 mr-2 animate-spin" />
                    <span className="text-gray-700">Synchronizing data...</span>
                  </div>
                  {syncProgress.sync_start && (
                    <p className="text-sm text-gray-600">
                      Started: {formatDate(syncProgress.sync_start)}
                    </p>
                  )}
                  {syncProgress.days_back && (
                    <p className="text-sm text-gray-600">
                      Importing last {syncProgress.days_back} days of data
                    </p>
                  )}
                </div>
              )}

              {syncProgress.results && (
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900">Sync Results</h5>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{syncProgress.results.campaigns_synced}</div>
                      <div className="text-sm text-gray-600">Campaigns</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{syncProgress.results.ad_sets_synced}</div>
                      <div className="text-sm text-gray-600">Ad Sets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{syncProgress.results.ads_synced}</div>
                      <div className="text-sm text-gray-600">Ads</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{syncProgress.results.insights_synced}</div>
                      <div className="text-sm text-gray-600">Insights</div>
                    </div>
                  </div>
                  
                  {syncProgress.results.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <h6 className="font-medium text-red-800 mb-2">Errors:</h6>
                      <ul className="text-sm text-red-700 space-y-1">
                        {syncProgress.results.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {syncProgress.last_sync && (
                <p className="text-sm text-gray-600 mt-3">
                  Last sync: {formatDate(syncProgress.last_sync)}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Synced Data Tab */}
      {activeTab === 'data' && syncedData && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Synced Data Overview</h3>
            <button
              onClick={fetchSyncedData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">{formatNumber(syncedData.data_summary.campaigns)}</div>
              <div className="text-sm text-gray-600">Campaigns</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{formatNumber(syncedData.data_summary.ad_sets)}</div>
              <div className="text-sm text-gray-600">Ad Sets</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-purple-600">{formatNumber(syncedData.data_summary.ads)}</div>
              <div className="text-sm text-gray-600">Ads</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-600">{formatNumber(syncedData.data_summary.metrics_records)}</div>
              <div className="text-sm text-gray-600">Metrics Records</div>
            </div>
          </div>

          {/* Recent Campaigns */}
          {syncedData.recent_campaigns.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Recent Campaigns</h4>
              <div className="space-y-3">
                {syncedData.recent_campaigns.map((campaign) => (
                  <div key={campaign.id} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h5 className="font-medium text-gray-900">{campaign.name}</h5>
                        <p className="text-sm text-gray-600">{campaign.objective}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-red-500 mr-2" />
                        <div>
                          <div className="text-gray-600">Total Spend</div>
                          <div className="font-medium">{formatCurrency(campaign.total_spend)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 text-blue-500 mr-2" />
                        <div>
                          <div className="text-gray-600">Impressions</div>
                          <div className="font-medium">{formatNumber(campaign.total_impressions)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <MousePointer className="w-4 h-4 text-green-500 mr-2" />
                        <div>
                          <div className="text-gray-600">Clicks</div>
                          <div className="font-medium">{formatNumber(campaign.total_clicks)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="w-4 h-4 text-purple-500 mr-2" />
                        <div>
                          <div className="text-gray-600">CTR</div>
                          <div className="font-medium">{campaign.ctr.toFixed(2)}%</div>
                        </div>
                      </div>
                    </div>
                    
                    {campaign.created_time && (
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {formatDate(campaign.created_time)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {syncedData.last_sync && (
            <p className="text-sm text-gray-600 text-center">
              Last synchronized: {formatDate(syncedData.last_sync)}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FacebookConnectionTest; 