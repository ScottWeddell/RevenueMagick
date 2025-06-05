import React, { useState, useEffect } from 'react';
import { Copy, Download, ExternalLink, CheckCircle, AlertCircle, Code, Zap, Eye, MousePointer, Activity } from 'lucide-react';

// Create a simple API client instance for this component
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiRequest = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = localStorage.getItem('auth_token');
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

interface TrackingScriptManagerProps {
  userId?: string;
}

interface TrackingConfig {
  apiEndpoint: string;
  trackingId: string;
  features: string[];
  customDomain?: string;
}

const TrackingScriptManager: React.FC<TrackingScriptManagerProps> = ({ userId }) => {
  const [config, setConfig] = useState<TrackingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'instructions' | 'test'>('script');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    generateTrackingScript();
  }, []);

  const generateTrackingScript = async () => {
    setLoading(true);
    try {
      const response = await apiRequest<TrackingConfig>('/tracking/generate-script', {
        method: 'POST',
        body: JSON.stringify({
          features: [
            'page_view_tracking',
            'click_tracking', 
            'scroll_tracking',
            'form_tracking',
            'cta_hover_tracking',
            'mouse_movement_tracking',
            'viewport_engagement',
            'hesitation_detection',
            'behavioral_signals'
          ],
          customization: {
            batchSize: 10,
            flushInterval: 5000,
            sessionTimeout: 1800000 // 30 minutes
          }
        })
      });
      setConfig(response);
    } catch (error) {
      console.error('Failed to generate tracking script:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrackingScript = () => {
    if (!config) return '';

    return `<!-- Revenue Magick Tracking Script -->
<script>
(function() {
  // Revenue Magick Configuration
  window.RevenueMagickConfig = {
    apiEndpoint: '${config.apiEndpoint}',
    trackingId: '${config.trackingId}',
    batchSize: 10,
    flushInterval: 5000,
    sessionTimeout: 30 * 60 * 1000,
    features: ${JSON.stringify(config.features, null, 2)}
  };

  // Load Revenue Magick Tracking SDK
  var script = document.createElement('script');
  script.src = '${config.apiEndpoint.replace('/api/v1/tracking', '')}/sdk/revenue-magick-tracker.min.js';
  script.async = true;
  script.onload = function() {
    if (window.RevenueMagick) {
      window.RevenueMagick.init(window.RevenueMagickConfig);
      console.log('Revenue Magick Tracker initialized successfully');
    }
  };
  document.head.appendChild(script);
})();
</script>
<!-- End Revenue Magick Tracking Script -->`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getTrackingScript());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadScript = () => {
    const script = getTrackingScript();
    const blob = new Blob([script], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'revenue-magick-tracking.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const testTrackingScript = async () => {
    setTestStatus('testing');
    try {
      if (!config) {
        throw new Error('No tracking configuration available');
      }

      const response = await apiRequest<any>('/tracking/test-script', {
        method: 'POST',
        body: JSON.stringify({
          tracking_id: config.trackingId,
          website_url: window.location.origin
        })
      });

      if (response.test_status === 'success') {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
      
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch (error) {
      console.error('Test failed:', error);
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  const features = [
    { icon: Eye, name: 'Page View Tracking', description: 'Track page visits and session data' },
    { icon: MousePointer, name: 'Click Tracking', description: 'Monitor all user clicks and interactions' },
    { icon: Activity, name: 'Scroll Behavior', description: 'Analyze scroll patterns and engagement depth' },
    { icon: Code, name: 'Form Analytics', description: 'Track form interactions and abandonment' },
    { icon: Zap, name: 'CTA Performance', description: 'Measure hover time and click-through rates' },
    { icon: MousePointer, name: 'Mouse Patterns', description: 'Analyze mouse movement and hesitation' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Generating tracking script...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Zap className="mr-3" />
            Revenue Magick Tracking Script
          </h2>
          <p className="text-blue-100 mt-2">
            Digital Body Language™ tracking for your website
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'script', label: 'Get Script', icon: Code },
              { id: 'instructions', label: 'Instructions', icon: ExternalLink },
              { id: 'test', label: 'Test & Verify', icon: CheckCircle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'script' && (
            <div className="space-y-6">
              {/* Features Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Tracking Features Included
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <feature.icon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">{feature.name}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Script Code */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Your Tracking Script
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={downloadScript}
                      className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{getTrackingScript()}</code>
                  </pre>
                </div>
              </div>

              {/* Configuration Info */}
              {config && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">Configuration Details</h4>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-blue-800">Tracking ID:</span>
                      <span className="text-blue-700 font-mono text-sm break-all">{config.trackingId}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium text-blue-800">API Endpoint:</span>
                      <span className="text-blue-700 font-mono text-sm break-all">{config.apiEndpoint}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Installation Instructions
                </h3>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900 mb-2">Step 1: Copy the Script</h4>
                    <p className="text-gray-600">
                      Copy the tracking script from the "Get Script" tab above.
                    </p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900 mb-2">Step 2: Add to Your Website</h4>
                    <p className="text-gray-600 mb-3">
                      Paste the script in the <code className="bg-gray-100 px-2 py-1 rounded">&lt;head&gt;</code> section of your HTML, 
                      just before the closing <code className="bg-gray-100 px-2 py-1 rounded">&lt;/head&gt;</code> tag.
                    </p>
                    <div className="bg-gray-50 p-3 rounded border">
                      <pre className="text-sm text-gray-700">
{`<head>
  <!-- Your existing head content -->
  <title>Your Website</title>
  
  <!-- Revenue Magick Tracking Script -->
  <!-- Paste the script here -->
  
</head>`}
                      </pre>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-gray-900 mb-2">Step 3: Verify Installation</h4>
                    <p className="text-gray-600">
                      Use the "Test & Verify" tab to ensure the tracking script is working correctly on your website.
                    </p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium text-gray-900 mb-2">Platform-Specific Instructions</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-800">WordPress</h5>
                        <p className="text-gray-600 text-sm">
                          Add the script to your theme's <code className="bg-gray-100 px-1 rounded">header.php</code> file 
                          or use a plugin like "Insert Headers and Footers".
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">Shopify</h5>
                        <p className="text-gray-600 text-sm">
                          Go to Online Store → Themes → Actions → Edit Code → theme.liquid and add the script 
                          before <code className="bg-gray-100 px-1 rounded">&lt;/head&gt;</code>.
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800">Squarespace</h5>
                        <p className="text-gray-600 text-sm">
                          Go to Settings → Advanced → Code Injection and add the script to the Header section.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Test Your Installation
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Automatic Testing</h4>
                    <p className="text-gray-600 mb-4">
                      Click the button below to test if your tracking script is properly installed and sending data.
                    </p>
                    <button
                      onClick={testTrackingScript}
                      disabled={testStatus === 'testing'}
                      className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                        testStatus === 'testing'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : testStatus === 'success'
                          ? 'bg-green-600 hover:bg-green-700'
                          : testStatus === 'error'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      {testStatus === 'testing' && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      )}
                      {testStatus === 'success' && <CheckCircle className="w-4 h-4 mr-2" />}
                      {testStatus === 'error' && <AlertCircle className="w-4 h-4 mr-2" />}
                      {testStatus === 'testing' ? 'Testing...' : 
                       testStatus === 'success' ? 'Test Passed!' :
                       testStatus === 'error' ? 'Test Failed' : 'Test Installation'}
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Manual Testing</h4>
                    <div className="space-y-2 text-sm text-blue-800">
                      <p>1. Open your website in a new browser tab</p>
                      <p>2. Open browser Developer Tools (F12)</p>
                      <p>3. Go to the Console tab</p>
                      <p>4. Look for "Revenue Magick Tracker initialized successfully"</p>
                      <p>5. Interact with your page (scroll, click, hover) to generate events</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">What Gets Tracked</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
                      <div>• Page views and sessions</div>
                      <div>• Click events and patterns</div>
                      <div>• Scroll behavior and depth</div>
                      <div>• Form interactions</div>
                      <div>• CTA hover times</div>
                      <div>• Mouse movement patterns</div>
                      <div>• Viewport engagement</div>
                      <div>• Navigation behavior</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackingScriptManager; 