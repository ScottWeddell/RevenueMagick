import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface CallbackData {
  success: boolean;
  integration_id?: string;
  provider?: string;
  user_info?: any;
  ad_accounts?: any[];
  test_result?: any;
  message?: string;
  error?: string;
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [data, setData] = useState<CallbackData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle OAuth errors
      if (error) {
        setStatus('error');
        setError(`OAuth Error: ${error} - ${errorDescription || 'Unknown error'}`);
        return;
      }

      // Validate required parameters
      if (!code || !state) {
        setStatus('error');
        setError('Missing required OAuth parameters');
        return;
      }

      // Validate state parameter
      const storedState = localStorage.getItem('facebook_oauth_state');
      const storedExpiry = localStorage.getItem('facebook_oauth_expires');
      
      if (!storedState || storedState !== state) {
        setStatus('error');
        setError('Invalid OAuth state parameter');
        return;
      }

      if (storedExpiry && Date.now() > parseInt(storedExpiry)) {
        setStatus('error');
        setError('OAuth session expired');
        return;
      }

      // Clean up stored state
      localStorage.removeItem('facebook_oauth_state');
      localStorage.removeItem('facebook_oauth_expires');

      try {
        // Send callback data to backend
        const response = await fetch(`${API_BASE_URL}/oauth/facebook/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            state,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        const callbackData: CallbackData = await response.json();
        setData(callbackData);
        setStatus('success');

        // Redirect to integrations page after a short delay
        setTimeout(() => {
          navigate('/integrations', { 
            state: { 
              newIntegration: callbackData.integration_id,
              provider: callbackData.provider 
            } 
          });
        }, 3000);

      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to complete OAuth flow');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting Your Account
            </h2>
            <p className="text-gray-600">
              Please wait while we complete the connection to your Facebook Ads account...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            <button
              onClick={() => navigate('/integrations')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Integrations
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success' && data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Successfully Connected!
            </h2>
            <p className="text-gray-600 mb-4">
              {data.message || 'Your Facebook Ads account has been connected successfully.'}
            </p>
            
            {data.user_info && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Connected as:</p>
                <p className="font-medium text-gray-900">{data.user_info.name}</p>
              </div>
            )}

            {data.ad_accounts && data.ad_accounts.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Ad Accounts Found:</p>
                <p className="font-medium text-gray-900">{data.ad_accounts.length} account(s)</p>
              </div>
            )}

            <p className="text-sm text-gray-500 mb-4">
              Redirecting to integrations page...
            </p>
            
            <button
              onClick={() => navigate('/integrations')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue to Integrations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback; 