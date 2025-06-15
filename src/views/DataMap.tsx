import React, { useState } from 'react';
import { 
  Database, 
  Globe, 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Users, 
  MousePointer, 
  BarChart3,
  Settings,
  ArrowRight,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Eye,
  Code,
  Server,
  Smartphone,
  Monitor,
  Cloud,
  Cpu,
  Activity,
  FileText,
  Link,
  Filter,
  Calculator,
  Lightbulb,
  Shield,
  Workflow,
  GitBranch,
  Network,
  Plus,
  Minus
} from 'lucide-react';

interface DataFlowNode {
  id: string;
  title: string;
  type: 'source' | 'api' | 'service' | 'calculation' | 'output' | 'storage';
  description: string;
  icon: React.ReactNode;
  color: string;
  endpoints?: string[];
  dataPoints?: string[];
  calculations?: string[];
  outputs?: string[];
  dependencies?: string[];
}

interface DataFlowSection {
  id: string;
  title: string;
  description: string;
  nodes: DataFlowNode[];
  color: string;
}

interface ArchitectureNode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  position: { x: number; y: number };
  connections: string[];
  isExpanded: boolean;
  children?: ArchitectureNode[];
  metrics: {
    endpoints?: number;
    dataPoints?: number;
    calculations?: number;
    tables?: number;
  };
}

