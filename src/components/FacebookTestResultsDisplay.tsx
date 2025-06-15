import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Database, TrendingUp, Users, Target, Zap } from 'lucide-react';

interface FacebookTestResultsDisplayProps {
  testResults: {
    valid: boolean;
    error?: string;
    userInfo?: any;
    adAccounts?: any[];
    capabilities?: string[];
    limitations?: string[];
    accessSummary?: {
      ad_accounts?: number;
      campaigns?: number;
      ad_sets?: number;
      ads?: number;
      pixels?: number;
      audiences?: number;
      performance_data?: boolean;
      total_capabilities?: number;
      total_limitations?: number;
      integration_ready?: boolean;
      data_types_available?: string[];
    };
    campaignData?: {
      total_campaigns?: number;
      sample_campaigns?: any[];
      objectives?: string[];
      error?: string;
    };
    performanceData?: {
      period?: string;
      impressions?: string;
      clicks?: string;
      spend?: string;
      ctr?: string;
      cpm?: string;
      reach?: string;
      actions?: any[];
      message?: string;
      error?: string;
    };
    pixelData?: {
      total_pixels?: number;
      pixels?: any[];
      error?: string;
    };
    audienceData?: {
      total_audiences?: number;
      audiences?: any[];
      message?: string;
      error?: string;
    };
  };
  providerType?: 'facebook_ads' | 'facebook_conversions';
}

