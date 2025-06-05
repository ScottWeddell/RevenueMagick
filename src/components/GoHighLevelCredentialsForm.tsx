import React, { useState } from 'react';

interface GoHighLevelCredentialsFormProps {
  integrationName?: string;
  onSuccess: (summary: any) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

interface GoHighLevelCredentials {
  accessToken: string;
  locationId?: string;
}

const GoHighLevelCredentialsForm: React.FC<GoHighLevelCredentialsFormProps> = ({
  integrationName,
  onSuccess,
  onError,
  onClose
}) => {
  const [credentials, setCredentials] = useState<GoHighLevelCredentials>({
    accessToken: '',
    locationId: ''
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
    if (token.length < 30) {
      onError('GoHighLevel access tokens are typically longer (50+ characters). Please check your token.');
      return;
    }

    if (token.includes('test') || token === 'test_token' || token === 'your_token_here') {
      onError('Please provide a real GoHighLevel access token, not a test or placeholder value.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('Authenticating...');

    try {
      // Always generate a fresh token for testing
      setStatusMessage('Generating authentication token...');
      const tokenResponse = await fetch('http://localhost:8000/api/v1/auth/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subject: 'test_user', expires_hours: 24 })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to generate authentication token');
      }

      const tokenData = await tokenResponse.json();
      const token = tokenData.access_token;
      localStorage.setItem('token', token);

      if (!token) {
        throw new Error('No authentication token available');
      }

      setStatusMessage('Testing GoHighLevel credentials...');
      // Test the credentials
      const response = await fetch('http://localhost:8000/api/v1/integrations/gohighlevel/test-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
        const saveResponse = await fetch('http://localhost:8000/api/v1/integrations/gohighlevel/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...credentials,
            integrationName: integrationName || 'GoHighLevel CRM Integration'
          })
        });

        if (saveResponse.ok) {
          const saveResult = await saveResponse.json();
          setStatusMessage('Integration saved successfully!');
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
      onError(error instanceof Error ? error.message : 'Failed to connect to GoHighLevel');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simple 2-Step Process */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="text-lg font-semibold text-purple-900 mb-3">🚀 Quick Setup (2 Simple Steps)</h4>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="font-medium text-purple-900">Get your GoHighLevel Access Token</p>
              <p className="text-purple-700">Settings → Integrations → API Keys → Create new API key</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="font-medium text-purple-900">Find your Location ID (Optional)</p>
              <p className="text-purple-700">Settings → Company → Location ID (for contact access)</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Step 1: Access Token */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
            <label className="text-lg font-medium text-gray-900">
              GoHighLevel Access Token *
            </label>
          </div>
          <div className="relative">
            <input
              type={showAccessToken ? 'text' : 'password'}
              value={credentials.accessToken}
              onChange={(e) => setCredentials({...credentials, accessToken: e.target.value})}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10 text-sm"
              placeholder="Paste your GoHighLevel API access token here"
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
            <p className="text-sm font-medium text-gray-700 mb-2">📍 Where to find this:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>1.</strong> Log into your GoHighLevel account</p>
              <p><strong>2.</strong> Go to Settings → Integrations → API Keys</p>
              <p><strong>3.</strong> Click "Create API Key" and copy the token</p>
              <p><strong>4.</strong> Make sure to enable the required scopes (locations, contacts)</p>
            </div>
          </div>
        </div>

        {/* Step 2: Location ID */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-gray-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
            <label className="text-lg font-medium text-gray-900">
              Location ID
            </label>
            <span className="text-sm text-gray-500">(Optional)</span>
          </div>
          <input
            type="text"
            value={credentials.locationId}
            onChange={(e) => setCredentials({...credentials, locationId: e.target.value})}
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            placeholder="e.g., 5DP4iH6HLkQsiKESj6rh"
          />
          <div className="mt-2 p-3 bg-gray-50 rounded border">
            <p className="text-sm font-medium text-gray-700 mb-1">📍 Where to find this:</p>
            <p className="text-xs text-gray-600">Settings → Company → Location ID (needed for contact database access)</p>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Connecting...' : 'Connect GoHighLevel'}
          </button>
        </div>
      </form>

      {statusMessage && (
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-600 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm text-purple-800 font-medium">{statusMessage}</span>
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
            <span className="text-green-800">Contact database & lead tracking</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800">Agency & location management</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800">Customer journey analytics</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800">AI-powered CRM insights</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoHighLevelCredentialsForm; 