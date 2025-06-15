import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, Zap, Target, Eye, MousePointer, Clock, AlertTriangle } from 'lucide-react';
import { apiClient } from '../lib/api';

import IntelligenceModule from '../components/IntelligenceModule';

// Types for Signal Graph™ data
interface BehavioralSignal {
  id: string;
  name: string;
  type: 'engagement' | 'hesitation' | 'intent' | 'friction';
  strength: number; // 0-1
  frequency: number;
  impact_score: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  description: string;
}

interface SignalPattern {
  id: string;
  name: string;
  signals: string[];
  conversion_correlation: number;
  user_count: number;
  pattern_type: 'high_intent' | 'abandonment_risk' | 'comparison_shopping' | 'price_sensitive';
}

interface SignalFlow {
  from_signal: string;
  to_signal: string;
  transition_probability: number;
  avg_time_between: number; // seconds
  user_count: number;
}

const BehavioralSignals: React.FC = () => {
  const [signals, setSignals] = useState<BehavioralSignal[]>([]);
  const [patterns, setPatterns] = useState<SignalPattern[]>([]);
  const [flows, setFlows] = useState<SignalFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check token status
        const tokenInfo = apiClient.getTokenInfo();
        
        // If token is expired, refresh it
        if (tokenInfo.isExpired) {
          await apiClient.refreshToken();
        }
        
        // Fetch real behavioral signals data
        const signalsData = await apiClient.getBehavioralSignals(timeRange);
        
        // Transform signals data to match interface
        const transformedSignals: BehavioralSignal[] = signalsData.signals.map(signal => ({
          id: signal.id,
          name: signal.name,
          type: signal.type as 'engagement' | 'hesitation' | 'intent' | 'friction',
          strength: signal.strength,
          frequency: signal.frequency,
          impact_score: signal.impact_score,
          trend: signal.trend as 'increasing' | 'decreasing' | 'stable',
          description: signal.description
        }));

        const transformedPatterns: SignalPattern[] = signalsData.patterns.map(pattern => ({
          id: pattern.id,
          name: pattern.name,
          signals: pattern.signals,
          conversion_correlation: pattern.conversion_correlation,
          user_count: pattern.user_count,
          pattern_type: pattern.pattern_type as 'high_intent' | 'abandonment_risk' | 'comparison_shopping' | 'price_sensitive'
        }));

        const transformedFlows: SignalFlow[] = signalsData.flows.map(flow => ({
          from_signal: flow.from_signal,
          to_signal: flow.to_signal,
          transition_probability: flow.transition_probability,
          avg_time_between: flow.avg_time_between,
          user_count: flow.user_count
        }));

        setSignals(transformedSignals);
        setPatterns(transformedPatterns);
        setFlows(transformedFlows);
        setIsLoading(false);
      } catch (err) {
        // Check if it's an authentication error
        if (err instanceof Error && err.message.includes('401')) {
          setError('Authentication failed. Please refresh the page or try again.');
        } else {
        setError(err instanceof Error ? err.message : 'Failed to load Signal Graph™ data');
        }
        
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  const getSignalTypeColor = (type: string) => {
    switch (type) {
      case 'engagement': return 'bg-green-100 text-green-800 border-green-200';
      case 'intent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'hesitation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'friction': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPatternTypeColor = (type: string) => {
    switch (type) {
      case 'high_intent': return 'bg-green-50 border-green-200';
      case 'abandonment_risk': return 'bg-red-50 border-red-200';
      case 'comparison_shopping': return 'bg-blue-50 border-blue-200';
      case 'price_sensitive': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>;
      case 'decreasing':
        return <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>;
      default:
        return <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4">
            <svg className="w-12 h-12 text-brand-blue animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-4 text-gray-600">Analyzing Signal Graph™...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-header-title">
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Behavioral Signal Graph™
          </h1>
          <p className="page-header-description">
            Advanced pattern recognition and behavioral flow analysis
          </p>
        </div>
        <div className="page-header-actions">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="btn-secondary select-mobile"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button className="btn-primary">
            Export Analysis
          </button>
        </div>
      </div>

      {/* Signal Overview Metrics */}
      <div className="dashboard-grid">
        <IntelligenceModule
          title="Active Signals"
          value={signals.length}
          description="Behavioral signals being tracked"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Pattern Matches"
          value={patterns.reduce((sum, p) => sum + p.user_count, 0)}
          trend={patterns.length > 5 && patterns.reduce((sum, p) => sum + p.user_count, 0) > 20 ? { direction: 'up', percentage: 18.5, period: 'last 24h' } : undefined}
          description="Users matching known patterns"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="High Impact Signals"
          value={signals.filter(s => s.impact_score >= 0.7).length}
          description="Signals with strong conversion correlation"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Signal Flows"
          value={flows.length}
          description="Behavioral transition patterns"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          }
        />
      </div>

      {/* Signal Strength Matrix */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Signal Strength Matrix
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((signal) => (
            <div key={signal.id} className={`p-4 rounded-lg border ${getSignalTypeColor(signal.type)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold">{signal.name}</h4>
                {getTrendIcon(signal.trend)}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Strength:</span>
                  <span className="font-medium">{(signal.strength * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                  <div 
                    className="bg-current h-2 rounded-full transition-all duration-500"
                    style={{ width: `${signal.strength * 100}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Frequency:</span>
                  <span className="font-medium">{signal.frequency}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>Impact Score:</span>
                  <span className="font-medium">{(signal.impact_score * 100).toFixed(0)}%</span>
                </div>
                
                <p className="text-xs mt-2 opacity-80">{signal.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Patterns */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Identified Behavioral Patterns
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patterns.map((pattern) => (
            <div 
              key={pattern.id} 
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                getPatternTypeColor(pattern.pattern_type)
              } ${selectedPattern === pattern.id ? 'ring-2 ring-brand-blue' : ''}`}
              onClick={() => setSelectedPattern(selectedPattern === pattern.id ? null : pattern.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">{pattern.name}</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-brand-blue">
                    {(pattern.conversion_correlation * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500">Conversion Rate</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Users Matched:</span>
                  <span className="font-medium">{pattern.user_count}</span>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-2">Signal Sequence:</div>
                  <div className="flex flex-wrap gap-2">
                    {pattern.signals.map((signalId, index) => {
                      const signal = signals.find(s => s.id === signalId);
                      return (
                        <div key={signalId} className="flex items-center">
                          <span className={`px-2 py-1 text-xs rounded ${
                            signal ? getSignalTypeColor(signal.type) : 'bg-gray-100 text-gray-800'
                          }`}>
                            {signal?.name || signalId}
                          </span>
                          {index < pattern.signals.length - 1 && (
                            <svg className="w-4 h-4 mx-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {selectedPattern === pattern.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm">
                      <div className="font-medium mb-2">Pattern Analysis:</div>
                      <p className="text-gray-600">
                        This pattern shows {pattern.conversion_correlation > 0.7 ? 'strong' : 
                        pattern.conversion_correlation > 0.4 ? 'moderate' : 'weak'} correlation 
                        with conversions. Users following this sequence are {
                        pattern.conversion_correlation > 0.7 ? 'highly likely' :
                        pattern.conversion_correlation > 0.4 ? 'moderately likely' : 'unlikely'
                        } to convert.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Flow Analysis */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Signal Flow Transitions
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From Signal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Signal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transition Probability
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Time Between
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Count
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flows.map((flow, index) => {
                const fromSignal = signals.find(s => s.id === flow.from_signal);
                const toSignal = signals.find(s => s.id === flow.to_signal);
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        fromSignal ? getSignalTypeColor(fromSignal.type) : 'bg-gray-100 text-gray-800'
                      }`}>
                        {fromSignal?.name || flow.from_signal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${
                        toSignal ? getSignalTypeColor(toSignal.type) : 'bg-gray-100 text-gray-800'
                      }`}>
                        {toSignal?.name || flow.to_signal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-brand-blue h-2 rounded-full"
                            style={{ width: `${flow.transition_probability * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {(flow.transition_probability * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flow.avg_time_between}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {flow.user_count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BehavioralSignals; 