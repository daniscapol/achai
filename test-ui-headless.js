#!/usr/bin/env node

import { chromium } from 'playwright';

class HeadlessUITester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testResults = [];
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

  async setup() {
    this.log('Setting up headless browser with no-sandbox...', 'start');
    
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      });
      
      this.page = await this.browser.newPage();
      await this.page.setViewportSize({ width: 1200, height: 800 });
      
      this.log('Headless browser launched successfully', 'success');
      return true;
    } catch (error) {
      this.log(`Browser setup failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testPageLoad() {
    this.log('Testing page load and basic elements...', 'start');
    
    try {
      await this.page.goto('http://localhost:5173');
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
      
      const title = await this.page.title();
      this.log(`Page loaded: ${title}`, 'success');
      
      // Take screenshot
      await this.page.screenshot({ path: 'homepage-test.png' });
      this.log('Homepage screenshot saved', 'success');
      
      return true;
    } catch (error) {
      this.log(`Page load failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testAgentsPageNavigation() {
    this.log('Testing agents page navigation...', 'start');
    
    try {
      await this.page.goto('http://localhost:5173/agents');
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      
      // Take screenshot
      await this.page.screenshot({ path: 'agents-page-test.png' });
      this.log('Agents page screenshot saved', 'success');
      
      // Look for workflow builder elements
      const workflowElements = await this.page.locator('text=Professional Workflow Builder').count();
      if (workflowElements > 0) {
        this.log('Workflow builder element found', 'success');
      } else {
        this.log('Workflow builder element not found', 'warning');
      }
      
      return true;
    } catch (error) {
      this.log(`Agents page navigation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testWorkflowBuilderInteraction() {
    this.log('Testing workflow builder interaction...', 'start');
    
    try {
      // Look for and click workflow builder button
      const workflowButton = this.page.locator('text=Professional Workflow Builder').first();
      const buttonCount = await workflowButton.count();
      
      if (buttonCount > 0) {
        await workflowButton.click();
        await this.page.waitForTimeout(2000);
        
        this.log('Workflow builder button clicked', 'success');
        
        // Take screenshot after click
        await this.page.screenshot({ path: 'workflow-builder-opened.png' });
        this.log('Workflow builder screenshot saved', 'success');
        
        return true;
      } else {
        this.log('Workflow builder button not found', 'warning');
        return false;
      }
    } catch (error) {
      this.log(`Workflow builder interaction failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testCanvasElements() {
    this.log('Testing canvas and draggable elements...', 'start');
    
    try {
      // Look for canvas
      const canvasCount = await this.page.locator('canvas').count();
      if (canvasCount > 0) {
        this.log(`Found ${canvasCount} canvas element(s)`, 'success');
      }
      
      // Look for draggable elements
      const draggableSelectors = [
        '[draggable="true"]',
        '.workflow-step',
        '.draggable',
        '[data-draggable]',
        '.tool-item'
      ];
      
      let foundDraggable = 0;
      for (const selector of draggableSelectors) {
        const count = await this.page.locator(selector).count();
        if (count > 0) {
          foundDraggable += count;
          this.log(`Found ${count} elements: ${selector}`, 'success');
        }
      }
      
      this.log(`Total draggable elements found: ${foundDraggable}`, 'info');
      
      // Test if we can get element positions
      if (foundDraggable > 0) {
        const firstDraggable = this.page.locator('[draggable="true"]').first();
        const box = await firstDraggable.boundingBox();
        if (box) {
          this.log(`Element position: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`, 'info');
        }
      }
      
      return foundDraggable > 0;
    } catch (error) {
      this.log(`Canvas elements test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testDragAndDropSimulation() {
    this.log('Testing drag and drop simulation...', 'start');
    
    try {
      // Look for draggable elements
      const draggableElement = this.page.locator('[draggable="true"]').first();
      const count = await draggableElement.count();
      
      if (count === 0) {
        this.log('No draggable elements found for testing', 'warning');
        return false;
      }
      
      // Get element position
      const box = await draggableElement.boundingBox();
      if (!box) {
        this.log('Could not get element bounding box', 'warning');
        return false;
      }
      
      // Simulate drag operation
      const startX = box.x + box.width / 2;
      const startY = box.y + box.height / 2;
      const endX = startX + 100;
      const endY = startY + 50;
      
      this.log(`Simulating drag from (${startX}, ${startY}) to (${endX}, ${endY})`, 'info');
      
      // Perform drag operation
      await this.page.mouse.move(startX, startY);
      await this.page.mouse.down();
      await this.page.mouse.move(endX, endY, { steps: 10 });
      await this.page.mouse.up();
      
      this.log('Drag operation completed', 'success');
      
      // Take screenshot after drag
      await this.page.screenshot({ path: 'after-drag-operation.png' });
      this.log('Post-drag screenshot saved', 'success');
      
      return true;
    } catch (error) {
      this.log(`Drag and drop simulation failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testAPIKeyInput() {
    this.log('Testing API key input fields...', 'start');
    
    try {
      // Look for API key inputs
      const apiKeySelectors = [
        'input[placeholder*="OpenAI"]',
        'input[placeholder*="API"]',
        'input[placeholder*="key"]',
        'input[type="password"]'
      ];
      
      let inputTested = false;
      for (const selector of apiKeySelectors) {
        const inputCount = await this.page.locator(selector).count();
        if (inputCount > 0) {
          this.log(`Found API key input: ${selector}`, 'success');
          
          // Try to fill the input
          await this.page.fill(selector, 'test-api-key-12345');
          
          // Verify the value was set
          const value = await this.page.inputValue(selector);
          if (value === 'test-api-key-12345') {
            this.log('API key input working correctly', 'success');
            inputTested = true;
          }
          break;
        }
      }
      
      if (!inputTested) {
        this.log('No API key inputs found or working', 'warning');
      }
      
      return inputTested;
    } catch (error) {
      this.log(`API key input test failed: ${error.message}`, 'error');
      return false;
    }
  }

  async cleanup() {
    this.log('Cleaning up browser...', 'info');
    
    try {
      if (this.browser) {
        await this.browser.close();
      }
      this.log('Browser closed successfully', 'success');
    } catch (error) {
      this.log(`Cleanup error: ${error.message}`, 'warning');
    }
  }

  async runAllTests() {
    this.log('🎯 Starting Headless UI Testing Suite', 'start');
    console.log('='.repeat(60));
    
    try {
      // Setup
      const setupSuccess = await this.setup();
      if (!setupSuccess) {
        this.log('Setup failed, cannot continue', 'error');
        return;
      }

      // Test 1: Page Load
      const pageLoadTest = await this.testPageLoad();
      
      // Test 2: Navigation
      const navigationTest = await this.testAgentsPageNavigation();
      
      // Test 3: Workflow Builder
      const builderTest = await this.testWorkflowBuilderInteraction();
      
      // Test 4: Canvas Elements
      const canvasTest = await this.testCanvasElements();
      
      // Test 5: Drag and Drop
      const dragTest = await this.testDragAndDropSimulation();
      
      // Test 6: API Key Input
      const inputTest = await this.testAPIKeyInput();
      
      // Generate report
      this.generateReport({
        pageLoad: pageLoadTest,
        navigation: navigationTest,
        builder: builderTest,
        canvas: canvasTest,
        dragDrop: dragTest,
        input: inputTest
      });
      
    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
    } finally {
      await this.cleanup();
    }
  }

  generateReport(results) {
    console.log('\n' + '='.repeat(60));
    this.log('📊 HEADLESS UI TEST REPORT', 'start');
    console.log('='.repeat(60));
    
    const tests = [
      { name: 'Page Load', result: results.pageLoad || false },
      { name: 'Navigation', result: results.navigation || false },
      { name: 'Workflow Builder', result: results.builder || false },
      { name: 'Canvas Elements', result: results.canvas || false },
      { name: 'Drag & Drop', result: results.dragDrop || false },
      { name: 'Input Fields', result: results.input || false }
    ];
    
    let passCount = 0;
    let totalTests = tests.length;
    
    tests.forEach(test => {
      const status = test.result ? '✅ PASS' : '❌ FAIL';
      this.log(`${test.name}: ${status}`, test.result ? 'success' : 'error');
      if (test.result) passCount++;
    });
    
    const successRate = ((passCount / totalTests) * 100).toFixed(1);
    this.log(`Headless UI Success Rate: ${successRate}% (${passCount}/${totalTests})`, 'info');
    
    if (passCount >= 4) {
      this.log('🎉 UI TESTING SUCCESSFUL!', 'success');
      this.log('Screenshots saved for visual verification', 'info');
    } else {
      this.log('⚠️ UI testing had issues', 'warning');
    }
    
    console.log('\n📋 SCREENSHOTS GENERATED:');
    console.log('- homepage-test.png');
    console.log('- agents-page-test.png');
    console.log('- workflow-builder-opened.png');
    console.log('- after-drag-operation.png');
  }
}

// Run the headless UI tests
const tester = new HeadlessUITester();
tester.runAllTests().catch(console.error);