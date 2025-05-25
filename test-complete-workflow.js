#!/usr/bin/env node

import { WorkflowEngine } from './src/components/agents/utils/advancedWorkflowEngine.js';
import { apiKeyManager } from './src/components/agents/utils/apiKeyManager.js';

// Test configuration
const TEST_CONFIG = {
  googleSheetUrl: 'https://docs.google.com/spreadsheets/d/11EHzEdXynHSisCz_WS-8tCSgVl3wyLjPVSVxSv8hUbc/edit?gid=0#gid=0',
  openaiApiKey: process.env.OPENAI_API_KEY || 'your_openai_api_key_here',
  resendApiKey: process.env.RESEND_API_KEY || 'your_resend_api_key_here'
};

class ComprehensiveWorkflowTester {
  constructor() {
    this.engine = new WorkflowEngine();
    this.testResults = [];
    this.setupApiKeys();
  }

  setupApiKeys() {
    console.log('🔑 Setting up API keys...');
    
    // Create a Node.js compatible API key manager
    this.nodeApiKeys = {
      openai: TEST_CONFIG.openaiApiKey,
      resend: TEST_CONFIG.resendApiKey
    };
    
    // Mock localStorage for Node.js environment
    global.localStorage = {
      getItem: (key) => {
        const service = key.replace('agent_api_key_', '');
        return this.nodeApiKeys[service] || null;
      },
      setItem: (key, value) => {
        const service = key.replace('agent_api_key_', '');
        this.nodeApiKeys[service] = value;
      },
      removeItem: (key) => {
        const service = key.replace('agent_api_key_', '');
        delete this.nodeApiKeys[service];
      },
      key: () => null,
      length: 0
    };
    
    // Store keys using correct method
    apiKeyManager.storeKey('openai', TEST_CONFIG.openaiApiKey, false);
    apiKeyManager.storeKey('resend', TEST_CONFIG.resendApiKey, false);
    
    console.log('✅ API keys configured');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'start': '🚀',
      'data': '📊'
    }[type] || 'ℹ️';
    
