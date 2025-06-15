import React, { useState } from 'react';

interface GoogleCredentialsFormProps {
  integrationName?: string;
  onSuccess: (summary: any) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

interface GoogleCredentials {
  accessToken: string;
  customerId?: string;
  propertyId?: string;
}

const GoogleCredentialsForm: React.FC<GoogleCredentialsFormProps> = ({
  integrationName,
  onSuccess,
  onError,
  onClose
}) => {
  const [credentials, setCredentials] = useState<GoogleCredentials>({
    accessToken: '',
    customerId: '',
    propertyId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.accessToken.trim()) {
      onError('Access Token is required');
      return;
    }

    // Basic token format validation
    const token = credentials.accessToken.trim();
    if (token.length < 50) {
      onError('Google access tokens are typically much longer (100+ characters). Please check your token.');
      return;
    }

    if (token.includes('test') || token === 'test_token' || token === 'your_token_here') {
      onError('Please provide a real Google access token, not a test or placeholder value.');
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

      setStatusMessage('Testing Google credentials...');
      // Test the credentials
      const response = await fetch('http://localhost:8000/api/v1/integrations/google/test-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to validate credentials`);
      }

      const result = await response.json();
      
      if (result.valid) {
        setStatusMessage('Saving integration...');
        
        // Save the integration
        const saveResponse = await fetch('http://localhost:8000/api/v1/integrations/google/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            ...credentials,
            integrationName: integrationName || 'Google Ads & Analytics Integration'
          })
        });

        if (saveResponse.ok) {
          const saveResult = await saveResponse.json();
          setStatusMessage('Integration saved successfully!');
          
          // Test analytics events if property ID is provided
          if (credentials.propertyId) {
            setStatusMessage('Testing analytics events access...');
            
            try {
              const analyticsResponse = await fetch('http://localhost:8000/api/v1/integrations/google/analytics-events', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                  credentials: credentials,
                  date_range: "7daysAgo"
                })
              });
              
              if (analyticsResponse.ok) {
                const analyticsData = await analyticsResponse.json();
                
                // Add analytics test results to the save result
                saveResult.analytics_test = {
                  success: true,
                  real_time_events: analyticsData.real_time_events?.length || 0,
                  historical_events: analyticsData.events?.length || 0,
                  conversion_events: analyticsData.conversions?.length || 0,
                  errors: analyticsData.errors || []
                };
                
                // Add analytics capabilities to the response
                if (!saveResult.capabilities) saveResult.capabilities = [];
                
                if (analyticsData.errors && analyticsData.errors.length > 0) {
                  saveResult.capabilities.push("⚠️ Analytics Events - API accessible but authentication failed");
                  saveResult.capabilities.push("🔧 Analytics Setup - Endpoint ready, needs valid token");
                } else {
                  saveResult.capabilities.push("✅ Analytics Events - Successfully tested API access");
                  saveResult.capabilities.push("📊 Real-time Events - Can read live user activity");
                  saveResult.capabilities.push("📈 Historical Events - Can read past user behavior");
                  saveResult.capabilities.push("💰 Conversion Events - Can read purchase and goal data");
                }
                
                setStatusMessage('Analytics testing complete!');
              } else {
                saveResult.analytics_test = {
                  success: false,
                  error: `Analytics test failed: ${analyticsResponse.status}`
                };
              }
            } catch (analyticsError) {
              saveResult.analytics_test = {
                success: false,
                error: `Analytics test error: ${analyticsError.message}`
              };
            }
          }
          
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
      onError(error instanceof Error ? error.message : 'Failed to connect to Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simple 3-Step Process */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-blue-900 mb-3">🚀 Quick Setup (3 Simple Steps)</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="font-medium text-blue-900">Get your Google Access Token</p>
              <p className="text-blue-700">Visit the OAuth Playground link below → Generate token → Copy it</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="font-medium text-blue-900">Find your Google Ads Customer ID (Optional)</p>
              <p className="text-blue-700">In Google Ads → Settings → Account settings → Copy the 10-digit number</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p className="font-medium text-blue-900">Find your Analytics Property ID (Optional)</p>
              <p className="text-blue-700">In Google Analytics → Admin → Property Settings → Copy the 9-digit number</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Access Token */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
            <label className="text-lg font-medium text-gray-900">
              Google Access Token *
            </label>
          </div>
          <div className="relative">
            <input
              type={showAccessToken ? 'text' : 'password'}
              value={credentials.accessToken}
              onChange={(e) => setCredentials({...credentials, accessToken: e.target.value})}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 text-sm"
              placeholder="Paste your Google OAuth access token here"
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
          <div className="mt-2 p-3 bg-gray-50 rounded border">
            <p className="text-sm font-medium text-gray-700 mb-2">🔗 Get your token here:</p>
            <a 
              href="https://developers.google.com/oauthplayground" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Google OAuth 2.0 Playground
            </a>
            <div className="mt-2 text-xs text-gray-600">
              <p><strong>Quick setup:</strong> Select these scopes → Authorize → Get access token</p>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                <li><code>https://www.googleapis.com/auth/adwords</code></li>
                <li><code>https://www.googleapis.com/auth/analytics.readonly</code></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 2: Google Ads Customer ID */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
            <label className="text-lg font-medium text-gray-900">
              Google Ads Customer ID
            </label>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <input
            type="text"
            value={credentials.customerId}
            onChange={(e) => setCredentials({...credentials, customerId: e.target.value})}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="e.g., 123-456-7890"
          />
          <div className="mt-2 p-3 bg-gray-50 rounded border">
            <p className="text-sm font-medium text-gray-700 mb-1">📍 Where to find this:</p>
            <p className="text-xs text-gray-600">Google Ads → Settings → Account settings → Customer ID (10-digit number)</p>
          </div>
        </div>

        {/* Step 3: Analytics Property ID */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
            <label className="text-lg font-medium text-gray-900">
              Google Analytics Property ID
            </label>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <input
            type="text"
            value={credentials.propertyId}
            onChange={(e) => setCredentials({...credentials, propertyId: e.target.value})}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="e.g., 123456789"
          />
          <div className="mt-2 p-3 bg-gray-50 rounded border">
            <p className="text-sm font-medium text-gray-700 mb-1">📍 Where to find this:</p>
            <p className="text-xs text-gray-600">Google Analytics → Admin → Property Settings → Property ID (9-digit number)</p>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Connecting...' : 'Connect Google'}
          </button>
        </div>
      </form>

      {statusMessage && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm text-blue-800 font-medium">{statusMessage}</span>
          </div>
        </div>
      )}

      {/* What You'll Get */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-green-900 mb-3">✨ What Revenue Magick will unlock:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800">Google Ads campaign performance</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800">Website analytics & conversions</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800">AI-powered optimization insights</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800">Revenue attribution tracking</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleCredentialsForm; 