/**
 * Temporary Frontend LLM Service
 * This service makes direct API calls to OpenAI from the browser
 * Note: This is for development/demo purposes only. In production, API keys should be on the backend.
 */

export interface TempPromptTestRequest {
  template: string;
  input_data: Record<string, any>;
  provider?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface TempTokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface TempPromptTestResponse {
  success: boolean;
  output?: any;
  error?: string;
  duration_ms: number;
  provider: string;
  model: string;
  token_usage?: TempTokenUsage;
  timestamp: string;
}

export interface TempLLMProvider {
  name: string;
  display_name: string;
  available: boolean;
  models?: string[];
  error?: string;
}

export interface TempProvidersResponse {
  providers: TempLLMProvider[];
  default_provider: string;
}

class TempLLMService {
  private getOpenAIKey(): string | null {
    // Try to get API key from environment variables (Vite uses import.meta.env)
    return import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  /**
   * Fill template placeholders with input data
   */
  private fillTemplate(template: string, inputData: Record<string, any>): string {
    let filledTemplate = template;
    
    for (const [key, value] of Object.entries(inputData)) {
      const placeholder = `{{${key}}}`;
      let valueStr: string;
      
      if (typeof value === 'object') {
        valueStr = JSON.stringify(value, null, 2);
      } else {
        valueStr = String(value);
      }
      
      filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), valueStr);
    }
    
    return filledTemplate;
  }

  /**
   * Generate mock response based on template category
   */
  private generateMockResponse(category: string): any {
    switch (category) {
      case 'readiness':
        return {
          confidence_adjustment: Math.floor(Math.random() * 21) - 10,
          psychological_indicators: ['high_engagement', 'price_sensitive', 'comparison_shopping'],
          key_insights: [
            'User shows strong engagement with pricing page',
            'Multiple CTA interactions indicate high intent',
            'Form start suggests serious consideration'
          ],
          conversion_likelihood: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
          recommended_actions: [
            'Send personalized pricing proposal',
            'Offer limited-time discount',
            'Provide social proof testimonials'
          ],
          reasoning: 'Strong behavioral signals combined with form engagement indicate user is in active evaluation phase'
        };

      case 'neuromind':
        const profiles = ['Fast-Mover', 'Proof-Driven', 'Reassurer', 'Skeptic', 'Optimizer', 'Authority-Seeker', 'Experience-First'];
        return {
          profile_type: profiles[Math.floor(Math.random() * profiles.length)],
          confidence: Math.random() * 0.3 + 0.7, // 0.7-1.0
          reasoning: 'High scroll depth and engagement with detailed content suggests need for evidence and thorough evaluation',
          characteristics: [
            'Spends significant time reading content',
            'Multiple return visits for comparison',
            'Engages with testimonials and case studies'
          ],
          personalization_recommendations: [
            'Highlight customer success stories',
            'Provide detailed product specifications',
            'Include third-party validation and awards'
          ]
        };

      case 'personalization':
        return {
          personalized_headline: 'See How 2,847 Businesses Like Yours Increased Revenue by 40%',
          personalized_copy: 'Join verified companies who have proven results with our platform. Access case studies, ROI calculator, and detailed implementation guides. Your success is backed by data and guaranteed with our 30-day money-back promise.',
          cta_text: 'View Success Stories & Start Free',
          tone_adjustments: ['evidence-focused', 'data-driven', 'credibility-emphasized'],
          added_elements: ['customer testimonials', 'case study links', 'money-back guarantee'],
          reasoning: 'Adapted for Proof-Driven profile by emphasizing evidence, social proof, and risk reduction'
        };

      case 'strategy':
        return {
          recommendations: [
            {
              type: 'conversion_optimization',
              priority: 'high',
              title: 'Reduce Cart Abandonment',
              description: 'Current abandonment rate suggests friction in checkout process',
              action_items: ['Simplify checkout form', 'Add trust badges', 'Implement exit-intent offers'],
              expected_impact: '15-25% conversion increase',
              implementation_difficulty: 'medium',
              estimated_timeline: '2-3 weeks'
            }
          ],
          analysis_timestamp: new Date().toISOString(),
          confidence_score: Math.random() * 0.3 + 0.7,
          total_recommendations: 1,
          key_insights: ['Checkout optimization priority', 'Traffic quality over quantity']
        };

      case 'revenue_simulation':
        const currentRevenue = 39843.75;
        const lift = Math.random() * 0.3 + 0.15; // 15-45% lift
        return {
          scenario_analysis: {
            baseline_metrics: {
              current_conversion_rate: 0.025,
              monthly_traffic: 12500,
              average_order_value: 127.50,
              monthly_revenue: currentRevenue
            },
            projected_metrics: {
              improved_conversion_rate: 0.025 * (1 + lift),
              projected_revenue: currentRevenue * (1 + lift),
              revenue_lift: currentRevenue * lift
            }
          },
          impact_assessment: {
            best_case_scenario: { revenue_increase: currentRevenue * (lift + 0.1), probability: 0.15 },
            most_likely_scenario: { revenue_increase: currentRevenue * lift, probability: 0.70 },
            worst_case_scenario: { revenue_increase: currentRevenue * (lift - 0.05), probability: 0.15 }
          },
          risk_factors: ['Market saturation', 'Seasonal variations', 'Implementation delays'],
          success_factors: ['Strong current metrics', 'Clear optimization targets', 'Good traffic volume'],
          confidence_level: 'high',
          recommendation: 'Proceed with phased implementation, starting with highest-impact optimizations'
        };

      case 'small_actions':
        return {
          actions: [
            {
              id: 'action_exit_intent',
              title: 'Add Exit-Intent Popup with Discount',
              description: 'Capture abandoning visitors with 10% discount offer',
              effort_level: 'low',
              implementation_time: '2 hours',
              expected_impact: '3-5% conversion increase',
              category: 'conversion_optimization',
              priority_score: 9,
              success_metrics: ['popup_conversion_rate', 'overall_conversion_lift'],
              implementation_steps: ['Design popup', 'Set trigger rules', 'A/B test discount amount']
            }
          ],
          total_actions: 1,
          estimated_cumulative_impact: '5-9% overall conversion improvement',
          recommended_implementation_order: ['action_exit_intent'],
          generated_at: new Date().toISOString()
        };

      default:
        return { message: 'Mock response generated successfully', timestamp: new Date().toISOString() };
    }
  }

