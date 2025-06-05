import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Zap, 
  Target, 
  TrendingUp, 
  Settings, 
  Play, 
  Copy, 
  Save, 
  RotateCcw, 
  Database,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  Code,
  Lightbulb,
  Wifi,
  WifiOff,
  Download
} from 'lucide-react';
// import promptsService, { PromptTestResponse, LLMProvider } from '../services/promptsService';
import tempLLMService, { 
  TempPromptTestResponse, 
  TempLLMProvider,
  TempPromptTestRequest 
} from '../services/tempLLMService';

// Custom Expandable Card Component
interface ExpandableCardProps {
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  actions,
  children
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onToggle}
            className="flex items-center space-x-3 text-left flex-1"
          >
            <div className="flex items-center space-x-2">
              {icon}
              <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {actions && (
            <div onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Types for prompt templates and configurations
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: 'readiness' | 'neuromind' | 'personalization' | 'strategy' | 'revenue_simulation' | 'small_actions';
  template: string;
  inputSchema: Record<string, any>;
  outputFormat: string;
  provider: 'openai' | 'claude' | 'mock';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  lastModified: string;
  isActive: boolean;
}

interface PromptTestResult {
  id: string;
  promptId: string;
  input: Record<string, any>;
  output: any;
  timestamp: string;
  duration: number;
  provider: string;
  model: string;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
  };
  success: boolean;
  error?: string;
}

interface TestInput {
  [key: string]: any;
}

