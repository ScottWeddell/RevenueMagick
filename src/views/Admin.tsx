import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Users, 
  Globe, 
  Clock, 
  MousePointer, 
  Eye, 
  BarChart3, 
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  ExternalLink,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SessionData {
  id: string;
  user_id: string;
  tracking_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  page_url: string;
  page_title?: string;
  referrer?: string;
  device_type?: string;
  browser?: string;
  location?: string;
  events_count: number;
  last_activity: string;
  is_active: boolean;
  events: EventData[];
}

interface EventData {
  id: string;
  event_type: string;
  timestamp: string;
  element_id?: string;
  duration?: number;
  metadata: any;
}

interface DashboardStats {
  total_sessions: number;
  active_sessions: number;
  total_events: number;
  avg_session_duration: number;
  top_pages: Array<{ url: string; sessions: number }>;
  device_breakdown: Array<{ device: string; count: number }>;
}

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

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

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      
      // Fetch sessions and stats in parallel
      const [sessionsResponse, statsResponse] = await Promise.all([
        apiRequest<{ sessions: SessionData[] }>('/tracking/admin/sessions', {
          method: 'GET'
        }),
        apiRequest<DashboardStats>('/tracking/admin/stats', {
          method: 'GET'
        })
      ]);

      setSessions(sessionsResponse.sessions || []);
      setStats(statsResponse);
    } catch (error) {
      console.error('Failed to fetch session data:', error);
      // Mock data for development
      const mockSessions: SessionData[] = [
        {
          id: 'session_1',
          user_id: 'user_123',
          tracking_id: 'rm_test_user_ecf7d261',
          start_time: new Date(Date.now() - 3600000).toISOString(),
          page_url: 'http://localhost:8080/index.html',
          page_title: 'TechSolutions Pro - Business Software Solutions',
          referrer: 'https://google.com',
          device_type: 'desktop',
          browser: 'Chrome',
          location: 'San Francisco, CA',
          events_count: 15,
          last_activity: new Date(Date.now() - 300000).toISOString(),
          is_active: true,
          events: [
            {
              id: 'event_1',
              event_type: 'page_view',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              metadata: { page_url: 'http://localhost:8080/index.html' }
            },
            {
              id: 'event_2',
              event_type: 'click',
              timestamp: new Date(Date.now() - 3500000).toISOString(),
              element_id: 'hero-cta',
              metadata: { button_text: 'Schedule a Demo' }
            }
          ]
        },
        {
          id: 'session_2',
          user_id: 'user_456',
          tracking_id: 'rm_test_user_ecf7d261',
          start_time: new Date(Date.now() - 7200000).toISOString(),
          end_time: new Date(Date.now() - 1800000).toISOString(),
          duration: 5400,
          page_url: 'http://localhost:8080/test-tracking.html',
          page_title: 'Revenue Magick Tracking Test',
          device_type: 'mobile',
          browser: 'Safari',
          location: 'New York, NY',
          events_count: 8,
          last_activity: new Date(Date.now() - 1800000).toISOString(),
          is_active: false,
          events: []
        }
      ];

      const mockStats: DashboardStats = {
        total_sessions: 25,
        active_sessions: 3,
        total_events: 342,
        avg_session_duration: 4.2,
        top_pages: [
          { url: 'http://localhost:8080/index.html', sessions: 18 },
          { url: 'http://localhost:8080/test-tracking.html', sessions: 7 }
        ],
        device_breakdown: [
          { device: 'desktop', count: 15 },
          { device: 'mobile', count: 8 },
          { device: 'tablet', count: 2 }
        ]
      };

      setSessions(mockSessions);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
    
    // Set up auto-refresh for live data
    const interval = setInterval(fetchSessionData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [timeRange]);

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && session.is_active) ||
      (filterStatus === 'completed' && !session.is_active);
    
    const matchesSearch = searchTerm === '' ||
      session.page_url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading session data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Activity className="mr-3 text-blue-600" />
              Session Tracking Admin
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and analyze all tracked user sessions in real-time
            </p>
          </div>
          <button
            onClick={fetchSessionData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_sessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Activity className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active_sessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_events}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avg_session_duration}m</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by URL, tracking ID, or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sessions</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed Only</option>
            </select>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Session History ({filteredSessions.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {session.tracking_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        User: {session.user_id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(session.start_time).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {session.page_title || 'Untitled'}
                      </div>
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {session.page_url}
                      </div>
                      {session.location && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {session.location}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getDeviceIcon(session.device_type)}
                      <div className="ml-2">
                        <div className="text-sm text-gray-900 capitalize">
                          {session.device_type || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {session.browser || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {session.duration ? formatDuration(session.duration) : 
                     session.is_active ? 'Active' : 'N/A'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BarChart3 className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{session.events_count}</span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      session.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {session.is_active ? 'Active' : 'Completed'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/admin/sessions/${session.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                      <a
                        href={session.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin; 