const FacebookTestResultsDisplay: React.FC<FacebookTestResultsDisplayProps> = ({
  testResults,
  providerType = 'facebook_ads'
}) => {
  if (!testResults.valid && testResults.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <XCircle className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-semibold text-red-900">Connection Failed</h3>
        </div>
        <p className="text-red-700">{testResults.error}</p>
      </div>
    );
  }

  const { accessSummary, campaignData, performanceData, pixelData, audienceData } = testResults;

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <div className={`border rounded-lg p-6 ${testResults.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          {testResults.valid ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-yellow-600" />
          )}
          <h3 className="text-lg font-semibold text-gray-900">
            {testResults.valid ? 'Facebook Integration Ready!' : 'Facebook Integration Partially Ready'}
          </h3>
        </div>
        
        {testResults.userInfo && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Connected as: <span className="font-medium">{testResults.userInfo.name || testResults.userInfo.id}</span>
            </p>
          </div>
        )}

        {accessSummary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{accessSummary.ad_accounts || 0}</div>
              <div className="text-sm text-gray-600">Ad Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{accessSummary.campaigns || 0}</div>
              <div className="text-sm text-gray-600">Campaigns</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{accessSummary.pixels || 0}</div>
              <div className="text-sm text-gray-600">Pixels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{accessSummary.total_capabilities || 0}</div>
              <div className="text-sm text-gray-600">Capabilities</div>
            </div>
          </div>
        )}
      </div>

      {/* Revenue Magick Capabilities */}
      {testResults.capabilities && testResults.capabilities.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-blue-600" />
            <h4 className="text-lg font-semibold text-gray-900">Revenue Magick Capabilities</h4>
          </div>
          <div className="grid gap-3">
            {testResults.capabilities.map((capability, index) => (
              <div key={index} className="flex items-start gap-3">
                {capability.includes('✅') ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : capability.includes('⚠️') ? (
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 bg-blue-100 rounded-full mt-0.5 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-700">{capability.replace(/[✅⚠️❌]/g, '').trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Access Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Campaign Data */}
        {campaignData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-green-600" />
              <h4 className="text-lg font-semibold text-gray-900">Campaign Data Access</h4>
            </div>
            
            {campaignData.error ? (
              <p className="text-red-600 text-sm">{campaignData.error}</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Campaigns:</span>
                  <span className="text-sm font-medium">{campaignData.total_campaigns || 0}</span>
                </div>
                
                {campaignData.objectives && campaignData.objectives.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Campaign Types:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {campaignData.objectives.map((objective, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {objective.replace('OUTCOME_', '')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {campaignData.sample_campaigns && campaignData.sample_campaigns.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Sample Campaigns:</span>
                    <div className="mt-2 space-y-2">
                      {campaignData.sample_campaigns.slice(0, 3).map((campaign, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium truncate">{campaign.name}</div>
                          <div className="text-gray-500">
                            Status: {campaign.status} | Budget: ${campaign.daily_budget ? (parseInt(campaign.daily_budget) / 100).toFixed(2) : 'N/A'}
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

        {/* Performance Data */}
        {performanceData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-900">Performance Metrics</h4>
            </div>
            
            {performanceData.error ? (
              <p className="text-red-600 text-sm">{performanceData.error}</p>
            ) : performanceData.message ? (
              <p className="text-yellow-600 text-sm">{performanceData.message}</p>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-gray-500 mb-3">
                  Data for last {performanceData.period || '7 days'}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-600">Impressions</div>
                    <div className="text-lg font-semibold">{performanceData.impressions ? parseInt(performanceData.impressions).toLocaleString() : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Clicks</div>
                    <div className="text-lg font-semibold">{performanceData.clicks ? parseInt(performanceData.clicks).toLocaleString() : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Spend</div>
                    <div className="text-lg font-semibold">${performanceData.spend ? parseFloat(performanceData.spend).toFixed(2) : 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">CTR</div>
                    <div className="text-lg font-semibold">{performanceData.ctr ? parseFloat(performanceData.ctr).toFixed(2) + '%' : 'N/A'}</div>
                  </div>
                </div>

                {performanceData.actions && performanceData.actions.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">Conversion Actions:</div>
                    <div className="space-y-1">
                      {performanceData.actions.slice(0, 3).map((action, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-600">{action.action_type?.replace(/_/g, ' ')}</span>
                          <span className="font-medium">{action.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Pixel Data */}
        {pixelData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-900">Facebook Pixels</h4>
            </div>
            
            {pixelData.error ? (
              <p className="text-red-600 text-sm">{pixelData.error}</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Pixels:</span>
                  <span className="text-sm font-medium">{pixelData.total_pixels || 0}</span>
                </div>

                {pixelData.pixels && pixelData.pixels.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Pixel Details:</span>
                    <div className="mt-2 space-y-2">
                      {pixelData.pixels.slice(0, 3).map((pixel, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium truncate">{pixel.name}</div>
                          <div className="text-gray-500">
                            ID: {pixel.id} | 
                            Status: {pixel.active ? (
                              <span className="text-green-600"> Active</span>
                            ) : (
                              <span className="text-gray-500"> Inactive</span>
                            )}
                          </div>
                          {pixel.last_fired && (
                            <div className="text-gray-400 text-xs">
                              Last fired: {new Date(pixel.last_fired).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Audience Data */}
        {audienceData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-5 h-5 text-orange-600" />
              <h4 className="text-lg font-semibold text-gray-900">Custom Audiences</h4>
            </div>
            
            {audienceData.message ? (
              <p className="text-yellow-600 text-sm">{audienceData.message}</p>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Audiences:</span>
                  <span className="text-sm font-medium">{audienceData.total_audiences || 0}</span>
                </div>

                {audienceData.audiences && audienceData.audiences.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600">Audience Details:</span>
                    <div className="mt-2 space-y-2">
                      {audienceData.audiences.slice(0, 3).map((audience, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                          <div className="font-medium truncate">{audience.name}</div>
                          <div className="text-gray-500">
                            Size: ~{audience.size ? parseInt(audience.size).toLocaleString() : 'N/A'} | 
                            Status: {audience.status}
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

      {/* Limitations */}
      {testResults.limitations && testResults.limitations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h4 className="text-lg font-semibold text-yellow-900">Limitations</h4>
          </div>
          <div className="space-y-2">
            {testResults.limitations.map((limitation, index) => (
              <div key={index} className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-yellow-700">{limitation.replace(/[✅⚠️❌]/g, '').trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Integration Summary */}
      {accessSummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-4">Integration Summary</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Available Data Types:</h5>
              <div className="space-y-1">
                {accessSummary.data_types_available?.map((dataType, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-green-500" />
                    <span className="text-sm text-blue-700">{dataType}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-blue-800 mb-2">Integration Status:</h5>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Ready for Production:</span>
                  <span className={`text-sm font-medium ${accessSummary.integration_ready ? 'text-green-600' : 'text-yellow-600'}`}>
                    {accessSummary.integration_ready ? 'Yes' : 'Partial'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Total Capabilities:</span>
                  <span className="text-sm font-medium text-blue-800">{accessSummary.total_capabilities}</span>
                </div>
                {(accessSummary.total_limitations ?? 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-700">Minor Limitations:</span>
                    <span className="text-sm font-medium text-yellow-600">{accessSummary.total_limitations}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacebookTestResultsDisplay; 