const DataMap: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'data-sources': true,
    'tracking-apis': true,
    'ai-engines': true,
    'analytics': true,
    'integrations': true,
    'outputs': true
  });

  const [selectedNode, setSelectedNode] = useState<DataFlowNode | null>(null);
  const [expandedArchNodes, setExpandedArchNodes] = useState<Record<string, boolean>>({});

  const dataFlowSections: DataFlowSection[] = [
    {
      id: 'data-sources',
      title: 'Data Sources & Collection',
      description: 'External and internal data sources feeding into Revenue Magick',
      color: 'bg-blue-50 border-blue-200',
      nodes: [
        {
          id: 'tracking-sdk',
          title: 'JavaScript Tracking SDK',
          type: 'source',
          description: 'Lightweight client-side tracking for Digital Body Language™',
          icon: <Code className="w-5 h-5" />,
          color: 'bg-blue-100 text-blue-800',
          dataPoints: [
            'Scroll velocity & pause detection',
            'CTA hover time measurement',
            'Form interaction patterns',
            'Click cadence & decisiveness',
            'Mouse movement patterns',
            'Viewport engagement tracking',
            'Page performance metrics',
            'Session duration & depth'
          ]
        },
        {
          id: 'facebook-ads',
          title: 'Facebook Ads API',
          type: 'source',
          description: 'Campaign data, metrics, and audience insights from Facebook/Instagram',
          icon: <Globe className="w-5 h-5" />,
          color: 'bg-purple-100 text-purple-800',
          dataPoints: [
            'Campaign performance metrics',
            'Ad spend & impressions',
            'Click-through rates',
            'Conversion data',
            'Audience demographics',
            'Creative performance',
            'Attribution data'
          ]
        },
        {
          id: 'google-ads',
          title: 'Google Ads API',
          type: 'source',
          description: 'Search and display campaign data from Google Ads platform',
          icon: <Globe className="w-5 h-5" />,
          color: 'bg-green-100 text-green-800',
          dataPoints: [
            'Search campaign metrics',
            'Display network performance',
            'Keyword performance',
            'Quality scores',
            'Bidding data',
            'Conversion tracking',
            'GAQL query results'
          ]
        },
        {
          id: 'hubspot-crm',
          title: 'HubSpot CRM',
          type: 'source',
          description: 'Contact management, deals, and customer lifecycle data',
          icon: <Users className="w-5 h-5" />,
          color: 'bg-orange-100 text-orange-800',
          dataPoints: [
            'Contact properties',
            'Deal pipeline data',
            'Lifecycle stages',
            'Email campaign metrics',
            'Lead sources',
            'Custom properties',
            'Timeline events'
          ]
        },
        {
          id: 'gohighlevel',
          title: 'GoHighLevel',
          type: 'source',
          description: 'All-in-one marketing platform with CRM and automation data',
          icon: <Users className="w-5 h-5" />,
          color: 'bg-indigo-100 text-indigo-800',
          dataPoints: [
            'Contact management',
            'Opportunity tracking',
            'SMS/Email campaigns',
            'Automation workflows',
            'Appointment data',
            'Pipeline stages',
            'Custom fields'
          ]
        }
      ]
    },
    {
      id: 'tracking-apis',
      title: 'Tracking & Event APIs',
      description: 'Core APIs for behavioral data collection and session management',
      color: 'bg-green-50 border-green-200',
      nodes: [
        {
          id: 'event-tracking',
          title: 'Event Tracking API',
          type: 'api',
          description: 'Processes behavioral events for Digital Body Language analysis',
          icon: <Activity className="w-5 h-5" />,
          color: 'bg-green-100 text-green-800',
          endpoints: [
            'POST /api/v1/tracking/events',
            'POST /api/v1/tracking/sessions',
            'GET /api/v1/tracking/users/{user_id}/behavioral-signals',
            'POST /api/v1/tracking/batch-events'
          ],
          dataPoints: [
            'User events (clicks, scrolls, hovers)',
            'Session metadata',
            'Element interactions',
            'Form behaviors',
            'Page engagement metrics'
          ]
        },
        {
          id: 'loghound-service',
          title: 'LogHound Attribution',
          type: 'service',
          description: 'Advanced attribution tracking and link generation',
          icon: <Link className="w-5 h-5" />,
          color: 'bg-teal-100 text-teal-800',
          endpoints: [
            'POST /api/v1/tracking/loghound/tracking-link',
            'POST /api/v1/tracking/loghound/mouse-behavior',
            'GET /api/v1/tracking/loghound/heatmap'
          ],
          dataPoints: [
            'Attribution tracking links',
            'Cross-device identity resolution',
            'UTM parameter enhancement',
            'Conversion path reconstruction',
            'Mouse behavior patterns'
          ]
        },
        {
          id: 'event-posting',
          title: 'Event Posting Service',
          type: 'service',
          description: 'Posts conversion events to external platforms',
          icon: <Zap className="w-5 h-5" />,
          color: 'bg-yellow-100 text-yellow-800',
          endpoints: [
            'POST /api/v1/tracking/events/post-conversion',
            'POST /api/v1/tracking/events/post-pageview',
            'GET /api/v1/tracking/events/validate-setup'
          ],
          dataPoints: [
            'Facebook Pixel events',
            'Google Analytics 4 events',
            'Server-side tracking',
            'Custom conversion definitions'
          ]
        }
      ]
    },
    {
      id: 'ai-engines',
      title: 'AI Intelligence Engines',
      description: 'Core AI services for behavioral analysis and personalization',
      color: 'bg-purple-50 border-purple-200',
      nodes: [
        {
          id: 'readiness-calculator',
          title: 'Readiness Score Calculator',
          type: 'calculation',
          description: 'Analyzes behavioral signals to calculate conversion readiness',
          icon: <Target className="w-5 h-5" />,
          color: 'bg-purple-100 text-purple-800',
          endpoints: [
            'GET /api/v1/tracking/users/{user_id}/readiness-score',
            'POST /api/v1/tracking/users/{user_id}/calculate-readiness',
            'POST /api/v1/tracking/batch-calculate-readiness',
            'GET /api/v1/tracking/users/{user_id}/score-history'
          ],
          calculations: [
            'Rule-based scoring (27 behavioral signals)',
            'Time decay functions',
            'Context multipliers',
            'LLM confidence adjustments',
            'Signal weight optimization',
            'Confidence level assessment'
          ],
          dataPoints: [
            'Form interactions',
            'CTA engagement',
            'Scroll patterns',
            'Session duration',
            'Page depth',
            'Return visits'
          ]
        },
        {
          id: 'neuromind-classifier',
          title: 'Neuromind Profile™ Classifier',
          type: 'calculation',
          description: 'Classifies users into psychological profiles using behavioral patterns',
          icon: <Brain className="w-5 h-5" />,
          color: 'bg-pink-100 text-pink-800',
          endpoints: [
            'GET /api/v1/tracking/users/{user_id}/neuromind-profile',
            'POST /api/v1/tracking/users/{user_id}/classify-neuromind',
            'GET /api/v1/tracking/neuromind-profiles/{profile_type}/insights'
          ],
          calculations: [
            'LLM-based profile classification',
            'Behavioral pattern analysis',
            'Confidence scoring',
            'Profile transition tracking',
            'Dominant signal identification'
          ],
          outputs: [
            'Fast-Mover',
            'Proof-Driven',
            'Reassurer',
            'Skeptic',
            'Optimizer',
            'Authority-Seeker',
            'Experience-First'
          ]
        },
        {
          id: 'personalization-engine',
          title: 'Personalization Engine',
          type: 'calculation',
          description: 'Adapts content based on Neuromind Profiles™ and readiness scores',
          icon: <Zap className="w-5 h-5" />,
          color: 'bg-blue-100 text-blue-800',
          endpoints: [
            'POST /api/v1/tracking/users/{user_id}/personalize-content',
            'POST /api/v1/tracking/users/{user_id}/generate-dynamic-cta',
            'POST /api/v1/tracking/users/{user_id}/adapt-messaging-tone',
            'POST /api/v1/tracking/users/{user_id}/recommend-content-sequence'
          ],
          calculations: [
            'Neural Laws of Persuasion™ application',
            'Dynamic content adaptation',
            'Tone and style optimization',
            'CTA personalization',
            'Content sequence optimization'
          ]
        },
        {
          id: 'strategic-engine',
          title: 'Strategic Recommendation Engine',
          type: 'calculation',
          description: 'Generates AI-powered strategic recommendations for revenue optimization',
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'bg-emerald-100 text-emerald-800',
          endpoints: [
            'POST /api/v1/tracking/strategic-recommendations/generate',
            'GET /api/v1/tracking/small-compounding-actions',
            'POST /api/v1/tracking/revenue-impact/analyze',
            'POST /api/v1/tracking/competitive-insights/generate'
          ],
          calculations: [
            'LLM-based strategy analysis',
            'Revenue impact modeling',
            'Small Compounding Actions™ identification',
            'Competitive positioning analysis',
            'ROI calculations'
          ]
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reporting',
      description: 'Data aggregation, analysis, and reporting APIs',
      color: 'bg-orange-50 border-orange-200',
      nodes: [
        {
          id: 'analytics-api',
          title: 'Analytics API',
          type: 'api',
          description: 'Comprehensive analytics and reporting endpoints',
          icon: <BarChart3 className="w-5 h-5" />,
          color: 'bg-orange-100 text-orange-800',
          endpoints: [
            'GET /api/v1/analytics/dashboard',
            'GET /api/v1/analytics/ad-metrics',
            'GET /api/v1/analytics/campaign-performance',
            'GET /api/v1/analytics/user-behavior-summary',
            'GET /api/v1/analytics/conversion-funnel',
            'GET /api/v1/analytics/customer-profiles',
            'GET /api/v1/analytics/behavioral-insights',
            'GET /api/v1/analytics/behavioral-signals'
          ],
          calculations: [
            'Funnel analysis',
            'Cohort analysis',
            'Attribution modeling',
            'Performance aggregations',
            'Trend analysis',
            'Segmentation analysis'
          ]
        },
        {
          id: 'strategy-api',
          title: 'Strategy API',
          type: 'api',
          description: 'Strategic analysis and recommendation endpoints',
          icon: <Lightbulb className="w-5 h-5" />,
          color: 'bg-yellow-100 text-yellow-800',
          endpoints: [
            'GET /api/v1/strategy/recommendations',
            'GET /api/v1/strategy/revenue-simulation',
            'GET /api/v1/strategy/market-analysis',
            'GET /api/v1/strategy/optimization-opportunities'
          ],
          calculations: [
            'Strategic recommendations',
            'Revenue simulations',
            'Market trend analysis',
            'Optimization scoring'
          ]
        }
      ]
    },
    {
      id: 'integrations',
      title: 'Integration Management',
      description: 'External platform connections and data synchronization',
      color: 'bg-indigo-50 border-indigo-200',
      nodes: [
        {
          id: 'integration-api',
          title: 'Integration API',
          type: 'api',
          description: 'Manages connections to external platforms',
          icon: <Settings className="w-5 h-5" />,
          color: 'bg-indigo-100 text-indigo-800',
          endpoints: [
            'GET /api/v1/integrations/',
            'POST /api/v1/integrations/',
            'GET /api/v1/integrations/{integration_id}',
            'POST /api/v1/integrations/{integration_id}/sync',
            'GET /api/v1/integrations/providers'
          ]
        },
        {
          id: 'oauth-api',
          title: 'OAuth API',
          type: 'api',
          description: 'Handles OAuth authentication flows for external platforms',
          icon: <Shield className="w-5 h-5" />,
          color: 'bg-gray-100 text-gray-800',
          endpoints: [
            'GET /api/v1/oauth/{provider}/authorize',
            'POST /api/v1/oauth/{provider}/callback',
            'POST /api/v1/oauth/{provider}/refresh'
          ]
        },
        {
          id: 'sync-services',
          title: 'Data Sync Services',
          type: 'service',
          description: 'Background services for data synchronization',
          icon: <Workflow className="w-5 h-5" />,
          color: 'bg-cyan-100 text-cyan-800',
          dataPoints: [
            'Facebook Ads sync',
            'Google Ads sync',
            'HubSpot sync',
            'GoHighLevel sync',
            'Sync history tracking',
            'Error handling & retry logic'
          ]
        }
      ]
    },
    {
      id: 'outputs',
      title: 'Frontend Views & Outputs',
      description: 'User interfaces and data visualization components',
      color: 'bg-gray-50 border-gray-200',
      nodes: [
        {
          id: 'dashboard',
          title: 'Revenue Dashboard',
          type: 'output',
          description: 'Main dashboard with key metrics and insights',
          icon: <Monitor className="w-5 h-5" />,
          color: 'bg-gray-100 text-gray-800',
          dataPoints: [
            'Revenue metrics',
            'Conversion rates',
            'Traffic analytics',
            'Goal tracking',
            'Performance trends'
          ]
        },
        {
          id: 'conversion-spy',
          title: 'Conversion Spy Engine™',
          type: 'output',
          description: 'Real-time behavioral tracking and analysis',
          icon: <Eye className="w-5 h-5" />,
          color: 'bg-blue-100 text-blue-800',
          dataPoints: [
            'Live user sessions',
            'Behavioral signals',
            'Readiness scores',
            'Real-time events'
          ]
        },
        {
          id: 'behavioral-signals',
          title: 'Behavioral Signals',
          type: 'output',
          description: 'Digital Body Language™ analysis and visualization',
          icon: <Activity className="w-5 h-5" />,
          color: 'bg-green-100 text-green-800',
          dataPoints: [
            'Signal strength analysis',
            'Behavioral flow charts',
            'Pattern recognition',
            'Friction identification'
          ]
        },
        {
          id: 'customer-intelligence',
          title: 'Customer Intelligence',
          type: 'output',
          description: 'Customer profiles and segmentation analysis',
          icon: <Users className="w-5 h-5" />,
          color: 'bg-purple-100 text-purple-800',
          dataPoints: [
            'Neuromind Profiles™',
            'Customer segments',
            'Lifecycle stages',
            'Engagement metrics'
          ]
        },
        {
          id: 'ad-intelligence',
          title: 'Ad Intelligence',
          type: 'output',
          description: 'Campaign performance and optimization insights',
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'bg-orange-100 text-orange-800',
          dataPoints: [
            'Campaign performance',
            'Creative analysis',
            'Audience insights',
            'Optimization recommendations'
          ]
        },
        {
          id: 'revenue-strategist',
          title: 'Revenue Strategist',
          type: 'output',
          description: 'Strategic recommendations and revenue simulations',
          icon: <Calculator className="w-5 h-5" />,
          color: 'bg-emerald-100 text-emerald-800',
          dataPoints: [
            'Strategic recommendations',
            'Revenue simulations',
            'Small Compounding Actions™',
            'Market insights'
          ]
        }
      ]
    }
  ];

  // Architecture visualization data
  const architectureNodes: ArchitectureNode[] = [
    {
      id: 'data-sources',
      title: 'Data Sources',
      description: 'External platforms',
      icon: <Database className="w-6 h-6" />,
      color: 'bg-blue-500',
      position: { x: 50, y: 60 },
      connections: ['processing-layer'],
      isExpanded: false,
      metrics: { endpoints: 15, dataPoints: 45 },
      children: [
        {
          id: 'facebook-ads-arch',
          title: 'Facebook Ads',
          description: 'Campaign data',
          icon: <Globe className="w-4 h-4" />,
          color: 'bg-blue-400',
          position: { x: 30, y: 30 },
          connections: ['processing-layer'],
          isExpanded: false,
          metrics: { endpoints: 5 }
        },
        {
          id: 'google-ads-arch',
          title: 'Google Ads',
          description: 'Search metrics',
          icon: <Globe className="w-4 h-4" />,
          color: 'bg-green-400',
          position: { x: 30, y: 120 },
          connections: ['processing-layer'],
          isExpanded: false,
          metrics: { endpoints: 4 }
        },
        {
          id: 'crm-systems-arch',
          title: 'CRM Systems',
          description: 'Customer data',
          icon: <Users className="w-4 h-4" />,
          color: 'bg-orange-400',
          position: { x: 30, y: 210 },
          connections: ['processing-layer'],
          isExpanded: false,
          metrics: { endpoints: 6 }
        }
      ]
    },
    {
      id: 'processing-layer',
      title: 'Processing Layer',
      description: 'APIs & transformation',
      icon: <Cpu className="w-6 h-6" />,
      color: 'bg-green-500',
      position: { x: 350, y: 60 },
      connections: ['ai-engines', 'storage-layer'],
      isExpanded: false,
      metrics: { endpoints: 25 },
      children: [
        {
          id: 'tracking-api-arch',
          title: 'Tracking API',
          description: 'Event processing',
          icon: <Activity className="w-4 h-4" />,
          color: 'bg-green-400',
          position: { x: 330, y: 30 },
          connections: ['ai-engines'],
          isExpanded: false,
          metrics: { endpoints: 8 }
        },
        {
          id: 'integration-api-arch',
          title: 'Integration API',
          description: 'Platform sync',
          icon: <Settings className="w-4 h-4" />,
          color: 'bg-teal-400',
          position: { x: 330, y: 120 },
          connections: ['storage-layer'],
          isExpanded: false,
          metrics: { endpoints: 12 }
        },
        {
          id: 'analytics-api-arch',
          title: 'Analytics API',
          description: 'Data aggregation',
          icon: <BarChart3 className="w-4 h-4" />,
          color: 'bg-emerald-400',
          position: { x: 330, y: 210 },
          connections: ['ai-engines', 'frontend-views'],
          isExpanded: false,
          metrics: { endpoints: 15 }
        }
      ]
    },
    {
      id: 'ai-engines',
      title: 'AI Engines',
      description: 'Intelligence layer',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-purple-500',
      position: { x: 650, y: 60 },
      connections: ['frontend-views'],
      isExpanded: false,
      metrics: { calculations: 20 },
      children: [
        {
          id: 'readiness-engine-arch',
          title: 'Readiness Engine',
          description: 'Conversion scoring',
          icon: <Target className="w-4 h-4" />,
          color: 'bg-purple-400',
          position: { x: 630, y: 30 },
          connections: ['frontend-views'],
          isExpanded: false,
          metrics: { calculations: 8 }
        },
        {
          id: 'neuromind-engine-arch',
          title: 'Neuromind Engine',
          description: 'Profile classification',
          icon: <Brain className="w-4 h-4" />,
          color: 'bg-pink-400',
          position: { x: 630, y: 120 },
          connections: ['frontend-views'],
          isExpanded: false,
          metrics: { calculations: 6 }
        },
        {
          id: 'strategy-engine-arch',
          title: 'Strategy Engine',
          description: 'Revenue optimization',
          icon: <TrendingUp className="w-4 h-4" />,
          color: 'bg-indigo-400',
          position: { x: 630, y: 210 },
          connections: ['frontend-views'],
          isExpanded: false,
          metrics: { calculations: 10 }
        }
      ]
    },
    {
      id: 'storage-layer',
      title: 'Storage Layer',
      description: 'Database & cache',
      icon: <Database className="w-6 h-6" />,
      color: 'bg-gray-500',
      position: { x: 350, y: 320 },
      connections: ['ai-engines'],
      isExpanded: false,
      metrics: { tables: 25 },
      children: [
        {
          id: 'postgresql-arch',
          title: 'PostgreSQL',
          description: 'Primary database',
          icon: <Database className="w-4 h-4" />,
          color: 'bg-gray-400',
          position: { x: 250, y: 320 },
          connections: ['ai-engines'],
          isExpanded: false,
          metrics: { tables: 20 }
        },
        {
          id: 'redis-arch',
          title: 'Redis Cache',
          description: 'Real-time data',
          icon: <Zap className="w-4 h-4" />,
          color: 'bg-red-400',
          position: { x: 350, y: 320 },
          connections: ['ai-engines'],
          isExpanded: false,
          metrics: { dataPoints: 15 }
        },
        {
          id: 'vector-db-arch',
          title: 'Vector DB',
          description: 'AI embeddings',
          icon: <Network className="w-4 h-4" />,
          color: 'bg-violet-400',
          position: { x: 450, y: 320 },
          connections: ['ai-engines'],
          isExpanded: false,
          metrics: { dataPoints: 5 }
        }
      ]
    },
    {
      id: 'frontend-views',
      title: 'Frontend Views',
      description: 'User interfaces',
      icon: <Monitor className="w-6 h-6" />,
      color: 'bg-orange-500',
      position: { x: 950, y: 60 },
      connections: [],
      isExpanded: false,
      metrics: { endpoints: 30 },
      children: [
        {
          id: 'dashboard-arch',
          title: 'Main Dashboard',
          description: 'Revenue intelligence',
          icon: <BarChart3 className="w-4 h-4" />,
          color: 'bg-orange-400',
          position: { x: 930, y: 30 },
          connections: [],
          isExpanded: false,
          metrics: { endpoints: 8 }
        },
        {
          id: 'conversion-spy-arch',
          title: 'Conversion Spy',
          description: 'Behavioral tracking',
          icon: <Eye className="w-4 h-4" />,
          color: 'bg-blue-400',
          position: { x: 930, y: 120 },
          connections: [],
          isExpanded: false,
          metrics: { endpoints: 6 }
        },
        {
          id: 'intelligence-views-arch',
          title: 'Intelligence Views',
          description: 'Analytics dashboards',
          icon: <Brain className="w-4 h-4" />,
          color: 'bg-purple-400',
          position: { x: 930, y: 210 },
          connections: [],
          isExpanded: false,
          metrics: { endpoints: 16 }
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleArchNode = (nodeId: string) => {
    setExpandedArchNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'source': return <Database className="w-4 h-4" />;
      case 'api': return <Server className="w-4 h-4" />;
      case 'service': return <Cpu className="w-4 h-4" />;
      case 'calculation': return <Brain className="w-4 h-4" />;
      case 'output': return <Monitor className="w-4 h-4" />;
      case 'storage': return <Database className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const renderConnection = (from: ArchitectureNode, to: ArchitectureNode) => {
    const fromX = from.position.x + 80; // Adjust for larger node width
    const fromY = from.position.y + 40; // Adjust for larger node height
    const toX = to.position.x;
    const toY = to.position.y + 40;
    
    return (
      <line
        key={`${from.id}-${to.id}`}
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke="#9CA3AF"
        strokeWidth="1.5"
        markerEnd="url(#arrowhead)"
        className="opacity-40"
      />
    );
  };

  const renderArchitectureNode = (node: ArchitectureNode) => {
    const isExpanded = expandedArchNodes[node.id];
    const nodesToRender = isExpanded && node.children ? node.children : [node];
    
    return (
      <g key={node.id}>
        {nodesToRender.map((renderNode) => (
          <g key={renderNode.id}>
            {/* Node Background - Fully Clickable */}
            <rect
              x={renderNode.position.x}
              y={renderNode.position.y}
              width="160"
              height="80"
              rx="12"
              className={`${renderNode.color} stroke-2 stroke-white shadow-lg cursor-pointer hover:opacity-80 transition-all duration-200 hover:scale-105`}
              onClick={() => toggleArchNode(node.id)}
            />
            
            {/* Icon Container */}
            <foreignObject
              x={renderNode.position.x + 12}
              y={renderNode.position.y + 12}
              width="32"
              height="32"
              className="pointer-events-none"
            >
              <div className="text-white flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                {renderNode.icon}
              </div>
            </foreignObject>
            
            {/* Title */}
            <text
              x={renderNode.position.x + 12}
              y={renderNode.position.y + 60}
              className="fill-white text-sm font-bold pointer-events-none"
              style={{ fontSize: '14px' }}
            >
              {renderNode.title}
            </text>
            
            {/* Description */}
            <text
              x={renderNode.position.x + 12}
              y={renderNode.position.y + 75}
              className="fill-white text-xs opacity-90 pointer-events-none"
              style={{ fontSize: '11px' }}
            >
              {renderNode.description}
            </text>
            
            {/* Metrics Badge */}
            <rect
              x={renderNode.position.x + 100}
              y={renderNode.position.y + 8}
              width="52"
              height="20"
              rx="10"
              className="fill-white/20 pointer-events-none"
            />
            <text
              x={renderNode.position.x + 126}
              y={renderNode.position.y + 20}
              className="fill-white text-xs font-medium pointer-events-none text-anchor-middle"
              style={{ fontSize: '10px', textAnchor: 'middle' }}
            >
              {renderNode.metrics.endpoints ? `${renderNode.metrics.endpoints}` : 
               renderNode.metrics.calculations ? `${renderNode.metrics.calculations}` :
               renderNode.metrics.tables ? `${renderNode.metrics.tables}` :
               renderNode.metrics.dataPoints ? `${renderNode.metrics.dataPoints}` : ''}
            </text>
            
            {/* Expand/Collapse indicator */}
            {node.children && (
              <g className="pointer-events-none">
                <circle
                  cx={renderNode.position.x + 140}
                  cy={renderNode.position.y + 20}
                  r="12"
                  className="fill-white/30"
                />
                <foreignObject
                  x={renderNode.position.x + 132}
                  y={renderNode.position.y + 12}
                  width="16"
                  height="16"
                  className="pointer-events-none"
                >
                  <div className="text-white flex items-center justify-center">
                    {isExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                  </div>
                </foreignObject>
              </g>
            )}
          </g>
        ))}
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-indigo rounded-xl flex items-center justify-center">
                <Workflow className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Data Map</h1>
                <p className="text-gray-600 mt-1">Complete data flow visualization of Revenue Magick's architecture</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Database className="w-4 h-4" />
                <span>{dataFlowSections.reduce((acc, section) => acc + section.nodes.length, 0)} Components</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Server className="w-4 h-4" />
                <span>{dataFlowSections.length} Layers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Flow Sections */}
      <div className="space-y-6">
        {dataFlowSections.map((section, sectionIndex) => (
          <div key={section.id} className={`rounded-xl border-2 ${section.color}`}>
            <div className="p-4">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {expandedSections[section.id] ? (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    )}
                    <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{section.nodes.length} components</span>
                </div>
              </button>
              <p className="text-gray-600 mt-2 ml-7">{section.description}</p>
            </div>

            {expandedSections[section.id] && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {section.nodes.map((node) => (
                    <div
                      key={node.id}
                      className={`bg-white rounded-lg border-2 border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer ${
                        selectedNode?.id === node.id ? 'ring-2 ring-brand-blue border-brand-blue' : ''
                      }`}
                      onClick={() => setSelectedNode(selectedNode?.id === node.id ? null : node)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${node.color}`}>
                            {node.icon}
                          </div>
                          <div className="flex items-center space-x-1">
                            {getTypeIcon(node.type)}
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {node.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-2">{node.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{node.description}</p>
                      
                      {/* Quick Stats */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {node.endpoints && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {node.endpoints.length} endpoints
                          </span>
                        )}
                        {node.dataPoints && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            {node.dataPoints.length} data points
                          </span>
                        )}
                        {node.calculations && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            {node.calculations.length} calculations
                          </span>
                        )}
                        {node.outputs && (
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {node.outputs.length} outputs
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Flow Arrows */}
                {sectionIndex < dataFlowSections.length - 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <ArrowDown className="w-6 h-6" />
                      <span className="text-sm font-medium">Data flows to next layer</span>
                      <ArrowDown className="w-6 h-6" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-3 rounded-lg ${selectedNode.color}`}>
                {selectedNode.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedNode.title}</h3>
                <p className="text-gray-600">{selectedNode.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {selectedNode.endpoints && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Server className="w-4 h-4 mr-2" />
                    API Endpoints
                  </h4>
                  <ul className="space-y-1">
                    {selectedNode.endpoints.map((endpoint, index) => (
                      <li key={index} className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                        {endpoint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.dataPoints && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Database className="w-4 h-4 mr-2" />
                    Data Points
                  </h4>
                  <ul className="space-y-1">
                    {selectedNode.dataPoints.map((point, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.calculations && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculations
                  </h4>
                  <ul className="space-y-1">
                    {selectedNode.calculations.map((calc, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {calc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.outputs && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Outputs
                  </h4>
                  <ul className="space-y-1">
                    {selectedNode.outputs.map((output, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {output}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Database Schema Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Database className="w-6 h-6 mr-2" />
            Database Schema Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Core Tracking</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• users</li>
                <li>• sessions</li>
                <li>• user_events</li>
                <li>• readiness_scores</li>
                <li>• neuromind_profiles</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Ad Platforms</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• ad_campaigns</li>
                <li>• ad_sets</li>
                <li>• ads</li>
                <li>• ad_metrics</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">CRM Data</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• contacts</li>
                <li>• deals</li>
                <li>• email_campaigns</li>
              </ul>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">Integrations</h4>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• integrations</li>
                <li>• integration_sync_history</li>
                <li>• integration_sync_metrics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Visualization */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-indigo rounded-xl flex items-center justify-center">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Revenue Magick Architecture</h3>
                <p className="text-gray-600">Interactive data flow visualization</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.open('/api/v1/analytics/architecture-graph', '_blank')}
                className="bg-gradient-to-r from-brand-blue to-brand-indigo text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                <Network className="w-4 h-4" />
                <span>Open Interactive Graph</span>
              </button>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Network className="w-4 h-4" />
                <span>{architectureNodes.length} Core Systems</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Server className="w-4 h-4" />
                <span>{architectureNodes.reduce((acc, node) => acc + (node.metrics.endpoints || 0), 0)} Total APIs</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-indigo rounded-full flex items-center justify-center">
                <GitBranch className="w-8 h-8 text-white" />
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Professional Graph Visualization</h4>
            <p className="text-gray-600 mb-4">
              Click the button above to open an interactive, professional-grade visualization of Revenue Magick's architecture 
              built with NetworkX and Plotly. Features include hover details, zoom controls, and dynamic layouts.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Data Sources</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Processing</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>AI Engines</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                <span>Storage</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Frontend</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">System Metrics Overview</h3>
              <p className="text-gray-600">Complete inventory of data points, calculations, and endpoints</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* API Endpoints */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Server className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-blue-700">
                  {architectureNodes.reduce((acc, node) => acc + (node.metrics.endpoints || 0), 0)}
                </span>
              </div>
              <h4 className="font-semibold text-blue-900 mb-2">API Endpoints</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Tracking APIs</span>
                  <span>8</span>
                </div>
                <div className="flex justify-between">
                  <span>Analytics APIs</span>
                  <span>15</span>
                </div>
                <div className="flex justify-between">
                  <span>Integration APIs</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Engine APIs</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between">
                  <span>Frontend APIs</span>
                  <span>30</span>
                </div>
              </div>
            </div>

            {/* Data Points */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-green-700">
                  {architectureNodes.reduce((acc, node) => acc + (node.metrics.dataPoints || 0), 0)}
                </span>
              </div>
              <h4 className="font-semibold text-green-900 mb-2">Data Points</h4>
              <div className="space-y-1 text-sm text-green-800">
                <div className="flex justify-between">
                  <span>Behavioral Signals</span>
                  <span>27</span>
                </div>
                <div className="flex justify-between">
                  <span>Ad Metrics</span>
                  <span>22</span>
                </div>
                <div className="flex justify-between">
                  <span>CRM Data Points</span>
                  <span>23</span>
                </div>
                <div className="flex justify-between">
                  <span>User Profiles</span>
                  <span>15</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance KPIs</span>
                  <span>33</span>
                </div>
              </div>
            </div>

            {/* Calculations */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-purple-700">
                  {architectureNodes.reduce((acc, node) => acc + (node.metrics.calculations || 0), 0)}
                </span>
              </div>
              <h4 className="font-semibold text-purple-900 mb-2">AI Calculations</h4>
              <div className="space-y-1 text-sm text-purple-800">
                <div className="flex justify-between">
                  <span>Readiness Scoring</span>
                  <span>8</span>
                </div>
                <div className="flex justify-between">
                  <span>Profile Classification</span>
                  <span>6</span>
                </div>
                <div className="flex justify-between">
                  <span>Strategy Analysis</span>
                  <span>10</span>
                </div>
                <div className="flex justify-between">
                  <span>Performance Analytics</span>
                  <span>12</span>
                </div>
                <div className="flex justify-between">
                  <span>Event Processing</span>
                  <span>5</span>
                </div>
              </div>
            </div>

            {/* Database Tables */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-700">
                  {architectureNodes.reduce((acc, node) => acc + (node.metrics.tables || 0), 0)}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Database Tables</h4>
              <div className="space-y-1 text-sm text-gray-800">
                <div className="flex justify-between">
                  <span>Core Tracking</span>
                  <span>5</span>
                </div>
                <div className="flex justify-between">
                  <span>Ad Platforms</span>
                  <span>4</span>
                </div>
                <div className="flex justify-between">
                  <span>CRM Data</span>
                  <span>3</span>
                </div>
                <div className="flex justify-between">
                  <span>Integrations</span>
                  <span>3</span>
                </div>
                <div className="flex justify-between">
                  <span>System Tables</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Data Flow Summary */}
          <div className="mt-6 bg-gradient-to-r from-brand-blue/10 to-brand-indigo/10 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Workflow className="w-5 h-5 mr-2" />
              Data Flow Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Input Sources</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>• JavaScript SDK (Real-time tracking)</li>
                  <li>• Facebook Ads API (Campaign data)</li>
                  <li>• Google Ads API (Performance metrics)</li>
                  <li>• HubSpot CRM (Customer data)</li>
                  <li>• GoHighLevel (Pipeline data)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Processing Engines</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>• Readiness Score Calculator</li>
                  <li>• Neuromind Profile Classifier</li>
                  <li>• Strategic Recommendation Engine</li>
                  <li>• Behavioral Signal Processor</li>
                  <li>• Revenue Impact Analyzer</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-800 mb-2">Output Interfaces</h5>
                <ul className="space-y-1 text-gray-600">
                  <li>• Main Revenue Dashboard</li>
                  <li>• Conversion Spy Engine™</li>
                  <li>• Customer Intelligence View</li>
                  <li>• Ad Intelligence Dashboard</li>
                  <li>• Revenue Strategist Interface</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMap; 