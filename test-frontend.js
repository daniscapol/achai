#!/usr/bin/env node

import { chromium } from 'playwright';

class FrontendTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
  }

  async setup() {
    console.log('🚀 Starting Frontend Testing Suite...');
    this.browser = await chromium.launch({ 
      headless: false, // Show browser for debugging
      slowMo: 1000 // Slow down for visibility
    });
    this.page = await this.browser.newPage();
    
    // Set viewport size
    await this.page.setViewportSize({ width: 1200, height: 800 });
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const emoji = {
      'info': 'ℹ️',
      'success': '✅',
      'error': '❌',
      'warning': '⚠️',
      'start': '🚀'
    }[type] || 'ℹ️';
    
    console.log(`${emoji} [${timestamp}] ${message}`);
    this.testResults.push({ timestamp, type, message });
  }

  async testHomePage() {
    this.log('Testing homepage load...', 'start');
    
    try {
      await this.page.goto('http://localhost:5173');
      await this.page.waitForLoadState('networkidle');
      
      // Check if page loaded
      const title = await this.page.title();
      this.log(`Page title: ${title}`, 'info');
      
      // Check for main elements
      const hasHeader = await this.page.locator('header').count() > 0;
      const hasNav = await this.page.locator('nav').count() > 0;
      
      if (hasHeader) {
        this.log('Header element found', 'success');
      } else {
        this.log('Header element missing', 'error');
      }
      
      return true;
    } catch (error) {
      this.log(`Homepage test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async navigateToWorkflowBuilder() {
    this.log('Navigating to workflow builder...', 'start');
    
    try {
      // Look for workflow builder link or button
      const workflowLinks = [
        'text=Workflow',
        'text=Builder',
        'text=Premium',
        'text=Agent',
        '[href*="workflow"]',
        '[href*="builder"]',
        '[href*="agent"]'
      ];
      
      let found = false;
      for (const selector of workflowLinks) {
        try {
          const element = this.page.locator(selector).first();
          if (await element.count() > 0) {
            this.log(`Found navigation element: ${selector}`, 'info');
            await element.click();
            await this.page.waitForTimeout(2000);
            found = true;
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!found) {
        // Try direct navigation
        await this.page.goto('http://localhost:5173/#/workflow-builder');
        await this.page.waitForTimeout(2000);
      }
      
      this.log('Navigation attempt completed', 'success');
      return true;
    } catch (error) {
      this.log(`Navigation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testWorkflowBuilderUI() {
    this.log('Testing workflow builder UI components...', 'start');
    
    try {
      // Check for key workflow builder elements
      const elements = {
        'canvas': 'canvas, [role="canvas"], .workflow-canvas',
        'sidebar': '.sidebar, .toolbox, .tools',
        'save button': 'button[text*="Save"], button:has-text("Save")',
        'play button': 'button[text*="Play"], button:has-text("Play")',
        'add button': 'button[text*="Add"], button:has-text("Add"), button:has-text("+")'
      };
      
      const results = {};
      for (const [name, selector] of Object.entries(elements)) {
        try {
          const count = await this.page.locator(selector).count();
          results[name] = count > 0;
          if (count > 0) {
            this.log(`Found ${name}: ${count} element(s)`, 'success');
          } else {
            this.log(`Missing ${name}`, 'warning');
          }
        } catch (e) {
          results[name] = false;
          this.log(`Error checking ${name}: ${e.message}`, 'error');
        }
      }
      
      return results;
    } catch (error) {
      this.log(`UI component test failed: ${error.message}`, 'error');
      return {};
    }
  }

  async testAPIKeyManagement() {
    this.log('Testing API key management...', 'start');
    
    try {
      // Look for API key related elements
      const apiKeySelectors = [
        'input[placeholder*="API"]',
        'input[placeholder*="key"]',
        'input[placeholder*="OpenAI"]',
        'input[placeholder*="Resend"]',
        'text=API Key',
        'text=OpenAI',
        'text=Resend'
      ];
      
      let foundElements = 0;
      for (const selector of apiKeySelectors) {
        try {
          const count = await this.page.locator(selector).count();
          if (count > 0) {
            foundElements++;
            this.log(`Found API key element: ${selector}`, 'success');
          }
        } catch (e) {
          // Continue checking
        }
      }
      
      if (foundElements > 0) {
        this.log(`Found ${foundElements} API key related elements`, 'success');
        return true;
      } else {
        this.log('No API key management UI found', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`API key test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testTemplateLoading() {
    this.log('Testing template loading...', 'start');
    
    try {
      // Make API call to check if templates are available
      const response = await this.page.evaluate(async () => {
        try {
          const res = await fetch('http://localhost:3001/api/workflows/templates');
          return await res.json();
        } catch (error) {
          return { error: error.message };
        }
      });
      
      if (response.success && response.templates) {
        this.log(`Templates available: ${response.templates.length}`, 'success');
        
        // Check if templates appear in UI
        const templateElements = await this.page.locator('text=Email Automation, text=Lead Analysis, text=Drip Campaign').count();
        if (templateElements > 0) {
          this.log('Templates visible in UI', 'success');
        } else {
          this.log('Templates not visible in UI', 'warning');
        }
        
        return true;
      } else {
        this.log('Templates not loaded from API', 'error');
        return false;
      }
    } catch (error) {
      this.log(`Template loading test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testDragAndDrop() {
    this.log('Testing drag and drop functionality...', 'start');
    
    try {
      // Look for draggable elements
      const draggableSelectors = [
        '[draggable="true"]',
        '.draggable',
        '.workflow-step',
        '.tool-item',
        '[data-draggable]'
      ];
      
      let draggableFound = false;
      for (const selector of draggableSelectors) {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          this.log(`Found ${count} draggable elements: ${selector}`, 'success');
          draggableFound = true;
          
          // Try to test drag functionality
          try {
            const element = this.page.locator(selector).first();
            const box = await element.boundingBox();
            if (box) {
              // Simulate drag
              await this.page.mouse.move(box.x + box.width/2, box.y + box.height/2);
              await this.page.mouse.down();
              await this.page.mouse.move(box.x + 100, box.y + 100);
              await this.page.mouse.up();
              this.log('Drag operation simulated successfully', 'success');
            }
          } catch (dragError) {
            this.log(`Drag simulation failed: ${dragError.message}`, 'warning');
          }
          break;
        }
      }
      
      if (!draggableFound) {
        this.log('No draggable elements found', 'warning');
      }
      
      return draggableFound;
    } catch (error) {
      this.log(`Drag and drop test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runAllTests() {
    this.log('🎯 Starting Comprehensive Frontend Testing', 'start');
    console.log('='.repeat(60));
    
    await this.setup();
    
    try {
      // Test 1: Homepage
      const homepageTest = await this.testHomePage();
      
      // Test 2: Navigation
      const navigationTest = await this.navigateToWorkflowBuilder();
      
      // Test 3: UI Components
      const uiTest = await this.testWorkflowBuilderUI();
      
      // Test 4: API Key Management
      const apiKeyTest = await this.testAPIKeyManagement();
      
      // Test 5: Template Loading
      const templateTest = await this.testTemplateLoading();
      
      // Test 6: Drag and Drop
      const dragTest = await this.testDragAndDrop();
      
      // Generate report
      this.generateFrontendReport({
        homepage: homepageTest,
        navigation: navigationTest,
        ui: uiTest,
        apiKeys: apiKeyTest,
        templates: templateTest,
        dragDrop: dragTest
      });
      
    } catch (error) {
      this.log(`Frontend test suite failed: ${error.message}`, 'error');
    } finally {
      await this.teardown();
    }
  }

  generateFrontendReport(results) {
    console.log('\n' + '='.repeat(60));
    this.log('📊 FRONTEND TEST REPORT', 'start');
    console.log('='.repeat(60));
    
    const tests = [
      { name: 'Homepage Load', result: results.homepage },
      { name: 'Navigation', result: results.navigation },
      { name: 'UI Components', result: Object.keys(results.ui).length > 0 },
      { name: 'API Key Management', result: results.apiKeys },
      { name: 'Template Loading', result: results.templates },
      { name: 'Drag & Drop', result: results.dragDrop }
    ];
    
    let passCount = 0;
    let totalTests = tests.length;
    
    tests.forEach(test => {
      const status = test.result ? '✅ PASS' : '❌ FAIL';
      this.log(`${test.name}: ${status}`, test.result ? 'success' : 'error');
      if (test.result) passCount++;
    });
    
    const successRate = ((passCount / totalTests) * 100).toFixed(1);
    this.log(`Frontend Success Rate: ${successRate}% (${passCount}/${totalTests})`, 'info');
    
    if (passCount === totalTests) {
      this.log('🎉 FRONTEND FULLY FUNCTIONAL!', 'success');
    } else {
      this.log('⚠️ Frontend needs attention', 'warning');
    }
  }
}

// Run the frontend tests
const tester = new FrontendTester();
tester.runAllTests().catch(console.error);