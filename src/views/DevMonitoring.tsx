import React, { useState, useEffect } from 'react';
import NeuralGlyph from '../components/NeuralGlyph';
import IntelligenceModule from '../components/IntelligenceModule';
import { getFallbackData, isProduction } from '../utils/fallbackData';

// Types for Development Monitoring data
interface ServiceStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  uptime: number;
  response_time: number;
  last_check: string;
  error_count: number;
  endpoint?: string;
  version?: string;
}

interface DatabaseMetrics {
  connection_pool: {
    active: number;
    idle: number;
    max: number;
  };
  query_performance: {
    avg_query_time: number;
    slow_queries: number;
    total_queries: number;
  };
  storage: {
    size_mb: number;
    growth_rate: number;
    free_space_mb: number;
  };
  replication: {
    lag_ms: number;
    status: 'synced' | 'lagging' | 'error';
  };
}

interface ExternalAPIStatus {
  provider: string;
  service: string;
  status: 'connected' | 'rate_limited' | 'error' | 'maintenance';
  last_sync: string;
  sync_frequency: string;
  rate_limit: {
    used: number;
    limit: number;
    reset_time: string;
  };
  error_rate: number;
  avg_response_time: number;
}

interface InternalAPIMetrics {
  endpoint: string;
  method: string;
  requests_per_minute: number;
  avg_response_time: number;
  error_rate: number;
  status_codes: {
    '200': number;
    '400': number;
    '401': number;
    '403': number;
    '404': number;
    '500': number;
  };
  cache_hit_rate?: number;
}

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_io: {
    bytes_in: number;
    bytes_out: number;
  };
  active_connections: number;
  queue_depth: number;
}

interface DataFlowMetrics {
  pipeline: string;
  status: 'running' | 'paused' | 'error' | 'completed';
  records_processed: number;
  processing_rate: number;
  error_count: number;
  last_run: string;
  next_run?: string;
  duration_ms: number;
}

