import { apiKeyManager } from './apiKeyManager.js';

export class WorkflowEngine {
  constructor() {
    this.isRunning = false;
    this.workflows = new Map();
    this.executionHistory = [];
    this.variables = new Map();
    this.stepResults = new Map();
  }

  async executeAdvancedWorkflow(workflow, callbacks = {}) {
    if (this.isRunning) {
      throw new Error('Another workflow is already running');
    }

    this.isRunning = true;
    const workflowId = Date.now();
    const { onProgress, onError, onSuccess } = callbacks;
    
    try {
      onProgress?.('workflow', 0, 'Initializing advanced workflow...');
      
      // Initialize workflow variables
      this.variables.clear();
      this.stepResults.clear();
      
      // Set default variables
      this.setVariable('workflow_id', workflowId);
      this.setVariable('execution_time', new Date().toISOString());
      
      // Execute steps in order with AI decision making
      let currentStepIndex = 0;
      const results = [];
      
      while (currentStepIndex < workflow.steps.length) {
        const step = workflow.steps[currentStepIndex];
        
        try {
          onProgress?.(step.id, (currentStepIndex / workflow.steps.length) * 100, `Executing ${step.name}...`);
          
          const stepResult = await this.executeStep(step, workflow);
          
          // Store step results for next steps
          this.stepResults.set(step.id, stepResult);
          
          // Update variables from step output
          if (stepResult.variables) {
            Object.entries(stepResult.variables).forEach(([key, value]) => {
              this.setVariable(key, value);
            });
          }
          
          results.push({
            stepId: step.id,
            stepName: step.name,
            success: true,
            result: stepResult,
            timestamp: new Date()
          });
          
          onSuccess?.(step.id, stepResult);
          
          // AI-powered next step decision
          if (stepResult.nextStepOverride) {
            const nextStepId = stepResult.nextStepOverride;
            currentStepIndex = workflow.steps.findIndex(s => s.id === nextStepId);
            if (currentStepIndex === -1) break;
          } else {
            currentStepIndex++;
          }
          
        } catch (error) {
          console.error(`Step ${step.name} failed:`, error);
          onError?.(step.id, error);
          
          results.push({
            stepId: step.id,
            stepName: step.name,
            success: false,
            error: error.message,
            timestamp: new Date()
          });
          
          // Check if workflow should continue on error
          if (!step.config.continueOnError) {
            break;
          }
          currentStepIndex++;
        }
      }
      
      onProgress?.('workflow', 100, 'Workflow completed successfully');
      
      const workflowResult = {
        workflowId,
        success: results.every(r => r.success),
        stepsExecuted: results.length,
        results,
        variables: Object.fromEntries(this.variables),
        timestamp: new Date()
      };
      
      this.executionHistory.push(workflowResult);
      return workflowResult;
      
    } finally {
      this.isRunning = false;
    }
  }

