import { apiKeyManager } from './apiKeyManager.js';

export class AgentExecutor {
  constructor() {
    this.isExecuting = false;
    this.executionHistory = [];
  }

  async executeAgent(agentType, params, onProgress) {
    if (this.isExecuting) {
      throw new Error('Another agent is already executing');
    }

    this.isExecuting = true;
    const executionId = Date.now();
    
    try {
      onProgress?.(0, 'Initializing agent...');
      
      const result = await this._runAgent(agentType, params, onProgress);
      
      // Store execution history
      this.executionHistory.push({
        id: executionId,
        agentType,
        params: { ...params, apiKeys: '[REDACTED]' }, // Don't store API keys
        result,
        timestamp: new Date(),
        success: true
      });

      onProgress?.(100, 'Agent execution completed');
      return result;
      
    } catch (error) {
      this.executionHistory.push({
        id: executionId,
        agentType,
        params: { ...params, apiKeys: '[REDACTED]' },
        error: error.message,
        timestamp: new Date(),
        success: false
      });
      
      onProgress?.(-1, `Error: ${error.message}`);
      throw error;
      
    } finally {
      this.isExecuting = false;
    }
  }

  async _runAgent(agentType, params, onProgress) {
    switch (agentType) {
      case 'email-marketer':
        return await this._runEmailMarketer(params, onProgress);
      case 'sales-generator':
        return await this._runSalesGenerator(params, onProgress);
      case 'notion-builder':
        return await this._runNotionBuilder(params, onProgress);
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }

  async _runEmailMarketer(params, onProgress) {
    const { industry, campaignType, targetAudience, productDescription, customPrompt } = params;
    
    onProgress?.(10, 'Getting API keys...');
    const openaiKey = apiKeyManager.getKey('openai');
    if (!openaiKey) {
      throw new Error('OpenAI API key is required');
    }

    onProgress?.(20, 'Analyzing target audience...');
    
    // Create the prompt for email marketing
    const systemPrompt = `You are an expert email marketing strategist. Create compelling email campaigns that drive engagement and conversions.`;
    
    const userPrompt = `
Create a comprehensive email marketing campaign for:

Industry: ${industry}
Campaign Type: ${campaignType}
Target Audience: ${targetAudience}
Product/Service: ${productDescription}
${customPrompt ? `Additional Requirements: ${customPrompt}` : ''}

Please provide:
1. Campaign strategy overview
2. 5 compelling subject lines (with A/B test variations)
3. Email sequence (3-5 emails) with full content
4. Call-to-action recommendations
5. Personalization suggestions
6. Success metrics to track

Format the response as structured JSON with clear sections.
`;

    onProgress?.(40, 'Generating email campaign...');
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 3000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      onProgress?.(80, 'Processing campaign content...');
      
      const data = await response.json();
      const campaignContent = data.choices[0].message.content;

      onProgress?.(90, 'Finalizing campaign...');
      
      return {
        type: 'email-campaign',
        content: campaignContent,
        metadata: {
          industry,
          campaignType,
          targetAudience,
          generatedAt: new Date(),
          tokensUsed: data.usage?.total_tokens || 0
        }
      };
      
    } catch (error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid OpenAI API key. Please check your key and try again.');
      }
      throw error;
    }
  }

  async _runSalesGenerator(params, onProgress) {
    const { industry, salesType, targetPersona, productService, painPoints } = params;
    
    onProgress?.(10, 'Validating inputs...');
    const openaiKey = apiKeyManager.getKey('openai');
    if (!openaiKey) {
      throw new Error('OpenAI API key is required');
    }

    onProgress?.(30, 'Analyzing sales persona...');
    
    const systemPrompt = `You are a sales expert who creates high-converting sales content and scripts.`;
    
    const userPrompt = `
Create a comprehensive sales content package for:

Industry: ${industry}
Sales Type: ${salesType}
Target Persona: ${targetPersona}
Product/Service: ${productService}
Pain Points: ${painPoints}

Please provide:
1. Sales script/pitch (opening, discovery, presentation, objection handling, close)
2. Follow-up sequence (3 touchpoints)
3. Common objections and responses
4. Value proposition framework
5. Social proof examples
6. Closing techniques

Format as structured content with clear sections.
`;

    onProgress?.(60, 'Generating sales content...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    onProgress?.(90, 'Formatting sales materials...');
    
    const data = await response.json();
    
    return {
      type: 'sales-content',
      content: data.choices[0].message.content,
      metadata: {
        industry,
        salesType,
        targetPersona,
        generatedAt: new Date(),
        tokensUsed: data.usage?.total_tokens || 0
      }
    };
  }

  async _runNotionBuilder(params, onProgress) {
    const { projectType, teamSize, timeline, requirements } = params;
    
    onProgress?.(10, 'Checking API access...');
    const openaiKey = apiKeyManager.getKey('openai');
    const notionKey = apiKeyManager.getKey('notion');
    
    if (!openaiKey) {
      throw new Error('OpenAI API key is required');
    }

    onProgress?.(25, 'Designing project structure...');
    
    const systemPrompt = `You are a project management expert who creates detailed Notion workspace templates.`;
    
    const userPrompt = `
Create a comprehensive Notion project template for:

Project Type: ${projectType}
Team Size: ${teamSize}
Timeline: ${timeline}
Requirements: ${requirements}

Please provide:
1. Database schemas (with properties and types)
2. Page templates and structures
3. Workflow automation suggestions
4. Team collaboration features
5. Progress tracking systems
6. Template setup instructions

${notionKey ? 'Include specific Notion API calls for setup.' : 'Provide manual setup instructions.'}

Format as detailed implementation guide.
`;

    onProgress?.(50, 'Generating project template...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    onProgress?.(80, 'Creating template structure...');
    
    const data = await response.json();
    
    // If Notion API key is available, could create actual workspace here
    if (notionKey) {
      onProgress?.(95, 'Setting up Notion workspace...');
      // Future: Actual Notion API integration
    }
    
    return {
      type: 'notion-template',
      content: data.choices[0].message.content,
      metadata: {
        projectType,
        teamSize,
        timeline,
        hasNotionIntegration: !!notionKey,
        generatedAt: new Date(),
        tokensUsed: data.usage?.total_tokens || 0
      }
    };
  }

  getExecutionHistory() {
    return this.executionHistory.slice(-10); // Return last 10 executions
  }

  isCurrentlyExecuting() {
    return this.isExecuting;
  }
}

export const agentExecutor = new AgentExecutor();