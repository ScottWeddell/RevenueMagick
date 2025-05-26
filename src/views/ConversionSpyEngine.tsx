import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NeuralGlyph from '../components/NeuralGlyph';
import ReadinessScore from '../components/ReadinessScore';
import IntelligenceModule from '../components/IntelligenceModule';
import { getFallbackData, isProduction } from '../utils/fallbackData';

// Types for Digital Body Language™ data
interface DigitalBodyLanguageSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  source: string;
  device_type: string;
  browser: string;
  readiness_score: number;
  behavioral_signals: {
    scroll_velocity: number;
    cta_hover_time: number;
    form_interactions: number;
    hesitation_loops: number;
    page_revisits: number;
    click_cadence: number;
    viewport_engagement: number;
  };
  conversion_probability: number;
  neuromind_profile: string;
}

interface BehavioralInsight {
  type: 'opportunity' | 'warning' | 'success';
  title: string;
  description: string;
  user_count: number;
  action_items: string[];
}

const ConversionSpyEngine: React.FC = () => {
  const [sessions, setSessions] = useState<DigitalBodyLanguageSession[]>([]);
  const [insights, setInsights] = useState<BehavioralInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // If in production/deployed environment, use fallback data immediately
      if (isProduction()) {
        console.log('Production environment detected - using fallback conversion spy engine data');
        const spyData = getFallbackData('conversionSpyEngine') as any;
        
        if (spyData) {
          setSessions(spyData.sessions);
          setInsights(spyData.insights);
          setError('Demo Mode - Using sample data');
        }
        setIsLoading(false);
        return;
      }
      
      try {
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        setSessions([
          {
            id: 'session-001',
            user_id: 'user-001',
            start_time: new Date(Date.now() - 3600000).toISOString(),
            end_time: new Date(Date.now() - 3000000).toISOString(),
            source: 'Google Ads',
            device_type: 'Desktop',
            browser: 'Chrome',
            readiness_score: 85,
            behavioral_signals: {
              scroll_velocity: 0.8,
              cta_hover_time: 3.2,
              form_interactions: 2,
              hesitation_loops: 1,
              page_revisits: 3,
              click_cadence: 1.5,
              viewport_engagement: 0.9
            },
            conversion_probability: 0.78,
            neuromind_profile: 'Fast-Mover'
          },
          {
            id: 'session-002',
            user_id: 'user-002',
            start_time: new Date(Date.now() - 7200000).toISOString(),
            source: 'Facebook Ads',
            device_type: 'Mobile',
            browser: 'Safari',
            readiness_score: 45,
            behavioral_signals: {
              scroll_velocity: 0.3,
              cta_hover_time: 0.8,
              form_interactions: 0,
              hesitation_loops: 5,
              page_revisits: 8,
              click_cadence: 0.4,
              viewport_engagement: 0.4
            },
            conversion_probability: 0.23,
            neuromind_profile: 'Skeptic'
          },
          {
            id: 'session-003',
            user_id: 'user-003',
            start_time: new Date(Date.now() - 1800000).toISOString(),
            source: 'Organic',
            device_type: 'Desktop',
            browser: 'Firefox',
            readiness_score: 72,
            behavioral_signals: {
              scroll_velocity: 0.6,
              cta_hover_time: 2.1,
              form_interactions: 1,
              hesitation_loops: 2,
              page_revisits: 2,
              click_cadence: 1.2,
              viewport_engagement: 0.7
            },
            conversion_probability: 0.65,
            neuromind_profile: 'Proof-Driven'
          }
        ]);

        setInsights([
          {
            type: 'opportunity',
            title: 'High-Intent Users Not Converting',
            description: '23 users with readiness scores >80 have been active for >10 minutes without converting',
            user_count: 23,
            action_items: [
              'Deploy urgency-based exit-intent popup',
              'Trigger live chat for high-readiness users',
              'Show limited-time offer to Fast-Mover profiles'
            ]
          },
          {
            type: 'warning',
            title: 'High Hesitation Loop Activity',
            description: 'Skeptic profiles showing 3x normal hesitation patterns on pricing page',
            user_count: 47,
            action_items: [
              'Add more social proof elements',
              'Include money-back guarantee prominently',
              'Show competitor comparison table'
            ]
          },
          {
            type: 'success',
            title: 'Optimal Scroll Velocity Detected',
            description: 'Users with 0.6-0.8 scroll velocity converting at 2.3x higher rate',
            user_count: 156,
            action_items: [
              'Optimize content length for this velocity',
              'A/B test content density',
              'Implement scroll-triggered CTAs'
            ]
          }
        ]);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch conversion spy engine data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Digital Body Language™ data');
        
        // Fallback to comprehensive fallback data on error
        const spyData = getFallbackData('conversionSpyEngine') as any;
        
        if (spyData) {
          setSessions(spyData.sessions);
          setInsights(spyData.insights);
        }
        
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeFilter]);

  const getSignalIntensity = (value: number, max: number = 1) => {
    const intensity = value / max;
    if (intensity >= 0.7) return 'high';
    if (intensity >= 0.4) return 'medium';
    return 'low';
  };

  const getSignalColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center">
          <NeuralGlyph size={48} animated variant="complex" />
          <p className="mt-4 text-gray-600">Analyzing Digital Body Language™...</p>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-header-title">
            <svg className="w-8 h-8 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Conversion Spy Engine™
          </h1>
          <p className="page-header-description">
            Real-time Digital Body Language™ analysis and behavioral intelligence
          </p>
        </div>
        <div className="page-header-actions">
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value as any)}
            className="btn-secondary select-mobile"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button className="btn-primary">
            Export Insights
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-grid">
        <IntelligenceModule
          title="Active Sessions"
          value={sessions.filter(s => !s.end_time).length}
          trend={{ direction: 'up', percentage: 15.3, period: 'last hour' }}
          description="Users currently being tracked"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Avg Readiness Score"
          value={Math.round(sessions.reduce((sum, s) => sum + s.readiness_score, 0) / sessions.length)}
          trend={{ direction: 'up', percentage: 8.7, period: 'last 24h' }}
          description="Overall conversion readiness"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="High-Intent Users"
          value={sessions.filter(s => s.readiness_score >= 80).length}
          trend={{ direction: 'up', percentage: 23.1, period: 'last hour' }}
          description="Users ready to convert"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Conversion Probability"
          value={`${Math.round(sessions.reduce((sum, s) => sum + s.conversion_probability, 0) / sessions.length * 100)}%`}
          trend={{ direction: 'up', percentage: 12.4, period: 'last 24h' }}
          description="AI-predicted conversion likelihood"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
      </div>

      {/* Behavioral Insights */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <NeuralGlyph size={20} animated />
            Real-Time Behavioral Insights
          </h3>
        </div>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              insight.type === 'opportunity' ? 'bg-blue-50 border-blue-200' :
              insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      insight.type === 'opportunity' ? 'bg-blue-500' :
                      insight.type === 'warning' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    <span className="text-sm text-gray-500">({insight.user_count} users)</span>
                  </div>
                  <p className="text-gray-700 text-sm mb-3">{insight.description}</p>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-gray-600">Recommended Actions:</div>
                    {insight.action_items.map((action, actionIndex) => (
                      <div key={actionIndex} className="text-xs text-gray-600 flex items-center gap-2">
                        <span>•</span>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="btn-secondary text-xs">
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Sessions Table */}
      <div className="intelligence-card">
        <div className="intelligence-card-header">
          <h3 className="intelligence-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Live Digital Body Language™ Sessions
          </h3>
          <span className="text-sm text-gray-500">{sessions.length} sessions tracked</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User & Profile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Readiness Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key Signals
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source & Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session) => {
                const duration = session.end_time 
                  ? Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000)
                  : Math.round((Date.now() - new Date(session.start_time).getTime()) / 60000);
                
                return (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Link 
                          to={`/user/${session.user_id}`}
                          className="text-sm font-medium text-brand-blue hover:text-brand-indigo"
                        >
                          {session.user_id.substring(0, 8)}...
                        </Link>
                        <div className="text-xs text-gray-500">{session.neuromind_profile}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ReadinessScore score={session.readiness_score} size="sm" showLabel={false} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        <span className={`px-2 py-1 text-xs rounded ${getSignalColor(getSignalIntensity(session.behavioral_signals.scroll_velocity))}`}>
                          Scroll: {session.behavioral_signals.scroll_velocity.toFixed(1)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${getSignalColor(getSignalIntensity(session.behavioral_signals.cta_hover_time, 5))}`}>
                          CTA: {session.behavioral_signals.cta_hover_time.toFixed(1)}s
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{session.source}</div>
                      <div className="text-xs text-gray-500">{session.device_type} • {session.browser}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {duration}m {!session.end_time && <span className="text-green-600">• Live</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="btn-ghost text-xs mr-2">
                        View Details
                      </button>
                      {session.readiness_score >= 80 && (
                        <button className="btn-primary text-xs">
                          Engage Now
                        </button>
                      )}
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

export default ConversionSpyEngine; 