const DevMonitoring: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [database, setDatabase] = useState<DatabaseMetrics | null>(null);
  const [externalAPIs, setExternalAPIs] = useState<ExternalAPIStatus[]>([]);
  const [internalAPIs, setInternalAPIs] = useState<InternalAPIMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [dataFlows, setDataFlows] = useState<DataFlowMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000);
  const [autoRefresh, setAutoRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // If in production/deployed environment, use fallback data immediately
      if (isProduction()) {
        console.log('Production environment detected - using fallback dev monitoring data');
        const monitoringData = getFallbackData('devMonitoring') as any;
        
        if (monitoringData) {
          setServices(monitoringData.services);
          setDatabase(monitoringData.database);
          setExternalAPIs(monitoringData.externalAPIs);
          setInternalAPIs([]);
          setSystemMetrics(monitoringData.systemMetrics);
          setDataFlows([]);
          setError('Demo Mode - Using sample data');
        }
        setIsLoading(false);
        return;
      }
      
      try {
        // Simulate API call - replace with actual monitoring API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for development monitoring
        setServices([
          {
            name: 'FastAPI Backend',
            status: 'healthy',
            uptime: 99.8,
            response_time: 45,
            last_check: new Date().toISOString(),
            error_count: 2,
            endpoint: 'http://localhost:8000',
            version: '1.0.0'
          },
          {
            name: 'React Frontend',
            status: 'healthy',
            uptime: 100,
            response_time: 12,
            last_check: new Date().toISOString(),
            error_count: 0,
            endpoint: 'http://localhost:3000',
            version: '1.0.0'
          },
          {
            name: 'Mock API Server',
            status: 'healthy',
            uptime: 98.5,
            response_time: 78,
            last_check: new Date().toISOString(),
            error_count: 5,
            endpoint: 'http://localhost:3001',
            version: '1.0.0'
          },
          {
            name: 'Redis Cache',
            status: 'warning',
            uptime: 97.2,
            response_time: 156,
            last_check: new Date().toISOString(),
            error_count: 12,
            endpoint: 'redis://localhost:6379'
          },
          {
            name: 'PostgreSQL',
            status: 'healthy',
            uptime: 99.9,
            response_time: 23,
            last_check: new Date().toISOString(),
            error_count: 1,
            endpoint: 'postgresql://localhost:5432'
          }
        ]);

        setDatabase({
          connection_pool: {
            active: 8,
            idle: 12,
            max: 20
          },
          query_performance: {
            avg_query_time: 23.5,
            slow_queries: 3,
            total_queries: 1247
          },
          storage: {
            size_mb: 156.7,
            growth_rate: 2.3,
            free_space_mb: 8843.3
          },
          replication: {
            lag_ms: 45,
            status: 'synced'
          }
        });

        setExternalAPIs([
          {
            provider: 'Facebook',
            service: 'Marketing API',
            status: 'connected',
            last_sync: new Date(Date.now() - 300000).toISOString(),
            sync_frequency: '5 minutes',
            rate_limit: {
              used: 1247,
              limit: 5000,
              reset_time: new Date(Date.now() + 3600000).toISOString()
            },
            error_rate: 0.02,
            avg_response_time: 234
          },
          {
            provider: 'Google',
            service: 'Ads API',
            status: 'rate_limited',
            last_sync: new Date(Date.now() - 900000).toISOString(),
            sync_frequency: '10 minutes',
            rate_limit: {
              used: 9800,
              limit: 10000,
              reset_time: new Date(Date.now() + 1800000).toISOString()
            },
            error_rate: 0.05,
            avg_response_time: 456
          },
          {
            provider: 'HubSpot',
            service: 'CRM API',
            status: 'connected',
            last_sync: new Date(Date.now() - 180000).toISOString(),
            sync_frequency: '3 minutes',
            rate_limit: {
              used: 234,
              limit: 1000,
              reset_time: new Date(Date.now() + 2700000).toISOString()
            },
            error_rate: 0.01,
            avg_response_time: 123
          },
          {
            provider: 'GoHighLevel',
            service: 'CRM API',
            status: 'error',
            last_sync: new Date(Date.now() - 1800000).toISOString(),
            sync_frequency: '15 minutes',
            rate_limit: {
              used: 0,
              limit: 500,
              reset_time: new Date(Date.now() + 3600000).toISOString()
            },
            error_rate: 0.15,
            avg_response_time: 0
          }
        ]);

        setInternalAPIs([
          {
            endpoint: '/api/v1/auth/login',
            method: 'POST',
            requests_per_minute: 23,
            avg_response_time: 45,
            error_rate: 0.02,
            status_codes: { '200': 22, '400': 1, '401': 0, '403': 0, '404': 0, '500': 0 }
          },
          {
            endpoint: '/api/v1/tracking/events',
            method: 'POST',
            requests_per_minute: 156,
            avg_response_time: 12,
            error_rate: 0.01,
            status_codes: { '200': 154, '400': 2, '401': 0, '403': 0, '404': 0, '500': 0 },
            cache_hit_rate: 0.78
          },
          {
            endpoint: '/api/v1/analytics/dashboard',
            method: 'GET',
            requests_per_minute: 45,
            avg_response_time: 89,
            error_rate: 0.04,
            status_codes: { '200': 43, '400': 0, '401': 1, '403': 0, '404': 0, '500': 1 },
            cache_hit_rate: 0.92
          },
          {
            endpoint: '/api/v1/integrations/sync',
            method: 'POST',
            requests_per_minute: 8,
            avg_response_time: 234,
            error_rate: 0.12,
            status_codes: { '200': 7, '400': 0, '401': 0, '403': 0, '404': 0, '500': 1 }
          }
        ]);

        setSystemMetrics({
          cpu_usage: 34.5,
          memory_usage: 67.8,
          disk_usage: 23.4,
          network_io: {
            bytes_in: 1247890,
            bytes_out: 2345678
          },
          active_connections: 156,
          queue_depth: 23
        });

        setDataFlows([
          {
            pipeline: 'Facebook Ads Sync',
            status: 'running',
            records_processed: 1247,
            processing_rate: 45.6,
            error_count: 2,
            last_run: new Date(Date.now() - 300000).toISOString(),
            next_run: new Date(Date.now() + 300000).toISOString(),
            duration_ms: 12340
          },
          {
            pipeline: 'Google Ads Sync',
            status: 'paused',
            records_processed: 0,
            processing_rate: 0,
            error_count: 5,
            last_run: new Date(Date.now() - 900000).toISOString(),
            next_run: new Date(Date.now() + 600000).toISOString(),
            duration_ms: 0
          },
          {
            pipeline: 'HubSpot Contact Sync',
            status: 'completed',
            records_processed: 567,
            processing_rate: 23.4,
            error_count: 0,
            last_run: new Date(Date.now() - 180000).toISOString(),
            next_run: new Date(Date.now() + 180000).toISOString(),
            duration_ms: 8900
          },
          {
            pipeline: 'Behavioral Data Processing',
            status: 'running',
            records_processed: 2345,
            processing_rate: 156.7,
            error_count: 1,
            last_run: new Date(Date.now() - 60000).toISOString(),
            duration_ms: 45000
          }
        ]);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch dev monitoring data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load monitoring data');
        
        // Fallback to comprehensive fallback data on error
        const monitoringData = getFallbackData('devMonitoring') as any;
        
        if (monitoringData) {
          setServices(monitoringData.services);
          setDatabase(monitoringData.database);
          setExternalAPIs(monitoringData.externalAPIs);
          setInternalAPIs([]);
          setSystemMetrics(monitoringData.systemMetrics);
          setDataFlows([]);
        }
        
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up auto-refresh
    let interval: number;
    if (autoRefresh) {
      interval = window.setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshInterval, autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'running':
      case 'completed':
      case 'synced':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'rate_limited':
      case 'paused':
      case 'lagging':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'maintenance':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'connected':
      case 'running':
      case 'completed':
      case 'synced':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
      case 'rate_limited':
      case 'paused':
      case 'lagging':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
      case 'maintenance':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <NeuralGlyph size={48} animated variant="complex" />
          <p className="mt-4 text-gray-600">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error && !error.includes('Demo Mode')) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const healthyServices = services.filter(s => s.status === 'healthy').length;
  const totalServices = services.length;
  const avgResponseTime = services.reduce((sum, s) => sum + s.response_time, 0) / services.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-header-title">
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Development Monitoring
          </h1>
          <p className="page-header-description">
            Real-time technical monitoring and system health dashboard
            {error && error.includes('Demo Mode') && (
              <span className="ml-2 text-blue-600 font-medium">🎯 Demo Mode - Showcasing Revenue Magick capabilities</span>
            )}
          </p>
        </div>
        <div className="page-header-actions">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Auto-refresh:</label>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-10 h-6 rounded-full transition-colors ${
                autoRefresh ? 'bg-brand-blue' : 'bg-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                autoRefresh ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <select 
            value={refreshInterval} 
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="btn-secondary select-mobile"
          >
            <option value={1000}>1s</option>
            <option value={5000}>5s</option>
            <option value={10000}>10s</option>
            <option value={30000}>30s</option>
          </select>
          <button className="btn-primary">
            Export Logs
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="dashboard-grid">
        <IntelligenceModule
          title="Service Health"
          value={`${healthyServices}/${totalServices}`}
          trend={{ 
            direction: healthyServices === totalServices ? 'up' : 'down', 
            percentage: (healthyServices / totalServices) * 100, 
            period: 'current' 
          }}
          description="Services operational"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Avg Response Time"
          value={`${avgResponseTime.toFixed(0)}ms`}
          description="Across all services"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="CPU Usage"
          value={`${systemMetrics?.cpu_usage.toFixed(1)}%`}
          description="System CPU utilization"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Memory Usage"
          value={`${systemMetrics?.memory_usage.toFixed(1)}%`}
          description="System memory utilization"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          }
        />
      </div>

      {/* Service Status */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            Service Status
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.name} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(service.status)}`}>
                    {service.status}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="font-medium">{service.uptime}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Response:</span>
                  <span className="font-medium">{service.response_time}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Errors:</span>
                  <span className="font-medium">{service.error_count}</span>
                </div>
                {service.endpoint && (
                  <div className="text-xs text-gray-400 truncate">
                    {service.endpoint}
                  </div>
                )}
                {service.version && (
                  <div className="text-xs text-gray-400">
                    v{service.version}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Database Metrics */}
      {database && (
        <div className="intelligence-card">
          <div className="intelligence-card-header">
            <h3 className="intelligence-title">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Database Metrics
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Connection Pool</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-medium">{database.connection_pool.active}</span>
                </div>
                <div className="flex justify-between">
                  <span>Idle:</span>
                  <span className="font-medium">{database.connection_pool.idle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max:</span>
                  <span className="font-medium">{database.connection_pool.max}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-brand-blue h-2 rounded-full"
                    style={{ 
                      width: `${((database.connection_pool.active + database.connection_pool.idle) / database.connection_pool.max) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Query Performance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Avg Time:</span>
                  <span className="font-medium">{database.query_performance.avg_query_time}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Slow Queries:</span>
                  <span className="font-medium">{database.query_performance.slow_queries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">{database.query_performance.total_queries}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Storage</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="font-medium">{database.storage.size_mb.toFixed(1)} MB</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth:</span>
                  <span className="font-medium">{database.storage.growth_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Free:</span>
                  <span className="font-medium">{(database.storage.free_space_mb / 1024).toFixed(1)} GB</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Replication</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`px-2 py-1 text-xs rounded ${getStatusColor(database.replication.status)}`}>
                    {database.replication.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lag:</span>
                  <span className="font-medium">{database.replication.lag_ms}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* External API Status */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            External API Status
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Sync
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {externalAPIs.map((api, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{api.provider}</div>
                      <div className="text-sm text-gray-500">{api.service}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(api.status)}
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(api.status)}`}>
                        {api.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex justify-between w-24 mb-1">
                        <span>{api.rate_limit.used}</span>
                        <span>{api.rate_limit.limit}</span>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            (api.rate_limit.used / api.rate_limit.limit) > 0.8 ? 'bg-red-500' :
                            (api.rate_limit.used / api.rate_limit.limit) > 0.6 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(api.rate_limit.used / api.rate_limit.limit) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>Response: {api.avg_response_time}ms</div>
                    <div>Error Rate: {(api.error_rate * 100).toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(api.last_sync).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Internal API Metrics */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Internal API Metrics
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Traffic
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Codes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cache
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {internalAPIs.map((api, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{api.endpoint}</div>
                      <div className="text-sm text-gray-500">{api.method}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>{api.requests_per_minute} req/min</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>Avg: {api.avg_response_time}ms</div>
                    <div>Error: {(api.error_rate * 100).toFixed(1)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-1 text-xs">
                      <span className="px-1 py-0.5 bg-green-100 text-green-800 rounded">
                        2xx: {api.status_codes['200']}
                      </span>
                      {(api.status_codes['400'] + api.status_codes['401'] + api.status_codes['403'] + api.status_codes['404']) > 0 && (
                        <span className="px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded">
                          4xx: {api.status_codes['400'] + api.status_codes['401'] + api.status_codes['403'] + api.status_codes['404']}
                        </span>
                      )}
                      {api.status_codes['500'] > 0 && (
                        <span className="px-1 py-0.5 bg-red-100 text-red-800 rounded">
                          5xx: {api.status_codes['500']}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {api.cache_hit_rate ? `${(api.cache_hit_rate * 100).toFixed(0)}%` : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Flow Pipelines */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Data Flow Pipelines
          </h3>
        </div>
        
        <div className="space-y-4">
          {dataFlows.map((flow, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-semibold text-gray-900">{flow.pipeline}</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(flow.status)}
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(flow.status)}`}>
                      {flow.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-brand-blue">
                    {flow.records_processed.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">records</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Processing Rate</div>
                  <div className="font-medium">{flow.processing_rate.toFixed(1)} rec/s</div>
                </div>
                <div>
                  <div className="text-gray-500">Errors</div>
                  <div className="font-medium">{flow.error_count}</div>
                </div>
                <div>
                  <div className="text-gray-500">Duration</div>
                  <div className="font-medium">{formatDuration(flow.duration_ms)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Last Run</div>
                  <div className="font-medium">{new Date(flow.last_run).toLocaleTimeString()}</div>
                </div>
              </div>
              
              {flow.next_run && (
                <div className="mt-2 text-xs text-gray-500">
                  Next run: {new Date(flow.next_run).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Resources */}
      {systemMetrics && (
        <div className="intelligence-card">
          <div className="intelligence-card-header">
            <h3 className="intelligence-title">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              System Resources
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">CPU & Memory</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU Usage</span>
                    <span className="font-medium">{systemMetrics.cpu_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        systemMetrics.cpu_usage > 80 ? 'bg-red-500' :
                        systemMetrics.cpu_usage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${systemMetrics.cpu_usage}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memory Usage</span>
                    <span className="font-medium">{systemMetrics.memory_usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        systemMetrics.memory_usage > 80 ? 'bg-red-500' :
                        systemMetrics.memory_usage > 60 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${systemMetrics.memory_usage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Network I/O</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Bytes In:</span>
                  <span className="font-medium">{formatBytes(systemMetrics.network_io.bytes_in)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bytes Out:</span>
                  <span className="font-medium">{formatBytes(systemMetrics.network_io.bytes_out)}</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Connections</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Active:</span>
                  <span className="font-medium">{systemMetrics.active_connections}</span>
                </div>
                <div className="flex justify-between">
                  <span>Queue Depth:</span>
                  <span className="font-medium">{systemMetrics.queue_depth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Disk Usage:</span>
                  <span className="font-medium">{systemMetrics.disk_usage.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevMonitoring; 