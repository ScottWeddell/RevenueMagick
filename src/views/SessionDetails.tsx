import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Activity, 
  Clock, 
  MousePointer, 
  Eye, 
  BarChart3, 
  TrendingUp,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Calendar,
  User,
  ExternalLink,
  Download,
  Code,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DetailedSessionData {
  id: string;
  user_id: string;
  tracking_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  is_active: boolean;
  
  // Session metadata
  referrer?: string;
  device_type?: string;
  browser?: string;
  location?: string;
  source?: string;
  
  // Page information
  pages_visited: string[];
  primary_page_url: string;
  primary_page_title: string;
  
  // Engagement metrics
  total_events: number;
  page_views: number;
  clicks: number;
  scroll_events: number;
  form_interactions: number;
  hover_events: number;
  mouse_movements: number;
  
  // Time analytics
  time_on_elements: Record<string, number>;
  last_activity: string;
  
  // Event breakdown
  event_breakdown: Record<string, number>;
  
  // All events
  events: EventData[];
}

interface EventData {
  id: string;
  event_type: string;
  timestamp: string;
  element_id?: string;
  duration?: number;
  metadata: any;
  raw_data: any;
}

const SessionDetails: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [sessionData, setSessionData] = useState<DetailedSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'analytics' | 'raw'>('overview');
  const [showRawData, setShowRawData] = useState<Record<string, boolean>>({});
  const [timelineFilter, setTimelineFilter] = useState<string>('all');

  // API client function using Supabase auth
  const apiRequest = async <T,>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    // Get Supabase session token instead of localStorage auth_token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
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

  const fetchSessionDetails = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiRequest<DetailedSessionData>(`/tracking/admin/sessions/${sessionId}`);
      setSessionData(data);
    } catch (error) {
      console.error('Failed to fetch session details:', error);
      setError('Failed to load session details. Please try again.');
      
      // Mock data for development
      const mockData: DetailedSessionData = {
        id: sessionId,
        user_id: 'user_123',
        tracking_id: 'rm_test_user_ecf7d261',
        start_time: new Date(Date.now() - 3600000).toISOString(),
        end_time: new Date(Date.now() - 1800000).toISOString(),
        duration: 1800,
        is_active: false,
        
        referrer: 'https://google.com/search?q=business+software',
        device_type: 'desktop',
        browser: 'Chrome 120.0.0.0',
        location: 'San Francisco, CA, US',
        source: 'direct',
        
        pages_visited: [
          'http://localhost:8080/index.html',
          'http://localhost:8080/about.html',
          'http://localhost:8080/contact.html'
        ],
        primary_page_url: 'http://localhost:8080/index.html',
        primary_page_title: 'TechSolutions Pro - Business Software Solutions',
        
        total_events: 45,
        page_views: 3,
        clicks: 8,
        scroll_events: 12,
        form_interactions: 2,
        hover_events: 15,
        mouse_movements: 5,
        
        time_on_elements: {
          'hero-cta': 15.5,
          'pricing-section': 45.2,
          'contact-form': 120.8,
          'testimonials': 25.3
        },
        last_activity: new Date(Date.now() - 1800000).toISOString(),
        
        event_breakdown: {
          'page_view': 3,
          'click': 8,
          'scroll': 12,
          'hover': 15,
          'form_interaction': 2,
          'mouse_movement': 5
        },
        
        events: [
          {
            id: 'event_1',
            event_type: 'page_view',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            metadata: { 
              page_url: 'http://localhost:8080/index.html',
              page_title: 'TechSolutions Pro - Business Software Solutions',
              referrer: 'https://google.com'
            },
            raw_data: {
              session_id: sessionId,
              user_id: 'user_123',
              created_at: new Date(Date.now() - 3600000).toISOString()
            }
          },
          {
            id: 'event_2',
            event_type: 'click',
            timestamp: new Date(Date.now() - 3550000).toISOString(),
            element_id: 'hero-cta',
            duration: 0.5,
            metadata: { 
              button_text: 'Schedule a Demo',
              element_class: 'btn btn-primary',
              page_url: 'http://localhost:8080/index.html'
            },
            raw_data: {
              session_id: sessionId,
              user_id: 'user_123',
              created_at: new Date(Date.now() - 3550000).toISOString()
            }
          },
          {
            id: 'event_3',
            event_type: 'scroll',
            timestamp: new Date(Date.now() - 3500000).toISOString(),
            duration: 2.3,
            metadata: { 
              scroll_depth: 25,
              page_height: 2400,
              viewport_height: 800
            },
            raw_data: {
              session_id: sessionId,
              user_id: 'user_123',
              created_at: new Date(Date.now() - 3500000).toISOString()
            }
          }
        ]
      };
      
      setSessionData(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === 0) return 'N/A';
    
    if (seconds < 1) {
      return `${Math.round(seconds * 1000)}ms`;
    } else if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else {
      const mins = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return `${mins}m ${secs}s`;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return eventTime.toLocaleDateString();
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Tablet className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      'page_view': 'bg-blue-100 text-blue-800',
      'click': 'bg-green-100 text-green-800',
      'scroll': 'bg-purple-100 text-purple-800',
      'hover': 'bg-yellow-100 text-yellow-800',
      'form_interaction': 'bg-orange-100 text-orange-800',
      'mouse_movement': 'bg-gray-100 text-gray-800'
    };
    return colors[eventType] || 'bg-gray-100 text-gray-800';
  };

  const toggleRawData = (eventId: string) => {
    setShowRawData(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const exportSessionData = () => {
    if (!sessionData) return;
    
    const dataStr = JSON.stringify(sessionData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-${sessionData.tracking_id}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredEvents = sessionData?.events.filter(event => {
    if (timelineFilter === 'all') return true;
    return event.event_type === timelineFilter;
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading session details...</span>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error Loading Session</h3>
          <p className="text-red-600 mt-1">{error || 'Session not found'}</p>
          <button
            onClick={() => navigate('/admin')}
            className="mt-3 text-red-600 hover:text-red-800 underline"
          >
            ← Back to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Activity className="mr-3 text-blue-600" />
                Session Details
              </h1>
              <p className="text-gray-600 mt-1">
                {sessionData.tracking_id} • {sessionData.is_active ? 'Active' : 'Completed'}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportSessionData}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </button>
            <a
              href={sessionData.primary_page_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Page
            </a>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'raw', label: 'Raw Data', icon: Code }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Session Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(sessionData.duration)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Events</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionData.total_events}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <Globe className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pages Visited</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionData.pages_visited.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <MousePointer className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{sessionData.clicks}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Session Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <span className="text-sm text-gray-600">User ID:</span>
                    <span className="ml-2 font-medium">{sessionData.user_id}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <div>
                    <span className="text-sm text-gray-600">Started:</span>
                    <span className="ml-2 font-medium">
                      {formatTimestamp(sessionData.start_time)}
                    </span>
                  </div>
                </div>
                {sessionData.end_time && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Ended:</span>
                      <span className="ml-2 font-medium">
                        {formatTimestamp(sessionData.end_time)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  {getDeviceIcon(sessionData.device_type)}
                  <div className="ml-3">
                    <span className="text-sm text-gray-600">Device:</span>
                    <span className="ml-2 font-medium capitalize">
                      {sessionData.device_type} • {sessionData.browser}
                    </span>
                  </div>
                </div>
                {sessionData.location && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Location:</span>
                      <span className="ml-2 font-medium">{sessionData.location}</span>
                    </div>
                  </div>
                )}
                {sessionData.source && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-gray-400 mr-3" />
                    <div>
                      <span className="text-sm text-gray-600">Source:</span>
                      <span className="ml-2 font-medium">{sessionData.source}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Primary Page:</span>
                  <p className="font-medium text-gray-900 mt-1">{sessionData.primary_page_title}</p>
                  <p className="text-sm text-gray-500 break-all">{sessionData.primary_page_url}</p>
                </div>
                {sessionData.referrer && (
                  <div>
                    <span className="text-sm text-gray-600">Referrer:</span>
                    <p className="text-sm text-gray-900 mt-1 break-all">{sessionData.referrer}</p>
                  </div>
                )}
                <div>
                  <span className="text-sm text-gray-600">Pages Visited ({sessionData.pages_visited.length}):</span>
                  <div className="mt-2 space-y-1">
                    {sessionData.pages_visited.map((page, index) => (
                      <div key={index} className="text-sm text-gray-700 break-all bg-gray-50 p-2 rounded">
                        {page}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(sessionData.event_breakdown).map(([eventType, count]) => (
                <div key={eventType} className="text-center">
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(eventType)}`}>
                    {eventType.replace('_', ' ')}
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Timeline Filter */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filter events:</span>
              <select
                value={timelineFilter}
                onChange={(e) => setTimelineFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Events ({sessionData.events.length})</option>
                {Object.entries(sessionData.event_breakdown).map(([eventType, count]) => (
                  <option key={eventType} value={eventType}>
                    {eventType.replace('_', ' ')} ({count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Event Timeline ({filteredEvents.length} events)
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredEvents.map((event, index) => (
                <div key={event.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.event_type).includes('blue') ? 'bg-blue-500' : 
                      getEventTypeColor(event.event_type).includes('green') ? 'bg-green-500' :
                      getEventTypeColor(event.event_type).includes('purple') ? 'bg-purple-500' :
                      getEventTypeColor(event.event_type).includes('yellow') ? 'bg-yellow-500' :
                      getEventTypeColor(event.event_type).includes('orange') ? 'bg-orange-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type.replace('_', ' ')}
                        </span>
                        {event.element_id && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{event.element_id}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(event.timestamp)}
                      </span>
                    </div>
                    
                    {event.duration && (
                      <p className="text-sm text-gray-600 mt-1">
                        Duration: {formatDuration(event.duration)}
                      </p>
                    )}
                    
                    {event.metadata && Object.keys(event.metadata).length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => toggleRawData(event.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          {showRawData[event.id] ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                          {showRawData[event.id] ? 'Hide' : 'Show'} Details
                        </button>
                        {showRawData[event.id] && (
                          <pre className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Time on Elements */}
          {Object.keys(sessionData.time_on_elements).length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Spent on Elements</h3>
              <div className="space-y-3">
                {Object.entries(sessionData.time_on_elements)
                  .sort(([,a], [,b]) => b - a)
                  .map(([elementId, time]) => (
                    <div key={elementId} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">#{elementId}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (time / Math.max(...Object.values(sessionData.time_on_elements))) * 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 w-16 text-right">
                          {formatDuration(time)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Event Distribution Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {Object.entries(sessionData.event_breakdown).map(([eventType, count]) => (
                  <div key={eventType} className="flex items-center justify-between">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(eventType)}`}>
                      {eventType.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ 
                            width: `${(count / sessionData.total_events) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900">{sessionData.total_events}</div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raw Data Tab */}
      {activeTab === 'raw' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Complete Session Data</h3>
              <button
                onClick={exportSessionData}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Export JSON
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded-lg text-xs overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetails; 