  async executeStep(step, workflow) {
    switch (step.type) {
      case 'data_source':
        return await this.executeDataSource(step);
      case 'ai_analysis':
        return await this.executeAIAnalysis(step);
      case 'ai_content':
        return await this.executeAIContent(step);
      case 'condition':
        return await this.executeCondition(step);
      case 'email_send':
        return await this.executeEmailSend(step);
      case 'wait_delay':
        return await this.executeWaitDelay(step);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  async executeDataSource(step) {
    const { sheet_url, api_endpoint, csv_file } = step.config;
    
    if (sheet_url) {
      // Extract sheet ID from URL
      const sheetId = this.extractSheetId(sheet_url);
      const contacts = await this.readGoogleSheet(sheetId);
      
      return {
        type: 'data_source',
        contacts,
        count: contacts.length,
        variables: {
          'data_count': contacts.length,
          'data_source': 'google_sheets'
        }
      };
    }
    
    throw new Error('No valid data source configured');
  }

  async executeAIAnalysis(step) {
    const openaiKey = apiKeyManager.getKey('openai');
    if (!openaiKey) {
      throw new Error('OpenAI API key required for AI Analysis');
    }

    // Get data from previous steps
    const inputData = this.getPreviousStepData('contacts') || this.getPreviousStepData('data');
    if (!inputData) {
      throw new Error('No input data found for AI analysis');
    }

    const analysisPrompt = step.config.analysis_prompt || 'Analyze this data and provide insights';
    
    const prompt = `
You are an expert data analyst. Analyze the following contact data and provide insights:

Data: ${JSON.stringify(inputData.slice(0, 5))} ${inputData.length > 5 ? `... and ${inputData.length - 5} more contacts` : ''}

Analysis Request: ${analysisPrompt}

Provide analysis in this JSON format:
{
  "segments": [
    {
      "name": "segment name",
      "criteria": "criteria used",
      "count": number,
      "characteristics": ["trait1", "trait2"]
    }
  ],
  "insights": [
    "key insight 1",
    "key insight 2"
  ],
  "recommendations": [
    "recommendation 1",
    "recommendation 2"
  ],
  "priority_contacts": [
    {
      "email": "contact email",
      "reason": "why this contact is priority",
      "score": number_out_of_100
    }
  ]
}
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json();
      const analysis = JSON.parse(data.choices[0].message.content);
      
      // Enhance input data with analysis
      const analyzedData = inputData.map(contact => {
        const priorityContact = analysis.priority_contacts?.find(p => p.email === contact.email);
        return {
          ...contact,
          analysis: {
            priority_score: priorityContact?.score || 50,
            priority_reason: priorityContact?.reason || 'Standard contact',
            segment: this.determineSegment(contact, analysis.segments)
          }
        };
      });

      return {
        type: 'ai_analysis',
        analyzed_data: analyzedData,
        segments: analysis.segments,
        insights: analysis.insights,
        recommendations: analysis.recommendations,
        variables: {
          'analysis_complete': true,
          'segments_count': analysis.segments?.length || 0,
          'high_priority_count': analysis.priority_contacts?.filter(p => p.score > 80).length || 0
        }
      };
      
    } catch (error) {
      throw new Error(`AI Analysis failed: ${error.message}`);
    }
  }

  async executeAIContent(step) {
    const openaiKey = apiKeyManager.getKey('openai');
    if (!openaiKey) {
      throw new Error('OpenAI API key required for AI Content Generation');
    }

    // Get analyzed data from previous steps
    const analyzedData = this.getPreviousStepData('analyzed_data') || this.getPreviousStepData('contacts');
    if (!analyzedData) {
      throw new Error('No contact data found for content generation');
    }

    const template = step.config.template || 'Generate personalized content for {{contact_name}}';
    const brandVoice = step.config.brand_voice || 'professional';
    
    const contentResults = [];
    
    // Generate content for each contact
    for (const contact of analyzedData) {
      const personalizedPrompt = this.replaceVariables(template, {
        contact_name: contact.name || 'there',
        company: contact.company || 'your company',
        email: contact.email,
        context: contact.context || '',
        priority_score: contact.analysis?.priority_score || 50,
        segment: contact.analysis?.segment || 'general'
      });

      const prompt = `
Create a highly professional and personalized sales email for this prospect:

Contact Details:
- Name: ${contact.name || 'Valued Prospect'}
- Company: ${contact.company || 'their company'}
- Email: ${contact.email}
- Context: ${contact.context || 'General inquiry'}
- Priority Score: ${contact.analysis?.priority_score || 50}/100
- Segment: ${contact.analysis?.segment || 'general'}

Brand Voice: ${brandVoice}
Content Request: ${personalizedPrompt}

PRODUCT FOCUS: AI Agent Email Workflow System
- Saves 40+ hours per week on email marketing
- AI-powered personalization and automation
- Currently offering Early Black Friday discount
- Professional SaaS solution for scaling businesses

Create a compelling email that:
1. Opens with personalized greeting using their name
2. References their company/context naturally
3. Presents our AI workflow system as the solution to their email marketing challenges
4. Emphasizes the 40+ hours weekly time savings
5. Creates urgency with the Early Black Friday offer
6. Includes social proof and credibility elements
7. Ends with a clear, compelling call-to-action
8. Matches the ${brandVoice} brand voice

Format as JSON:
{
  "subject": "compelling subject line that mentions time savings",
  "body": "full professional email body with greeting, value prop, social proof, offer, and signature",
  "preview_text": "email preview text that appears in inbox",
  "cta_primary": "main call to action text",
  "cta_url": "suggested landing page or booking link",
  "personalization_score": number_out_of_100
}
`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.8,
            max_tokens: 1500
          })
        });

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        
        contentResults.push({
          contact: contact,
          content: content,
          generated_at: new Date()
        });
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`Content generation failed for ${contact.email}:`, error);
        contentResults.push({
          contact: contact,
          content: {
            subject: `Exclusive AI Workflow Offer for ${contact.name || 'You'}`,
            body: `Hi ${contact.name || 'there'},\n\nI wanted to reach out about our AI Agent Email Workflow system that's helping businesses save 40+ hours per week.\n\nWe're currently offering an early Black Friday discount.\n\nInterested in learning more?\n\nBest regards`,
            preview_text: "Save 40+ hours weekly with AI email automation",
            cta_primary: "Learn More",
            cta_url: "#",
            personalization_score: 30
          },
          error: error.message,
          generated_at: new Date()
        });
      }
    }

    return {
      type: 'ai_content',
      content_results: contentResults,
      total_generated: contentResults.length,
      variables: {
        'content_generated': contentResults.length,
        'avg_personalization_score': contentResults.reduce((acc, r) => acc + (r.content.personalization_score || 0), 0) / contentResults.length
      }
    };
  }

  async executeEmailSend(step) {
    const emailService = step.config.email_service || 'resend';
    const fromEmail = step.config.from_email || 'noreply@yourcompany.com';
    
    // Get content from previous steps
    const contentResults = this.getPreviousStepData('content_results');
    if (!contentResults) {
      throw new Error('No email content found for sending');
    }

    const emailKey = apiKeyManager.getKey(emailService);
    if (!emailKey) {
      throw new Error(`${emailService} API key required for sending emails`);
    }

    const sendResults = [];
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    
    for (const contentResult of contentResults) {
      const { contact, content } = contentResult;
      
      try {
        const emailData = {
          to: contact.email,
          subject: content.subject,
          body: content.body,
          name: contact.name || 'Valued Customer',
          from: fromEmail,
          preview_text: content.preview_text
        };

        const response = await fetch(`${API_BASE_URL}/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service: emailService,
            apiKey: emailKey,
            emailData: emailData
          })
        });

        const result = await response.json();
        
        sendResults.push({
          contact: contact,
          success: result.success || false,
          message_id: result.messageId,
          subject: content.subject,
          timestamp: new Date(),
          error: result.error
        });
        
        // Delay between sends to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        sendResults.push({
          contact: contact,
          success: false,
          error: error.message,
          timestamp: new Date()
        });
      }
    }

    const successCount = sendResults.filter(r => r.success).length;
    const errorCount = sendResults.filter(r => !r.success).length;

    return {
      type: 'email_send',
      send_results: sendResults,
      success_count: successCount,
      error_count: errorCount,
      success_rate: (successCount / sendResults.length) * 100,
      variables: {
        'emails_sent': successCount,
        'emails_failed': errorCount,
        'send_success_rate': (successCount / sendResults.length) * 100
      }
    };
  }

  async executeCondition(step) {
    // AI-powered conditional logic
    const conditionLogic = step.config.condition_logic || 'true';
    const inputData = this.getPreviousStepData() || {};
    
    // Safe condition evaluation without eval()
    let result = false;
    try {
      // Replace variables first
      let processedLogic = conditionLogic.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        const value = this.getVariable(varName);
        return value !== null && value !== undefined ? JSON.stringify(value) : 'null';
      });
      
      // Only allow basic boolean operations for security
      if (/^[a-zA-Z0-9\s\(\)&|!<>='"._+-]*$/.test(processedLogic)) {
        // Use Function constructor instead of eval for better security
        result = new Function('return (' + processedLogic + ')')();
      } else {
        console.warn('Condition logic contains unsafe characters, defaulting to false');
        result = false;
      }
    } catch (error) {
      console.error('Condition evaluation error:', error);
      result = false;
    }
    
    return {
      type: 'condition',
      condition_result: result,
      next_path: result ? 'true_path' : 'false_path',
      variables: {
        'condition_result': result
      }
    };
  }

  async executeWaitDelay(step) {
    const duration = step.config.duration || 1000;
    await new Promise(resolve => setTimeout(resolve, duration));
    
    return {
      type: 'wait_delay',
      duration: duration,
      completed_at: new Date(),
      variables: {
        'wait_completed': true
      }
    };
  }

  // Utility methods
  setVariable(key, value) {
    this.variables.set(key, value);
  }

  getVariable(key) {
    return this.variables.get(key);
  }

  getPreviousStepData(dataKey) {
    // Find the most recent step result that contains the requested data
    for (const [stepId, result] of Array.from(this.stepResults.entries()).reverse()) {
      if (dataKey && result[dataKey]) {
        return result[dataKey];
      } else if (!dataKey && result) {
        return result;
      }
    }
    return null;
  }

  replaceVariables(template, variables) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] || this.getVariable(varName) || match;
    });
  }

  extractSheetId(url) {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('Invalid Google Sheets URL');
    }
    return match[1];
  }

  async readGoogleSheet(sheetId) {
    try {
      const publicUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
      const response = await fetch(publicUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch sheet data');
      }
      
      const csvText = await response.text();
      return this.parseCSV(csvText);
    } catch (error) {
      throw new Error(`Failed to read Google Sheet: ${error.message}`);
    }
  }

  parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    const contacts = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      const contact = {};
      
      headers.forEach((header, index) => {
        contact[header] = values[index] || '';
      });
      
      if (contact.email) {
        contacts.push(contact);
      }
    }
    
    return contacts;
  }

  determineSegment(contact, segments) {
    // Simple segment matching logic
    if (!segments) return 'general';
    
    for (const segment of segments) {
      if (segment.criteria && contact.context && 
          contact.context.toLowerCase().includes(segment.criteria.toLowerCase())) {
        return segment.name;
      }
    }
    
    return segments[0]?.name || 'general';
  }
}

export default WorkflowEngine;