  /**
   * Test a prompt template
   */
  async testPrompt(request: TempPromptTestRequest): Promise<TempPromptTestResponse> {
    const startTime = Date.now();
    
    try {
      const filledPrompt = this.fillTemplate(request.template, request.input_data);
      
      // If OpenAI API key is available and provider is OpenAI, make real API call
      if (request.provider === 'openai') {
        const apiKey = this.getOpenAIKey();
        
        if (apiKey) {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: request.model || 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert AI assistant for Revenue Magick, specializing in behavioral analysis and conversion optimization. Provide precise, actionable insights based on the given data. When JSON format is requested, respond with valid JSON only.'
                },
                {
                  role: 'user',
                  content: filledPrompt
                }
              ],
              max_tokens: request.max_tokens || 1000,
              temperature: request.temperature || 0.7,
              response_format: filledPrompt.includes('JSON') ? { type: 'json_object' } : undefined
            })
          });

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          const outputText = data.choices[0].message.content.trim();
          
          let output;
          try {
            if (outputText.startsWith('{') || outputText.startsWith('[')) {
              output = JSON.parse(outputText);
            } else {
              output = outputText;
            }
          } catch {
            output = outputText;
          }

          return {
            success: true,
            output,
            duration_ms: Date.now() - startTime,
            provider: 'openai',
            model: request.model || 'gpt-4o-mini',
            token_usage: data.usage ? {
              prompt_tokens: data.usage.prompt_tokens,
              completion_tokens: data.usage.completion_tokens,
              total_tokens: data.usage.total_tokens
            } : undefined,
            timestamp: new Date().toISOString()
          };
        } else {
          // No API key available, fall back to mock
          throw new Error('OpenAI API key not found in environment variables');
        }
      }
      
      // Generate mock response for non-OpenAI providers or when no API key
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000)); // Simulate API delay
      
      // Determine category from template content
      let category = 'default';
      const templateLower = request.template.toLowerCase();
      if (templateLower.includes('readiness') || templateLower.includes('conversion')) category = 'readiness';
      else if (templateLower.includes('neuromind') || templateLower.includes('profile')) category = 'neuromind';
      else if (templateLower.includes('personalization') || templateLower.includes('content')) category = 'personalization';
      else if (templateLower.includes('strategy') || templateLower.includes('recommendation')) category = 'strategy';
      else if (templateLower.includes('revenue') || templateLower.includes('simulation')) category = 'revenue_simulation';
      else if (templateLower.includes('small') || templateLower.includes('action')) category = 'small_actions';

      const mockOutput = this.generateMockResponse(category);

      return {
        success: true,
        output: mockOutput,
        duration_ms: Date.now() - startTime,
        provider: request.provider || 'mock',
        model: request.model || 'mock-model',
        token_usage: {
          prompt_tokens: 450 + Math.floor(Math.random() * 200),
          completion_tokens: 320 + Math.floor(Math.random() * 180),
          total_tokens: 770 + Math.floor(Math.random() * 380)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        duration_ms: Date.now() - startTime,
        provider: request.provider || 'mock',
        model: request.model || 'mock-model',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get available providers
   */
  async getAvailableProviders(): Promise<TempProvidersResponse> {
    const openaiKey = this.getOpenAIKey();
    
    const providers: TempLLMProvider[] = [
      {
        name: 'openai',
        display_name: 'OpenAI',
        available: !!openaiKey,
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
        error: !openaiKey ? 'API key not found in environment variables' : undefined
      },
      {
        name: 'mock',
        display_name: 'Mock (Development)',
        available: true,
        models: ['mock-model']
      }
    ];

    return {
      providers,
      default_provider: openaiKey ? 'openai' : 'mock'
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    const openaiKey = this.getOpenAIKey();
    
    return {
      status: 'healthy',
      mode: 'frontend-only',
      openai_available: !!openaiKey,
      environment: import.meta.env.MODE || 'development'
    };
  }
}

// Export singleton instance
export const tempLLMService = new TempLLMService();
export default tempLLMService; 