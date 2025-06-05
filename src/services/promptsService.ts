/**
 * Prompts Service - Handles API calls for prompt testing and management
 */

const API_BASE_URL = 'http://localhost:8000';

export interface PromptTestRequest {
  template: string;
  input_data: Record<string, any>;
  provider?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface PromptTestResponse {
  success: boolean;
  output?: any;
  error?: string;
  duration_ms: number;
  provider: string;
  model: string;
  token_usage?: TokenUsage;
  timestamp: string;
}

export interface LLMProvider {
  name: string;
  display_name: string;
  available: boolean;
  models?: string[];
  error?: string;
}

export interface ProvidersResponse {
  providers: LLMProvider[];
  default_provider: string;
}

class PromptsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api/v1/prompts`;
  }

  /**
   * Test a prompt template with real LLM API calls
   */
  async testPrompt(request: PromptTestRequest): Promise<PromptTestResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing prompt:', error);
      throw error;
    }
  }

  /**
   * Get available LLM providers and their status
   */
  async getAvailableProviders(): Promise<ProvidersResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/providers`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw error;
    }
  }

  /**
   * Health check for prompts service
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }

  /**
   * Fill template placeholders with input data
   * This is a client-side helper for preview purposes
   */
  fillTemplate(template: string, inputData: Record<string, any>): string {
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
}

// Export singleton instance
export const promptsService = new PromptsService();
export default promptsService; 