const PromptsEditor: React.FC = () => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [testInput, setTestInput] = useState<TestInput>({});
  const [testResults, setTestResults] = useState<PromptTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    template: true,
    input: true,
    output: false,
    history: false
  });
  
  // Updated state for temporary LLM service
  const [availableProviders, setAvailableProviders] = useState<TempLLMProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('mock');
  const [selectedModel, setSelectedModel] = useState<string>('mock-model');
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Sample prompt templates for all Revenue Magick AI features
  const defaultTemplates: PromptTemplate[] = [
    {
      id: 'readiness_calculator',
      name: 'User Readiness Score Calculator',
      description: 'Analyzes behavioral data to calculate conversion readiness using Digital Body Language™',
      category: 'readiness',
      template: `Analyze this user's behavioral data to assess their conversion readiness:

Context: {{context}}

Based on this Digital Body Language™ data, provide:
1. Confidence adjustment (-20 to +20 points to add to rule-based score)
2. Psychological profile indicators
3. Key behavioral insights
4. Conversion likelihood assessment
5. Recommended next actions

Respond in JSON format:
{
  "confidence_adjustment": <number>,
  "psychological_indicators": ["indicator1", "indicator2"],
  "key_insights": ["insight1", "insight2"],
  "conversion_likelihood": "high|medium|low",
  "recommended_actions": ["action1", "action2"],
  "reasoning": "explanation of analysis"
}`,
      inputSchema: {
        context: {
          type: 'object',
          properties: {
            total_events: { type: 'number' },
            rule_based_score: { type: 'number' },
            behavioral_patterns: { type: 'object' },
            recent_events: { type: 'array' }
          }
        }
      },
      outputFormat: 'JSON object with readiness analysis',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1000,
      lastModified: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'neuromind_classifier',
      name: 'Neuromind Profile™ Classifier',
      description: 'Classifies users into psychological profiles based on behavioral patterns',
      category: 'neuromind',
      template: `Based on the following behavioral data, classify the user into one of the Neuromind Profiles™:

Behavioral Data: {{behavioral_data}}

Profile Types:
- Fast-Mover: Quick decisions, minimal details needed
- Proof-Driven: Wants evidence, case studies, testimonials
- Reassurer: Needs support, help sections, guarantees
- Skeptic: High bounce rate, limited engagement
- Optimizer: Compares options, detailed analysis
- Authority-Seeker: Looks for expert opinions, credentials
- Experience-First: Values user experience, demos, trials

Respond in JSON format:
{
  "profile_type": "profile_name",
  "confidence": 0.0-1.0,
  "reasoning": "explanation",
  "characteristics": ["char1", "char2"],
  "personalization_recommendations": ["rec1", "rec2"]
}`,
      inputSchema: {
        behavioral_data: {
          type: 'object',
          properties: {
            scroll_patterns: { type: 'object' },
            click_patterns: { type: 'object' },
            engagement_metrics: { type: 'object' },
            session_duration: { type: 'number' },
            page_views: { type: 'number' }
          }
        }
      },
      outputFormat: 'JSON object with profile classification',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 800,
      lastModified: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'content_personalizer',
      name: 'Dynamic Content Personalizer',
      description: 'Adapts content based on Neuromind Profiles™ and behavioral signals',
      category: 'personalization',
      template: `Personalize this content for the user's psychological profile:

Original Content: {{original_content}}
User Profile: {{user_profile}}
Readiness Score: {{readiness_score}}/100
Context: {{context}}

Apply these Neural Laws of Persuasion™:
1. Belief Precedes Behavior - Align with existing beliefs
2. Emotion Triggers Action - Include emotional triggers
3. Certainty > Clarity - Reduce uncertainty
4. Speed = Trust - Convey quick value
5. Mind Chooses Simplicity - Simplify messaging
6. Activate the Self - Make it personal
7. Sequence Creates Meaning - Logical flow
8. Social Proof Bypasses Skepticism - Add credibility
9. Automation Enhances Connection - Feel human

Respond in JSON format:
{
  "personalized_headline": "adapted headline",
  "personalized_copy": "adapted main content", 
  "cta_text": "optimized call-to-action",
  "tone_adjustments": ["adjustment1", "adjustment2"],
  "added_elements": ["element1", "element2"],
  "reasoning": "explanation of changes"
}`,
      inputSchema: {
        original_content: { type: 'string' },
        user_profile: { type: 'string' },
        readiness_score: { type: 'number' },
        context: { type: 'object' }
      },
      outputFormat: 'JSON object with personalized content',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 1200,
      lastModified: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'strategic_recommendations',
      name: 'Strategic Recommendation Generator',
      description: 'Generates AI-powered strategic recommendations for revenue optimization',
      category: 'strategy',
      template: `Based on the following analytics data, generate strategic recommendations for revenue optimization:

Analytics Data: {{analytics_data}}

Consider:
1. Current performance metrics
2. Behavioral patterns and trends
3. Conversion funnel optimization
4. Customer lifetime value improvement
5. Market positioning opportunities

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "type": "category",
      "priority": "high|medium|low",
      "title": "recommendation title",
      "description": "detailed description",
      "action_items": ["action1", "action2"],
      "expected_impact": "impact description",
      "implementation_difficulty": "low|medium|high",
      "estimated_timeline": "time estimate"
    }
  ],
  "analysis_timestamp": "ISO timestamp",
  "confidence_score": 0.0-1.0,
  "total_recommendations": number,
  "key_insights": ["insight1", "insight2"]
}`,
      inputSchema: {
        analytics_data: {
          type: 'object',
          properties: {
            conversion_rate: { type: 'number' },
            avg_order_value: { type: 'number' },
            customer_acquisition_cost: { type: 'number' },
            lifetime_value: { type: 'number' },
            churn_rate: { type: 'number' }
          }
        }
      },
      outputFormat: 'JSON object with strategic recommendations',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.6,
      maxTokens: 1500,
      lastModified: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'revenue_simulator',
      name: 'Revenue Impact Simulator',
      description: 'Simulates revenue impact of proposed changes and optimizations',
      category: 'revenue_simulation',
      template: `Analyze the following scenario and simulate potential revenue impact:

Scenario: {{scenario_data}}

Consider these factors:
1. Current baseline performance
2. Proposed changes and their likelihood of success
3. Market conditions and seasonality
4. Customer behavior patterns
5. Implementation risks and challenges

Provide simulation results in JSON format:
{
  "scenario_analysis": {
    "baseline_metrics": {
      "current_conversion_rate": number,
      "monthly_traffic": number,
      "average_order_value": number,
      "monthly_revenue": number
    },
    "projected_metrics": {
      "improved_conversion_rate": number,
      "projected_revenue": number,
      "revenue_lift": number
    }
  },
  "impact_assessment": {
    "best_case_scenario": {
      "revenue_increase": number,
      "probability": number
    },
    "most_likely_scenario": {
      "revenue_increase": number,
      "probability": number
    },
    "worst_case_scenario": {
      "revenue_increase": number,
      "probability": number
    }
  },
  "risk_factors": ["risk1", "risk2"],
  "success_factors": ["factor1", "factor2"],
  "confidence_level": "high|medium|low",
  "recommendation": "summary recommendation"
}`,
      inputSchema: {
        scenario_data: {
          type: 'object',
          properties: {
            current_conversion_rate: { type: 'number' },
            proposed_improvements: { type: 'array' },
            market_conditions: { type: 'object' },
            timeline: { type: 'string' }
          }
        }
      },
      outputFormat: 'JSON object with revenue simulation',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.4,
      maxTokens: 1200,
      lastModified: new Date().toISOString(),
      isActive: true
    },
    {
      id: 'small_actions_generator',
      name: 'Small Compounding Actions™ Generator',
      description: 'Identifies high-leverage micro-optimizations for compounding growth',
      category: 'small_actions',
      template: `Based on the following context, generate Small Compounding Actions™ - high-leverage micro-optimizations:

Context: {{context}}

Focus on actions that are:
1. Low effort, high impact
2. Quick to implement (under 4 hours)
3. Measurable and testable
4. Compound over time
5. Address specific friction points

Provide actions in JSON format:
{
  "actions": [
    {
      "id": "unique_id",
      "title": "action title",
      "description": "detailed description",
      "effort_level": "low|medium|high",
      "implementation_time": "time estimate",
      "expected_impact": "impact description",
      "category": "category",
      "priority_score": 1-10,
      "success_metrics": ["metric1", "metric2"],
      "implementation_steps": ["step1", "step2"]
    }
  ],
  "total_actions": number,
  "estimated_cumulative_impact": "impact description",
  "recommended_implementation_order": ["action_id1", "action_id2"],
  "generated_at": "ISO timestamp"
}`,
      inputSchema: {
        context: {
          type: 'object',
          properties: {
            business_type: { type: 'string' },
            current_metrics: { type: 'object' },
            pain_points: { type: 'array' },
            goals: { type: 'array' }
          }
        }
      },
      outputFormat: 'JSON object with micro-optimization actions',
      provider: 'openai',
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 1400,
      lastModified: new Date().toISOString(),
      isActive: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: FileText },
    { id: 'readiness', name: 'Readiness Score', icon: Target },
    { id: 'neuromind', name: 'Neuromind Profiles™', icon: Brain },
    { id: 'personalization', name: 'Content Personalization', icon: Zap },
    { id: 'strategy', name: 'Strategic Analysis', icon: TrendingUp },
    { id: 'revenue_simulation', name: 'Revenue Simulation', icon: Database },
    { id: 'small_actions', name: 'Small Compounding Actions™', icon: Lightbulb }
  ];

  useEffect(() => {
    // Initialize with default templates
    setTemplates(defaultTemplates);
    setSelectedTemplate(defaultTemplates[0]);
    setEditedTemplate(defaultTemplates[0].template);
    
    // Load sample test input
    loadSampleTestInput(defaultTemplates[0]);
    
    // Load available providers
    loadAvailableProviders();
  }, []);

  const loadAvailableProviders = async () => {
    try {
      setIsLoadingProviders(true);
      setApiError(null);
      
      const providersData = await tempLLMService.getAvailableProviders();
      setAvailableProviders(providersData.providers);
      
      // Set default provider
      setSelectedProvider(providersData.default_provider);
      const defaultProvider = providersData.providers.find(p => p.name === providersData.default_provider);
      if (defaultProvider?.models && defaultProvider.models.length > 0) {
        setSelectedModel(defaultProvider.models[0]);
      }
      
    } catch (error) {
      console.error('Failed to load providers:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to load providers');
    } finally {
      setIsLoadingProviders(false);
    }
  };

  const loadSampleTestInput = (template: PromptTemplate) => {
    // Generate sample input based on the template's input schema
    const sampleInputs: Record<string, any> = {
      readiness_calculator: {
        context: {
          total_events: 156,
          rule_based_score: 67,
          behavioral_patterns: {
            scroll_velocity: 'medium',
            cta_interactions: 3,
            form_abandonments: 1,
            page_dwell_time: 145
          },
          recent_events: [
            { type: 'page_view', timestamp: '2024-01-15T10:30:00Z', metadata: { page: '/pricing' } },
            { type: 'cta_hover', timestamp: '2024-01-15T10:31:15Z', metadata: { element: 'buy-now-btn', duration: 2.3 } },
            { type: 'form_start', timestamp: '2024-01-15T10:32:00Z', metadata: { form_id: 'checkout-form' } }
          ]
        }
      },
      neuromind_classifier: {
        behavioral_data: {
          scroll_patterns: { velocity: 'medium', pause_frequency: 'high', scroll_depth: 0.85 },
          click_patterns: { hesitation_time: 2.1, click_precision: 'high', back_button_usage: 2 },
          engagement_metrics: { time_on_page: 180, bounce_rate: 0.3, return_visits: 5 },
          session_duration: 420,
          page_views: 8
        }
      },
      content_personalizer: {
        original_content: "Join thousands of businesses who have transformed their revenue with our platform. Get started today with a 30-day free trial.",
        user_profile: "Proof-Driven",
        readiness_score: 72,
        context: { page: 'landing', source: 'google_ads', device: 'desktop' }
      },
      strategic_recommendations: {
        analytics_data: {
          conversion_rate: 0.023,
          avg_order_value: 127.50,
          customer_acquisition_cost: 45.20,
          lifetime_value: 520.00,
          churn_rate: 0.12,
          monthly_traffic: 12500,
          bounce_rate: 0.67
        }
      },
      revenue_simulator: {
        scenario_data: {
          current_conversion_rate: 0.025,
          proposed_improvements: [
            { type: 'landing_page_optimization', expected_lift: 0.15 },
            { type: 'checkout_streamlining', expected_lift: 0.20 },
            { type: 'social_proof_addition', expected_lift: 0.10 }
          ],
          market_conditions: { seasonality: 'holiday_season', competition: 'moderate' },
          timeline: '3 months'
        }
      },
      small_actions_generator: {
        context: {
          business_type: 'SaaS',
          current_metrics: { conversion_rate: 0.028, churn_rate: 0.08, signup_rate: 0.15 },
          pain_points: ['high cart abandonment', 'low email open rates', 'poor mobile experience'],
          goals: ['increase conversions', 'reduce churn', 'improve engagement']
        }
      }
    };

    setTestInput(sampleInputs[template.id] || {});
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setEditedTemplate(template.template);
    loadSampleTestInput(template);
    setShowResults(false);
  };

  const handleTemplateEdit = (value: string) => {
    setEditedTemplate(value);
  };

  const handleInputChange = (key: string, value: any) => {
    setTestInput(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTestPrompt = async () => {
    if (!selectedTemplate) return;

    setIsLoading(true);
    setApiError(null);
    
    try {
      // Make API call using temporary LLM service
      const request: TempPromptTestRequest = {
        template: editedTemplate,
        input_data: testInput,
        provider: selectedProvider,
        model: selectedModel,
        temperature: selectedTemplate.temperature || 0.7,
        max_tokens: selectedTemplate.maxTokens || 1000,
      };

      const response: TempPromptTestResponse = await tempLLMService.testPrompt(request);

      const result: PromptTestResult = {
        id: `test_${Date.now()}`,
        promptId: selectedTemplate.id,
        input: testInput,
        output: response.output,
        timestamp: response.timestamp,
        duration: response.duration_ms,
        provider: response.provider,
        model: response.model,
        tokenUsage: response.token_usage ? {
          prompt: response.token_usage.prompt_tokens,
          completion: response.token_usage.completion_tokens,
          total: response.token_usage.total_tokens
        } : undefined,
        success: response.success,
        error: response.error
      };

      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      setShowResults(true);
      setExpandedSections(prev => ({ ...prev, output: true }));

    } catch (error) {
      console.error('Error testing prompt:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to test prompt');
      
      const errorResult: PromptTestResult = {
        id: `test_${Date.now()}`,
        promptId: selectedTemplate.id,
        input: testInput,
        output: null,
        timestamp: new Date().toISOString(),
        duration: 0,
        provider: selectedProvider,
        model: selectedModel,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test prompt'
      };

      setTestResults(prev => [errorResult, ...prev.slice(0, 9)]);
      setShowResults(true);
      setExpandedSections(prev => ({ ...prev, output: true }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      // Get the latest test result for this template
      const latestResult = testResults.find(r => r.promptId === selectedTemplate.id);
      
      // Create the download data
      const downloadData = {
        template: {
          id: selectedTemplate.id,
          name: selectedTemplate.name,
          description: selectedTemplate.description,
          category: selectedTemplate.category,
          template: editedTemplate,
          provider: selectedProvider,
          model: selectedModel,
          temperature: selectedTemplate.temperature || 0.7,
          max_tokens: selectedTemplate.maxTokens || 1000
        },
        test_session: {
          input_data: testInput,
          output: latestResult?.output || null,
          success: latestResult?.success || false,
          error: latestResult?.error || null,
          duration_ms: latestResult?.duration || 0,
          token_usage: latestResult?.tokenUsage || null,
          timestamp: latestResult?.timestamp || new Date().toISOString()
        },
        metadata: {
          exported_at: new Date().toISOString(),
          exported_by: "Revenue Magick Prompts Editor",
          version: "1.0.0"
        }
      };

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `${selectedTemplate.name.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.txt`;

      // Create and download the file
      const blob = new Blob([JSON.stringify(downloadData, null, 2)], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message (you could add a toast notification here)
      console.log(`Prompt data downloaded as ${filename}`);

    } catch (error) {
      console.error('Error downloading prompt data:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetTemplate = () => {
    if (!selectedTemplate) return;
    setEditedTemplate(selectedTemplate.template);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(editedTemplate);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatJSON = (obj: any): string => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  };

  const currentResult = testResults.find(r => r.promptId === selectedTemplate?.id);

  const getInputDescription = (category: string) => {
    switch (category) {
      case 'readiness':
        return (
          <div>
            <p className="mb-2"><strong>Context object containing:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Total events count</li>
              <li>Rule-based score (0-100)</li>
              <li>Behavioral patterns (scroll, clicks, forms)</li>
              <li>Recent user events array</li>
            </ul>
          </div>
        );
      case 'neuromind':
        return (
          <div>
            <p className="mb-2"><strong>Behavioral data object containing:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Scroll patterns (velocity, pause frequency, depth)</li>
              <li>Click patterns (hesitation time, precision)</li>
              <li>Engagement metrics (time on page, bounce rate)</li>
              <li>Session duration and page views</li>
            </ul>
          </div>
        );
      case 'personalization':
        return (
          <div>
            <p className="mb-2"><strong>Content personalization inputs:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Original content text</li>
              <li>User's Neuromind Profile™ type</li>
              <li>Readiness score (0-100)</li>
              <li>Context (page, source, device)</li>
            </ul>
          </div>
        );
      case 'strategy':
        return (
          <div>
            <p className="mb-2"><strong>Analytics data containing:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Conversion rate and AOV</li>
              <li>Customer acquisition cost</li>
              <li>Lifetime value and churn rate</li>
              <li>Traffic and engagement metrics</li>
            </ul>
          </div>
        );
      case 'revenue_simulation':
        return (
          <div>
            <p className="mb-2"><strong>Scenario data containing:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Current conversion rate</li>
              <li>Proposed improvements array</li>
              <li>Market conditions</li>
              <li>Implementation timeline</li>
            </ul>
          </div>
        );
      case 'small_actions':
        return (
          <div>
            <p className="mb-2"><strong>Business context containing:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Business type (SaaS, e-commerce, etc.)</li>
              <li>Current performance metrics</li>
              <li>Identified pain points</li>
              <li>Business goals and objectives</li>
            </ul>
          </div>
        );
      default:
        return <p>No input description available</p>;
    }
  };

  const getOutputDescription = (category: string) => {
    switch (category) {
      case 'readiness':
        return (
          <div>
            <p className="mb-2"><strong>JSON response with:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Confidence adjustment (-20 to +20)</li>
              <li>Psychological profile indicators</li>
              <li>Key behavioral insights</li>
              <li>Conversion likelihood (high/medium/low)</li>
              <li>Recommended next actions</li>
              <li>Analysis reasoning</li>
            </ul>
          </div>
        );
      case 'neuromind':
        return (
          <div>
            <p className="mb-2"><strong>JSON response with:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Profile type classification</li>
              <li>Confidence score (0.0-1.0)</li>
              <li>Reasoning explanation</li>
              <li>User characteristics list</li>
              <li>Personalization recommendations</li>
            </ul>
          </div>
        );
      case 'personalization':
        return (
          <div>
            <p className="mb-2"><strong>JSON response with:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Personalized headline</li>
              <li>Adapted main content</li>
              <li>Optimized CTA text</li>
              <li>Tone adjustments applied</li>
              <li>Added persuasion elements</li>
              <li>Change reasoning</li>
            </ul>
          </div>
        );
      case 'strategy':
        return (
          <div>
            <p className="mb-2"><strong>JSON response with:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Strategic recommendations array</li>
              <li>Priority levels and categories</li>
              <li>Action items and timelines</li>
              <li>Expected impact estimates</li>
              <li>Implementation difficulty</li>
              <li>Confidence score</li>
            </ul>
          </div>
        );
      case 'revenue_simulation':
        return (
          <div>
            <p className="mb-2"><strong>JSON response with:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Baseline vs projected metrics</li>
              <li>Best/likely/worst case scenarios</li>
              <li>Revenue impact calculations</li>
              <li>Risk and success factors</li>
              <li>Confidence level assessment</li>
              <li>Implementation recommendation</li>
            </ul>
          </div>
        );
      case 'small_actions':
        return (
          <div>
            <p className="mb-2"><strong>JSON response with:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Micro-optimization actions array</li>
              <li>Effort levels and time estimates</li>
              <li>Expected impact descriptions</li>
              <li>Priority scores (1-10)</li>
              <li>Success metrics to track</li>
              <li>Implementation order</li>
            </ul>
          </div>
        );
      default:
        return <p>No output description available</p>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-indigo rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Prompts Editor</h1>
                <p className="text-gray-600 mt-1">Experiment with AI prompts and test Revenue Magick's intelligence engines</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Provider Status */}
              <div className="flex items-center space-x-3">
                {isLoadingProviders ? (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Loading providers...</span>
                  </div>
                ) : (
                  <>
                    {availableProviders.find(p => p.name === selectedProvider && p.available) ? (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Wifi className="w-4 h-4" />
                        <span>{availableProviders.find(p => p.name === selectedProvider)?.display_name} Ready</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-orange-600">
                        <WifiOff className="w-4 h-4" />
                        <span>Using Mock Mode</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Stats */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Database className="w-4 h-4" />
                  <span>{templates.length} Templates</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Eye className="w-4 h-4" />
                  <span>{testResults.length} Tests</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error Alert */}
          {apiError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">{apiError}</span>
                <button
                  onClick={loadAvailableProviders}
                  className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          
          {/* OpenAI Setup Info */}
          {!isLoadingProviders && !availableProviders.find(p => p.name === 'openai' && p.available) && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">OpenAI API Setup</span>
              </div>
              <p className="text-sm text-blue-700">
                To use real OpenAI responses, add <code className="bg-blue-100 px-1 rounded">VITE_OPENAI_API_KEY</code> to your environment variables.
                Currently using mock responses for development.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Sidebar - Template List */}
        <div className="xl:col-span-1 space-y-4">
          {/* Template List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Templates</h3>
              <p className="text-xs text-gray-500 mt-1">Select a template to edit and test</p>
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full text-left p-3 rounded-lg transition-colors mb-2 ${
                    selectedTemplate?.id === template.id
                      ? 'bg-brand-blue text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{template.name}</div>
                  <div className={`text-xs mb-2 ${
                    selectedTemplate?.id === template.id ? 'text-brand-ice' : 'text-gray-500'
                  }`}>
                    {template.description}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedTemplate?.id === template.id
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {categories.find(c => c.id === template.category)?.name || template.category}
                    </span>
                    {template.isActive && (
                      <CheckCircle className={`w-3 h-3 ${
                        selectedTemplate?.id === template.id ? 'text-white' : 'text-green-500'
                      }`} />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content - Template Editor & Testing */}
        <div className="xl:col-span-3 space-y-6">
          {selectedTemplate && (
            <>
              {/* Template Editor */}
              <ExpandableCard
                title={`Prompt Template: ${selectedTemplate.name}`}
                icon={<FileText className="w-5 h-5" />}
                isExpanded={expandedSections.template}
                onToggle={() => toggleSection('template')}
                actions={
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyTemplate}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy template"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleResetTemplate}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Reset changes"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      disabled={isSaving}
                      className="px-3 py-1.5 bg-brand-blue text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center space-x-1"
                    >
                      {isSaving ? <Loader className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                      <span>{isSaving ? 'Downloading...' : 'Download'}</span>
                    </button>
                  </div>
                }
              >
                <div className="space-y-6">
                  {/* Template Description */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">What this template does:</h4>
                    <p className="text-gray-700 text-sm mb-3">{selectedTemplate.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                          <Settings className="w-4 h-4 mr-1" />
                          Expected Input:
                        </h5>
                        <div className="text-sm text-gray-600 bg-white rounded p-3 border">
                          {getInputDescription(selectedTemplate.category)}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                          <Target className="w-4 h-4 mr-1" />
                          Output Format:
                        </h5>
                        <div className="text-sm text-gray-600 bg-white rounded p-3 border">
                          {getOutputDescription(selectedTemplate.category)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <label className="text-gray-500">Provider</label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => {
                          const newProvider = e.target.value;
                          setSelectedProvider(newProvider);
                          const provider = availableProviders.find(p => p.name === newProvider);
                          if (provider?.models && provider.models.length > 0) {
                            setSelectedModel(provider.models[0]);
                          } else {
                            setSelectedModel('mock-model');
                          }
                        }}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      >
                        {availableProviders.map(provider => (
                          <option key={provider.name} value={provider.name}>
                            {provider.display_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-500">Model</label>
                      <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      >
                        {availableProviders.find(p => p.name === selectedProvider)?.models?.map(model => (
                          <option key={model} value={model}>{model}</option>
                        )) || <option value="mock-model">mock-model</option>}
                      </select>
                    </div>
                    <div>
                      <label className="text-gray-500">Temperature</label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={selectedTemplate?.temperature || 0.7}
                        onChange={(e) => {
                          if (selectedTemplate) {
                            const updatedTemplate = { ...selectedTemplate, temperature: parseFloat(e.target.value) };
                            setSelectedTemplate(updatedTemplate);
                            setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
                          }
                        }}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500">Max Tokens</label>
                      <input
                        type="number"
                        min="1"
                        max="4000"
                        value={selectedTemplate?.maxTokens || 1000}
                        onChange={(e) => {
                          if (selectedTemplate) {
                            const updatedTemplate = { ...selectedTemplate, maxTokens: parseInt(e.target.value) };
                            setSelectedTemplate(updatedTemplate);
                            setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? updatedTemplate : t));
                          }
                        }}
                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="text-gray-500">Status</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 text-sm">Ready</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt Template
                    </label>
                    <textarea
                      value={editedTemplate}
                      onChange={(e) => handleTemplateEdit(e.target.value)}
                      className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      placeholder="Enter your prompt template..."
                    />
                  </div>
                </div>
              </ExpandableCard>

              {/* Test Input */}
              <ExpandableCard
                title="Test Input"
                icon={<Settings className="w-5 h-5" />}
                isExpanded={expandedSections.input}
                onToggle={() => toggleSection('input')}
                actions={
                  <button
                    onClick={handleTestPrompt}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                  >
                    {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>{isLoading ? 'Testing...' : 'Test Prompt'}</span>
                  </button>
                }
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Input Data (JSON)
                    </label>
                    <textarea
                      value={formatJSON(testInput)}
                      onChange={(e) => {
                        try {
                          setTestInput(JSON.parse(e.target.value));
                        } catch {
                          // Keep the raw text if JSON is invalid
                        }
                      }}
                      className="w-full h-48 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                      placeholder="Enter test input as JSON..."
                    />
                  </div>
                </div>
              </ExpandableCard>

              {/* Test Results */}
              {(showResults || currentResult) && (
                <ExpandableCard
                  title="Test Results"
                  icon={currentResult?.success ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                  isExpanded={expandedSections.output}
                  onToggle={() => toggleSection('output')}
                >
                  {currentResult ? (
                    <div className="space-y-4">
                      {/* Result Metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <label className="text-gray-500">Duration</label>
                          <div className="font-medium">{currentResult.duration}ms</div>
                        </div>
                        <div>
                          <label className="text-gray-500">Provider</label>
                          <div className="font-medium">{currentResult.provider}</div>
                        </div>
                        <div>
                          <label className="text-gray-500">Model</label>
                          <div className="font-medium">{currentResult.model}</div>
                        </div>
                        <div>
                          <label className="text-gray-500">Tokens</label>
                          <div className="font-medium">
                            {currentResult.tokenUsage ? `${currentResult.tokenUsage.total}` : 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Result Output */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          AI Response
                        </label>
                        {currentResult.success ? (
                          <pre className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-sm overflow-auto max-h-96">
                            {formatJSON(currentResult.output)}
                          </pre>
                        ) : (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="text-red-600 font-medium">Error</div>
                            <div className="text-red-500 text-sm mt-1">{currentResult.error}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Run a test to see results here</p>
                    </div>
                  )}
                </ExpandableCard>
              )}

              {/* Test History */}
              {testResults.length > 0 && (
                <ExpandableCard
                  title="Test History"
                  icon={<Database className="w-5 h-5" />}
                  isExpanded={expandedSections.history}
                  onToggle={() => toggleSection('history')}
                >
                  <div className="space-y-2">
                    {testResults.slice(0, 10).map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium text-sm">
                              {templates.find(t => t.id === result.promptId)?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(result.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{result.duration}ms</span>
                          <span>{result.provider}</span>
                          {result.tokenUsage && (
                            <span>{result.tokenUsage.total} tokens</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ExpandableCard>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptsEditor; 