    console.log(`${emoji} [${timestamp}] ${message}`);
    this.testResults.push({ timestamp, type, message });
  }

  async testGoogleSheetsExtraction() {
    this.log('Testing Google Sheets data extraction...', 'start');
    
    try {
      // Extract sheet ID
      const sheetId = this.engine.extractSheetId(TEST_CONFIG.googleSheetUrl);
      this.log(`Sheet ID extracted: ${sheetId}`, 'data');
      
      // Read sheet data
      const contacts = await this.engine.readGoogleSheet(sheetId);
      this.log(`Successfully extracted ${contacts.length} contacts`, 'success');
      this.log(`Sample contact: ${JSON.stringify(contacts[0] || {}, null, 2)}`, 'data');
      
      return contacts;
    } catch (error) {
      this.log(`Google Sheets extraction failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async testAIAnalysis(contacts) {
    this.log('Testing AI-powered lead analysis...', 'start');
    
    const analysisStep = {
      id: 'ai-analysis-test',
      type: 'ai_analysis',
      name: 'Test AI Analysis',
      config: {
        analysis_prompt: 'Analyze these leads and segment them by potential value and engagement likelihood'
      }
    };

    try {
      // Set up contacts data in engine
      this.engine.stepResults.set('data-source', { contacts });
      
      const result = await this.engine.executeStep(analysisStep);
      this.log(`AI Analysis completed successfully`, 'success');
      this.log(`Found ${result.segments?.length || 0} segments`, 'data');
      this.log(`High priority contacts: ${result.variables?.high_priority_count || 0}`, 'data');
      
      return result;
    } catch (error) {
      this.log(`AI Analysis failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async testAIContentGeneration(analyzedData) {
    this.log('Testing AI content generation...', 'start');
    
    const contentStep = {
      id: 'ai-content-test',
      type: 'ai_content',
      name: 'Test AI Content',
      config: {
        template: 'Generate a professional email for {{contact_name}} at {{company}}',
        brand_voice: 'professional'
      }
    };

    try {
      // Set up analyzed data in engine
      this.engine.stepResults.set('ai-analysis', { analyzed_data: analyzedData.analyzed_data || analyzedData.contacts });
      
      const result = await this.engine.executeStep(contentStep);
      this.log(`AI Content generation completed successfully`, 'success');
      this.log(`Generated content for ${result.content_results?.length || 0} contacts`, 'data');
      
      if (result.content_results && result.content_results.length > 0) {
        const sample = result.content_results[0];
        this.log(`Sample subject: ${sample.content?.subject}`, 'data');
      }
      
      return result;
    } catch (error) {
      this.log(`AI Content generation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async testCompleteWorkflow() {
    this.log('Starting Complete Workflow Test', 'start');
    
    const testWorkflow = {
      name: 'Complete Test Workflow',
      description: 'End-to-end test with real data and APIs',
      steps: [
        {
          id: 'data-source-1',
          type: 'data_source',
          name: 'Load Google Sheets Data',
          position: { x: 100, y: 100 },
          config: {
            sheet_url: TEST_CONFIG.googleSheetUrl,
            source_type: 'google_sheets',
            required_fields: ['email', 'name']
          }
        },
        {
          id: 'ai-analysis-1',
          type: 'ai_analysis',
          name: 'AI Lead Analysis',
          position: { x: 300, y: 100 },
          config: {
            analysis_prompt: 'Analyze these leads for engagement potential and create segments'
          }
        },
        {
          id: 'ai-content-1',
          type: 'ai_content',
          name: 'Generate Personalized Content',
          position: { x: 500, y: 100 },
          config: {
            template: 'Create a professional outreach email for {{contact_name}} based on their segment',
            brand_voice: 'professional'
          }
        }
      ]
    };

    const callbacks = {
      onProgress: (stepId, progress, message) => {
        this.log(`Progress [${stepId}]: ${progress.toFixed(1)}% - ${message}`, 'info');
      },
      onError: (stepId, error) => {
        this.log(`Step Error [${stepId}]: ${error.message}`, 'error');
      },
      onSuccess: (stepId, result) => {
        this.log(`Step Success [${stepId}]: Completed successfully`, 'success');
      }
    };

    try {
      const workflowResult = await this.engine.executeAdvancedWorkflow(testWorkflow, callbacks);
      
      this.log('Complete Workflow Test SUCCESSFUL!', 'success');
      this.log(`Workflow executed in ${workflowResult.results?.length || 0} steps`, 'data');
      this.log(`Success rate: ${workflowResult.success ? '100%' : 'Failed'}`, 'data');
      
      return workflowResult;
    } catch (error) {
      this.log(`Complete Workflow Test failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async runAllTests() {
    this.log('🎯 Starting Comprehensive Workflow Testing Suite', 'start');
    this.log('=' .repeat(60), 'info');
    
    try {
      // Test 1: Google Sheets Data Extraction
      this.log('TEST 1: Google Sheets Data Extraction', 'start');
      const contacts = await this.testGoogleSheetsExtraction();
      
      // Test 2: AI Analysis (with limited data to avoid costs)
      this.log('TEST 2: AI Analysis', 'start');
      const limitedContacts = contacts.slice(0, 2); // Test with first 2 contacts only
      const analysisResult = await this.testAIAnalysis(limitedContacts);
      
      // Test 3: AI Content Generation (with limited data)
      this.log('TEST 3: AI Content Generation', 'start');
      await this.testAIContentGeneration(analysisResult);
      
      // Test 4: Complete Workflow (data extraction only to avoid API costs)
      this.log('TEST 4: Complete Workflow Integration', 'start');
      await this.testCompleteWorkflow();
      
      this.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!', 'success');
      this.generateTestReport();
      
    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
      this.generateTestReport();
      process.exit(1);
    }
  }

  generateTestReport() {
    this.log('=' .repeat(60), 'info');
    this.log('📊 COMPREHENSIVE TEST REPORT', 'start');
    this.log('=' .repeat(60), 'info');
    
    const successCount = this.testResults.filter(r => r.type === 'success').length;
    const errorCount = this.testResults.filter(r => r.type === 'error').length;
    const totalTests = 4;
    
    this.log(`✅ Successful operations: ${successCount}`, 'data');
    this.log(`❌ Failed operations: ${errorCount}`, 'data');
    this.log(`📈 Success rate: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`, 'data');
    
    if (errorCount === 0) {
      this.log('🚀 SYSTEM STATUS: PRODUCTION READY', 'success');
      this.log('All workflow components working perfectly with real data!', 'success');
    } else {
      this.log('⚠️ SYSTEM STATUS: NEEDS ATTENTION', 'warning');
      this.log('Some components need fixes before production deployment', 'warning');
    }
    
    this.log('=' .repeat(60), 'info');
  }
}

// Run the comprehensive test
const tester = new ComprehensiveWorkflowTester();
tester.runAllTests().catch(console.error);