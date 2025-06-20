import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../lib/api';

interface GoHighLevelCredentials {
  apiKey: string;
  locationId: string;
}

interface GoHighLevelTestResult {
  valid: boolean;
  error?: string;
}

interface GoHighLevelSaveResult {
  success: boolean;
  integration_id?: string;
  message?: string;
}

interface GoHighLevelCredentialsFormProps {
  integrationName?: string;
  onSuccess: (summary: any) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

const GoHighLevelCredentialsForm: React.FC<GoHighLevelCredentialsFormProps> = ({
  integrationName,
  onSuccess,
  onError,
  onClose
}) => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [credentials, setCredentials] = useState<GoHighLevelCredentials>({
    apiKey: '',
    locationId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Fetch user info from backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (user) {
        try {
          const response = await apiClient.getCurrentUser();
          setUserInfo(response.user);
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      }
    };

    fetchUserInfo();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.apiKey.trim() || !credentials.locationId.trim()) {
      onError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setStatusMessage('');

    try {
      setStatusMessage('Testing GoHighLevel credentials...');
      
      // Prepare credentials for testing
      const testCredentials = {
        apiKey: credentials.apiKey,
        locationId: credentials.locationId,
        integrationName: integrationName || 'GoHighLevel CRM'
      };

      // Test the credentials using apiClient (which handles auth automatically)
      const result: GoHighLevelTestResult = await apiClient.testGoHighLevelCredentials(testCredentials);

      console.log('Test result:', result);
      
      if (result.valid) {
        setStatusMessage('Saving integration...');
        
        // Save the integration using apiClient
        const saveResult: GoHighLevelSaveResult = await apiClient.saveGoHighLevelIntegration(testCredentials);

        setStatusMessage('Integration saved successfully!');
        
        // Pass the comprehensive summary to parent
        onSuccess(saveResult);
      } else {
        throw new Error(result.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error testing GoHighLevel credentials:', error);
      onError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">GoHighLevel Integration Setup</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>To connect your GoHighLevel account, you'll need:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>API Key:</strong> Get your API key from GoHighLevel Business Profile page</li>
            <li><strong>Location ID:</strong> Your specific location/agency identifier</li>
          </ul>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-3">
            <p className="text-yellow-800 text-xs">
              <strong>How to find your API key:</strong> Go to Settings → Business Profile → scroll down to find your API key section.
            </p>
          </div>
          <p className="mt-2">
            <a 
              href="https://help.gohighlevel.com/support/solutions/articles/48001064398-api-documentation" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              View GoHighLevel API Documentation →
            </a>
          </p>
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
            <span className="text-yellow-800 text-sm">{statusMessage}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* API Key Field */}
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            API Key *
            </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Key className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type={showApiKey ? "text" : "password"}
              id="apiKey"
              value={credentials.apiKey}
              onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your GoHighLevel API key"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                ) : (
                <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Find your API key in GoHighLevel Settings → Business Profile
          </p>
        </div>

        {/* Location ID Field */}
        <div>
          <label htmlFor="locationId" className="block text-sm font-medium text-gray-700 mb-1">
            Location ID *
            </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
              id="locationId"
            value={credentials.locationId}
              onChange={(e) => setCredentials(prev => ({ ...prev, locationId: e.target.value }))}
              className="block w-full pl-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your Location ID"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Your specific location/agency identifier from GoHighLevel
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !credentials.apiKey.trim() || !credentials.locationId.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Testing...' : 'Test & Save Integration'}
          </button>
        </div>
      </form>

      {/* Help Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• API Key: Go to Settings → Integrations → API in your GoHighLevel account</p>
          <p>• Location ID: Found in your GoHighLevel URL or account settings</p>
          <p>• Ensure your API key has the necessary permissions for contacts, pipelines, and workflows</p>
        </div>
      </div>
    </div>
  );
};

export default GoHighLevelCredentialsForm; 