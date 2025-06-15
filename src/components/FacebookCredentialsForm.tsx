import React, { useState } from 'react';

interface FacebookCredentialsFormProps {
  integrationName?: string;
  providerType?: 'facebook_ads' | 'facebook_conversions';
  onSuccess: (summary: any) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

interface FacebookCredentials {
  accessToken: string;
  pixelId?: string;
  adAccountId?: string;
  userInfo?: any;
  adAccounts?: any[];
  permissionWarning?: string;
}

const FacebookCredentialsForm: React.FC<FacebookCredentialsFormProps> = ({
  integrationName,
  providerType = 'facebook_ads', // Default to facebook_ads for backward compatibility
  onSuccess,
  onError,
  onClose
}) => {
  const [credentials, setCredentials] = useState<FacebookCredentials>({
    accessToken: '',
    pixelId: '',
    adAccountId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Determine API endpoints based on provider type
  const getEndpoints = () => {
    if (providerType === 'facebook_conversions') {
      return {
        test: '/api/v1/integrations/facebook-conversions/test-credentials',
        save: '/api/v1/integrations/facebook-conversions/save'
      };
    } else {
      return {
        test: '/api/v1/integrations/facebook-ads/test-credentials',
        save: '/api/v1/integrations/facebook-ads/save'
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.accessToken.trim()) {
      onError('Access Token is required');
      return;
    }

    // Basic token format validation
    const token = credentials.accessToken.trim();
    if (token.length < 50) {
      onError(`${providerType === 'facebook_conversions' ? 'Facebook Conversions API' : 'Facebook Business'} access tokens are typically much longer (100+ characters). Please check your token.`);
      return;
    }

    if (token.includes('test') || token === 'test_token' || token === 'your_token_here') {
      onError(`Please provide a real ${providerType === 'facebook_conversions' ? 'Facebook Conversions API' : 'Facebook Business'} access token, not a test or placeholder value.`);
      return;
    }

    setIsLoading(true);
    setStatusMessage('Authenticating...');

    try {
      // Check if user is properly authenticated
      let authToken = localStorage.getItem('auth_token');
      const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');

      if (!authToken || !currentUser.id) {
        throw new Error('Please log in to create integrations. No valid authentication found.');
      }

      console.log('Using authenticated token for user:', currentUser.id);

      const endpoints = getEndpoints();
      
      setStatusMessage(`Testing ${providerType === 'facebook_conversions' ? 'Facebook Conversions API' : 'Facebook Ads'} credentials...`);
      
      // Prepare credentials based on provider type
      const testCredentials = providerType === 'facebook_conversions' 
        ? {
            accessToken: credentials.accessToken,
            pixelId: credentials.pixelId,
            integrationName: integrationName || 'Facebook Conversions API'
          }
        : {
            accessToken: credentials.accessToken,
            adAccountId: credentials.adAccountId,
            integrationName: integrationName || 'Facebook Ads Integration'
          };

      // Test the credentials
      const response = await fetch(`http://localhost:8000${endpoints.test}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(testCredentials)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to validate credentials`);
      }

      const result = await response.json();
      
      if (result.valid) {
        setStatusMessage('Saving integration...');
        
        // Check if we have appropriate access and show appropriate message
        const hasAccess = providerType === 'facebook_conversions' 
          ? result.conversionApiAccess 
          : result.userInfo?.has_ad_access;
        const accessError = providerType === 'facebook_conversions'
          ? result.error
          : result.userInfo?.ad_access_error;
        
        if (!hasAccess && accessError) {
          // Show warning but still save the integration
          console.warn('Limited permissions detected:', accessError);
        }
        
        // Save the integration (this now includes comprehensive testing)
        const saveResponse = await fetch(`http://localhost:8000${endpoints.save}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(testCredentials)
        });

        if (saveResponse.ok) {
          const saveResult = await saveResponse.json();
          setStatusMessage('Integration saved successfully!');
          
          // Pass the comprehensive summary to parent
          onSuccess(saveResult);
        } else {
          const saveError = await saveResponse.json();
          throw new Error(saveError.detail || 'Failed to save integration');
        }
      } else {
        throw new Error(result.error || 'Invalid credentials');
      }
    } catch (error) {
      setStatusMessage('');
      onError(error instanceof Error ? error.message : `Failed to connect to ${providerType === 'facebook_conversions' ? 'Facebook Conversions API' : 'Facebook Ads'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {providerType === 'facebook_conversions' 
              ? 'Facebook Conversions API Access Token *'
              : 'Facebook Business Access Token *'
            }
          </label>
          <div className="relative">
            <input
              type={showAccessToken ? 'text' : 'password'}
              value={credentials.accessToken}
              onChange={(e) => setCredentials({...credentials, accessToken: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder={providerType === 'facebook_conversions' 
                ? 'Enter your Facebook Conversions API access token'
                : 'Enter your Facebook business access token'
              }
              required
            />
            <button
              type="button"
              onClick={() => setShowAccessToken(!showAccessToken)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showAccessToken ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878l-1.415-1.414M14.12 14.12l1.415 1.415M14.12 14.12L15.536 15.536M14.12 14.12l1.414 1.414" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                )}
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {providerType === 'facebook_conversions'
              ? 'Find this in Events Manager → Data Sources → Your Pixel → Settings → Conversions API'
              : 'Find this in Business Settings → System Users → Generate New Token'
            }
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {providerType === 'facebook_conversions' ? 'Facebook Pixel ID *' : 'Facebook Pixel ID (Optional)'}
          </label>
          <input
            type="text"
            value={credentials.pixelId}
            onChange={(e) => setCredentials({...credentials, pixelId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 1234567890123456"
            required={providerType === 'facebook_conversions'}
          />
          <p className="text-xs text-gray-500 mt-1">
            {providerType === 'facebook_conversions' 
              ? 'Required for Conversions API. Find this in Events Manager → Data Sources → Select your pixel'
              : 'Find this in Events Manager → Data Sources → Select your pixel'
            }
          </p>
        </div>

        {providerType === 'facebook_ads' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ad Account ID (Optional)
          </label>
          <input
            type="text"
            value={credentials.adAccountId}
            onChange={(e) => setCredentials({...credentials, adAccountId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., act_1234567890123456"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave blank to auto-detect your ad accounts
          </p>
        </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Connect'}
          </button>
        </div>
      </form>

      <div className="p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {providerType === 'facebook_conversions' 
            ? 'How to get a Facebook Conversions API Access Token:'
            : 'How to get a Facebook Business Access Token:'
          }
        </h4>
        <div className="text-xs text-gray-600 space-y-3">
          {providerType === 'facebook_conversions' ? (
            // Instructions for Facebook Conversions API
            <div>
              <p><strong>Events Manager (Direct Method):</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Events Manager</a></li>
                <li>Select your <strong>Facebook Pixel</strong></li>
                <li>Go to <strong>Settings</strong> → <strong>Conversions API</strong></li>
                <li>Click <strong>"Generate Access Token"</strong></li>
                <li>Copy the token (this is specifically for Conversions API)</li>
              </ol>
              
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-blue-800"><strong>Note:</strong> This token is specifically for server-side conversion tracking and is different from regular Facebook ad management tokens.</p>
              </div>
            </div>
          ) : (
            // Instructions for Facebook Ads
          <div>
            <p><strong>Business Settings (Recommended):</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to <a href="https://business.facebook.com/settings" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Facebook Business Settings</a></li>
              <li>Navigate to <strong>System Users</strong> → <strong>Add</strong></li>
              <li>Create a system user with <strong>"Admin"</strong> or <strong>"Advertiser"</strong> role</li>
              <li>Click <strong>"Generate New Token"</strong> → Select your app</li>
              <li>Add these permissions:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-0.5">
                  <li><code>ads_read</code> - Read ad account data</li>
                  <li><code>ads_management</code> - Access ad insights</li>
                  <li><code>business_management</code> - Access business assets</li>
                  <li><code>read_insights</code> - Read analytics data</li>
                </ul>
              </li>
              <li>Assign the system user to your ad accounts and pixels</li>
              <li>Copy the generated token (starts with "EAA..." and is 100+ characters)</li>
            </ol>
          </div>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm text-blue-800">{statusMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacebookCredentialsForm; 