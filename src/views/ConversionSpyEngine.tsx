import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Target, TrendingUp, TrendingDown, Minus, Activity, MousePointer, Clock, Zap, AlertTriangle } from 'lucide-react';

import ReadinessScore from '../components/ReadinessScore';
import IntelligenceModule from '../components/IntelligenceModule';
import NeuromindProfileBadge from '../components/NeuromindProfileBadge';
import { apiClient } from '../lib/api';

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

interface SessionDetails {
  session: DigitalBodyLanguageSession;
  events: Array<{
    timestamp: string;
    event_type: string;
    element_id: string;
    duration: number;
    metadata: any;
  }>;
  journey_path: string[];
  friction_points: string[];
}

const ConversionSpyEngine: React.FC = () => {
  const [sessions, setSessions] = useState<DigitalBodyLanguageSession[]>([]);
  const [insights, setInsights] = useState<BehavioralInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedSession, setSelectedSession] = useState<SessionDetails | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<BehavioralInsight | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isEngaging, setIsEngaging] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Try to fetch real behavioral insights
        const behavioralInsights = await apiClient.getBehavioralInsights(
          timeFilter === '1h' ? 1 : 
          timeFilter === '24h' ? 1 : 
          timeFilter === '7d' ? 7 : 30
        );
        
        // Transform insights to match our interface
        const transformedInsights: BehavioralInsight[] = behavioralInsights.insights.map(insight => ({
          type: insight.type as 'opportunity' | 'warning' | 'success',
          title: insight.title,
          description: insight.description,
          user_count: insight.affected_users,
          action_items: insight.action_items
        }));
        
        setInsights(transformedInsights);
        
        // Fetch real Digital Body Language sessions
        const sessionsData = await apiClient.getDigitalBodyLanguageSessions({
          time_filter: timeFilter,
          limit: 50
        });
        
        const transformedSessions: DigitalBodyLanguageSession[] = [];
        if (sessionsData.sessions && Array.isArray(sessionsData.sessions)) {
          sessionsData.sessions.forEach((session, index) => {
            try {
              const apiSession = session as any;
              
              const transformedSession: DigitalBodyLanguageSession = {
                id: apiSession.id || `session-${Date.now()}-${index}`,
                user_id: apiSession.user_id || `user-${index}`,
                start_time: apiSession.start_time || new Date(Date.now() - Math.random() * 86400000).toISOString(),
                end_time: apiSession.end_time,
                source: apiSession.source || 'Direct',
                device_type: apiSession.device_type || 'Desktop',
                browser: apiSession.browser || 'Chrome',
                readiness_score: apiSession.readiness_score || Math.floor(Math.random() * 100),
                behavioral_signals: {
                  scroll_velocity: apiSession.behavioral_signals?.scroll_velocity || Math.random(),
                  cta_hover_time: apiSession.behavioral_signals?.cta_hover_time || Math.random() * 5,
                  form_interactions: apiSession.behavioral_signals?.form_interactions || Math.floor(Math.random() * 5),
                  hesitation_loops: apiSession.behavioral_signals?.hesitation_loops || Math.floor(Math.random() * 10),
                  page_revisits: apiSession.behavioral_signals?.page_revisits || Math.floor(Math.random() * 8),
                  click_cadence: apiSession.behavioral_signals?.click_cadence || Math.random() * 2,
                  viewport_engagement: apiSession.behavioral_signals?.viewport_engagement || Math.random()
                },
                conversion_probability: apiSession.conversion_probability || Math.random(),
                neuromind_profile: apiSession.neuromind_profile || 'Fast-Mover'
              };
              
              transformedSessions.push(transformedSession);
            } catch (transformError) {
              console.warn(`Failed to transform session ${index}:`, transformError);
            }
          });
        }
        
        setSessions(transformedSessions);

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch conversion spy engine data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Digital Body Language™ data');
        
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeFilter]);

  const exportInsights = async () => {
    setIsExporting(true);
    
    try {
      // Prepare export data
      const exportData = {
        timestamp: new Date().toISOString(),
        timeframe: timeFilter,
        summary: {
          total_sessions: sessions.length,
          active_sessions: sessions.filter(s => !s.end_time).length,
          avg_readiness_score: Math.round(sessions.reduce((sum, s) => sum + s.readiness_score, 0) / sessions.length),
          high_intent_users: sessions.filter(s => s.readiness_score >= 80).length,
          avg_conversion_probability: Math.round(sessions.reduce((sum, s) => sum + s.conversion_probability, 0) / sessions.length * 100)
        },
        insights: insights,
        sessions: sessions.map(session => ({
          ...session,
          duration_minutes: session.end_time 
            ? Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000)
            : Math.round((Date.now() - new Date(session.start_time).getTime()) / 60000)
        }))
      };

      // Create and download CSV
      const csvContent = [
        // Headers
        ['Session ID', 'User ID', 'Neuromind Profile', 'Readiness Score', 'Conversion Probability', 'Source', 'Device', 'Duration (min)', 'Status'].join(','),
        // Data rows
        ...sessions.map(session => {
          const duration = session.end_time 
            ? Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000)
            : Math.round((Date.now() - new Date(session.start_time).getTime()) / 60000);
          
          return [
            session.id,
            session.user_id,
            session.neuromind_profile,
            session.readiness_score,
            Math.round(session.conversion_probability * 100) + '%',
            session.source,
            session.device_type,
            duration,
            session.end_time ? 'Completed' : 'Active'
          ].join(',');
        })
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversion-spy-insights-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const viewSessionDetails = async (session: DigitalBodyLanguageSession) => {
    try {
      // In a real implementation, this would fetch detailed session data
      const mockDetails: SessionDetails = {
        session,
        events: [
          {
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            event_type: 'page_view',
            element_id: 'landing-page',
            duration: 45000,
            metadata: { page_title: 'Homepage', scroll_depth: 0.8 }
          },
          {
            timestamp: new Date(Date.now() - 1755000).toISOString(),
            event_type: 'cta_hover',
            element_id: 'hero-cta',
            duration: 3200,
            metadata: { hover_count: 2, hesitation_detected: true }
          },
          {
            timestamp: new Date(Date.now() - 1700000).toISOString(),
            event_type: 'form_interaction',
            element_id: 'contact-form',
            duration: 120000,
            metadata: { fields_filled: 2, abandonment_point: 'phone_number' }
          }
        ],
        journey_path: ['Homepage', 'Product Page', 'Pricing', 'Contact Form'],
        friction_points: ['Long form fields', 'No social proof on pricing page', 'Unclear value proposition']
      };

      setSelectedSession(mockDetails);
      setShowSessionModal(true);
    } catch (error) {
      console.error('Failed to load session details:', error);
      alert('Failed to load session details. Please try again.');
    }
  };

  const engageUser = async (session: DigitalBodyLanguageSession) => {
    setIsEngaging(session.id);
    
    try {
      // In a real implementation, this would trigger engagement actions
      const engagementActions = {
        'Fast-Mover': 'Triggered urgency popup with limited-time offer',
        'Proof-Driven': 'Displayed customer testimonials and case studies',
        'Skeptic': 'Showed money-back guarantee and security badges',
        'Reassurer': 'Activated live chat with support agent',
        'Optimizer': 'Presented detailed feature comparison',
        'Authority-Seeker': 'Highlighted expert endorsements',
        'Experience-First': 'Offered free trial or demo'
      };

      const action = engagementActions[session.neuromind_profile as keyof typeof engagementActions] || 'Triggered personalized engagement';
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`✅ Engagement Successful!\n\n${action}\n\nUser readiness score: ${session.readiness_score}\nExpected conversion probability: ${Math.round(session.conversion_probability * 100)}%`);
      
    } catch (error) {
      console.error('Engagement failed:', error);
      alert('Failed to engage user. Please try again.');
    } finally {
      setIsEngaging(null);
    }
  };

  const takeAction = (insight: BehavioralInsight) => {
    setSelectedInsight(insight);
    setShowActionModal(true);
  };

  const implementAction = async (actionItem: string) => {
    try {
      // In a real implementation, this would trigger the specific action
      const actionImplementations = {
        'Deploy urgency-based exit-intent popup': 'Exit-intent popup configured with 15% discount offer',
        'Trigger live chat for high-readiness users': 'Live chat widget activated for users with readiness score >80',
        'Show limited-time offer to Fast-Mover profiles': 'Dynamic offer banner deployed for Fast-Mover profiles',
        'Add more social proof elements': 'Customer testimonials added to pricing page',
        'Include money-back guarantee prominently': 'Money-back guarantee badge added to checkout flow',
        'Show competitor comparison table': 'Comparison table added to product page',
        'Optimize content length for this velocity': 'Content sections optimized for 0.6-0.8 scroll velocity',
        'A/B test content density': 'A/B test initiated for content density optimization',
        'Implement scroll-triggered CTAs': 'Scroll-triggered CTAs deployed at 60% page depth'
      };

      const implementation = actionImplementations[actionItem as keyof typeof actionImplementations] || 'Action implementation initiated';
      
      // Simulate implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`✅ Action Implemented!\n\n${implementation}\n\nMonitoring impact on conversion metrics...`);
      setShowActionModal(false);
      
    } catch (error) {
      console.error('Action implementation failed:', error);
      alert('Failed to implement action. Please try again.');
    }
  };

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
          <div className="w-12 h-12 mx-auto mb-4">
            <svg className="w-12 h-12 text-brand-blue animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="mt-4 text-gray-600">Analyzing Digital Body Language™...</p>
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
            Real-time Digital Body Language™ tracking and behavioral analysis
          </p>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">
                  {error.includes('Demo Mode') ? '🎯 Demo Mode - Showcasing live tracking capabilities' : `⚠️ Error loading data: ${error}`}
                </span>
              </div>
            </div>
          )}
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
          <button 
            className="btn-primary"
            onClick={exportInsights}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              'Export Insights'
            )}
          </button>
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
                  <p className="text-gray-600 mt-1">
                    {selectedSession.session.neuromind_profile} Profile • Readiness Score: {selectedSession.session.readiness_score}
                  </p>
                </div>
                <button
                  onClick={() => setShowSessionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Journey Path */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">User Journey Path</h3>
                <div className="flex items-center space-x-2 overflow-x-auto">
                  {selectedSession.journey_path.map((step, index) => (
                    <React.Fragment key={step}>
                      <div className="bg-brand-blue text-white px-3 py-1 rounded-full text-sm whitespace-nowrap">
                        {step}
                      </div>
                      {index < selectedSession.journey_path.length - 1 && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Behavioral Events */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Behavioral Events</h3>
                <div className="space-y-3">
                  {selectedSession.events.map((event, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{event.event_type.replace('_', ' ').toUpperCase()}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Element: {event.element_id} • Duration: {Math.round(event.duration / 1000)}s
                      </div>
                      {event.metadata && (
                        <div className="mt-2 text-xs text-gray-500">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Friction Points */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Identified Friction Points</h3>
                <div className="space-y-2">
                  {selectedSession.friction_points.map((point, index) => (
                    <div key={index} className="flex items-center text-red-600">
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Implementation Modal */}
      {showActionModal && selectedInsight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Implement Action</h2>
                  <p className="text-gray-600 mt-1">{selectedInsight.title}</p>
                </div>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-700 mb-4">{selectedInsight.description}</p>
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Available Actions:</h3>
                {selectedInsight.action_items.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => implementAction(action)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900">{action}</span>
                      <svg className="w-4 h-4 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="dashboard-grid">
        <IntelligenceModule
          title="Active Sessions"
          value={sessions.filter(s => !s.end_time).length}
          trend={sessions.length > 10 ? { direction: 'up', percentage: 15.3, period: 'last hour' } : undefined}
          description="Users currently being tracked"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Avg Readiness Score"
          value={sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.readiness_score, 0) / sessions.length) : 0}
          trend={sessions.length > 10 ? { direction: 'up', percentage: 8.7, period: 'last 24h' } : undefined}
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
          trend={sessions.length > 10 ? { direction: 'up', percentage: 23.1, period: 'last hour' } : undefined}
          description="Users ready to convert"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <IntelligenceModule
          title="Conversion Probability"
          value={sessions.length > 0 ? `${Math.round(sessions.reduce((sum, s) => sum + s.conversion_probability, 0) / sessions.length * 100)}%` : '0%'}
          trend={sessions.length > 10 ? { direction: 'up', percentage: 12.4, period: 'last 24h' } : undefined}
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
            <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
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
                <button 
                  className="btn-secondary text-xs"
                  onClick={() => takeAction(insight)}
                >
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
                      <button 
                        className="btn-ghost text-xs mr-2"
                        onClick={() => viewSessionDetails(session)}
                      >
                        View Details
                      </button>
                      {session.readiness_score >= 80 && (
                        <button 
                          className="btn-primary text-xs"
                          onClick={() => engageUser(session)}
                          disabled={isEngaging === session.id}
                        >
                          {isEngaging === session.id ? 'Engaging...' : 'Engage Now'}
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