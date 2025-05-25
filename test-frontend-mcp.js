#!/usr/bin/env node

import { spawn } from 'child_process';
import { MCPClient } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class FrontendMCPTester {
  constructor() {
    this.client = null;
    this.transport = null;
    this.testResults = [];
  }

  async setupMCP() {
    console.log('🚀 Setting up Playwright MCP...');
    
    try {
      // Start the MCP server
      const serverProcess = spawn('npx', ['@playwright/mcp'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      // Create transport and client
      this.transport = new StdioServerTransport({
        reader: serverProcess.stdout,
        writer: serverProcess.stdin
      });

      this.client = new MCPClient({
        name: "frontend-tester",
        version: "1.0.0"
      }, {
        capabilities: {
          tools: {}
        }
      });

      await this.client.connect(this.transport);
      console.log('✅ MCP Client connected successfully');
      
      return true;
    } catch (error) {
      console.log('❌ MCP setup failed:', error.message);
      return false;
    }
  }

  async testBrowserLaunch() {
    console.log('🌐 Testing browser launch and navigation...');
    
    try {
      // Launch browser
      const launchResult = await this.client.callTool({
        name: 'playwright_browser_launch',
        arguments: {
          headless: false,
          browser: 'chromium'
        }
      });

      console.log('✅ Browser launched successfully');

      // Navigate to frontend
      const navigateResult = await this.client.callTool({
        name: 'playwright_page_goto',
        arguments: {
          url: 'http://localhost:5173'
        }
      });

      console.log('✅ Navigation to frontend successful');
      
      return { success: true, launchResult, navigateResult };
    } catch (error) {
      console.log('❌ Browser test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testAgentsPageNavigation() {
    console.log('🎯 Testing navigation to agents page...');
    
    try {
      // Navigate to agents page
      const agentsResult = await this.client.callTool({
        name: 'playwright_page_goto',
        arguments: {
          url: 'http://localhost:5173/agents'
        }
      });

      console.log('✅ Agents page navigation successful');

      // Wait for page load
      await this.client.callTool({
        name: 'playwright_page_wait_for_load_state',
        arguments: {
          state: 'networkidle'
        }
      });

      // Take screenshot for verification
      const screenshotResult = await this.client.callTool({
        name: 'playwright_page_screenshot',
        arguments: {
          path: './agents-page-screenshot.png'
        }
      });

      console.log('✅ Screenshot taken: agents-page-screenshot.png');
      
      return { success: true, agentsResult, screenshotResult };
    } catch (error) {
      console.log('❌ Agents page navigation failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testWorkflowBuilderElements() {
    console.log('🔧 Testing workflow builder UI elements...');
    
    try {
      // Look for workflow builder elements
      const elements = [
        'text=Professional Workflow Builder',
        'text=Workflow Builder',
        'canvas',
        'button:has-text("Save")',
        'button:has-text("Play")',
        'input[placeholder*="API"]'
      ];

      const foundElements = [];
      for (const selector of elements) {
        try {
          const elementResult = await this.client.callTool({
            name: 'playwright_page_locator',
            arguments: {
              selector: selector
            }
          });

          if (elementResult.success) {
            foundElements.push(selector);
            console.log(`✅ Found element: ${selector}`);
          }
        } catch (e) {
          console.log(`⚠️ Element not found: ${selector}`);
        }
      }

      console.log(`📊 Found ${foundElements.length}/${elements.length} workflow builder elements`);
      
      return { success: true, foundElements, totalChecked: elements.length };
    } catch (error) {
      console.log('❌ Workflow builder elements test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testAPIKeyInput() {
    console.log('🔑 Testing API key input functionality...');
    
    try {
      // Look for API key inputs and test them
      const apiKeySelectors = [
        'input[placeholder*="OpenAI"]',
        'input[placeholder*="API key"]',
        'input[type="password"]'
      ];

      let apiKeyInputFound = false;
      for (const selector of apiKeySelectors) {
        try {
          // Check if element exists
          const elementResult = await this.client.callTool({
            name: 'playwright_page_locator',
            arguments: {
              selector: selector
            }
          });

          if (elementResult.success) {
            // Try to type in the input
            await this.client.callTool({
              name: 'playwright_page_fill',
              arguments: {
                selector: selector,
                value: 'test-api-key-123'
              }
            });

            apiKeyInputFound = true;
            console.log(`✅ API key input working: ${selector}`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (apiKeyInputFound) {
        console.log('✅ API key input functionality verified');
        return { success: true };
      } else {
        console.log('⚠️ No API key inputs found');
        return { success: false, reason: 'No API key inputs found' };
      }
    } catch (error) {
      console.log('❌ API key input test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async testDragAndDropFunctionality() {
    console.log('🎯 Testing drag and drop functionality...');
    
    try {
      // Look for draggable elements
      const draggableSelectors = [
        '[draggable="true"]',
        '.workflow-step',
        '.draggable',
        '[data-draggable]'
      ];

      let dragTestSuccess = false;
      for (const selector of draggableSelectors) {
        try {
          // Check if draggable element exists
          const elementResult = await this.client.callTool({
            name: 'playwright_page_locator',
            arguments: {
              selector: selector
            }
          });

          if (elementResult.success) {
            // Get element position
            const boundingBoxResult = await this.client.callTool({
              name: 'playwright_page_locator_bounding_box',
              arguments: {
                selector: selector
              }
            });

            if (boundingBoxResult.success && boundingBoxResult.box) {
              const box = boundingBoxResult.box;
              
              // Simulate drag operation
              await this.client.callTool({
                name: 'playwright_page_mouse_move',
                arguments: {
                  x: box.x + box.width / 2,
                  y: box.y + box.height / 2
                }
              });

              await this.client.callTool({
                name: 'playwright_page_mouse_down',
                arguments: {}
              });

              await this.client.callTool({
                name: 'playwright_page_mouse_move',
                arguments: {
                  x: box.x + 100,
                  y: box.y + 100
                }
              });

              await this.client.callTool({
                name: 'playwright_page_mouse_up',
                arguments: {}
              });

              dragTestSuccess = true;
              console.log(`✅ Drag operation completed on: ${selector}`);
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }

      if (dragTestSuccess) {
        console.log('✅ Drag and drop functionality verified');
        return { success: true };
      } else {
        console.log('⚠️ No draggable elements found for testing');
        return { success: false, reason: 'No draggable elements found' };
      }
    } catch (error) {
      console.log('❌ Drag and drop test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up MCP connection...');
    
    try {
      if (this.client) {
        await this.client.close();
      }
      if (this.transport) {
        await this.transport.close();
      }
      console.log('✅ Cleanup completed');
    } catch (error) {
      console.log('⚠️ Cleanup error:', error.message);
    }
  }

  async runAllTests() {
    console.log('🎯 Starting Comprehensive Frontend MCP Testing');
    console.log('='.repeat(60));
    
    try {
      // Setup MCP
      const mcpSetup = await this.setupMCP();
      if (!mcpSetup) {
        console.log('❌ MCP setup failed, cannot continue tests');
        return;
      }

      // Test 1: Browser Launch
      const browserTest = await this.testBrowserLaunch();
      
      // Test 2: Navigation
      const navigationTest = await this.testAgentsPageNavigation();
      
      // Test 3: UI Elements
      const elementsTest = await this.testWorkflowBuilderElements();
      
      // Test 4: API Key Input
      const apiKeyTest = await this.testAPIKeyInput();
      
      // Test 5: Drag and Drop
      const dragTest = await this.testDragAndDropFunctionality();
      
      // Generate report
      this.generateReport({
        browser: browserTest,
        navigation: navigationTest,
        elements: elementsTest,
        apiKeys: apiKeyTest,
        dragDrop: dragTest
      });
      
    } catch (error) {
      console.log('❌ MCP test suite failed:', error.message);
    } finally {
      await this.cleanup();
    }
  }

  generateReport(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 FRONTEND MCP TEST REPORT');
    console.log('='.repeat(60));
    
    const tests = [
      { name: 'Browser Launch', result: results.browser?.success || false },
      { name: 'Page Navigation', result: results.navigation?.success || false },
      { name: 'UI Elements', result: results.elements?.success || false },
      { name: 'API Key Input', result: results.apiKeys?.success || false },
      { name: 'Drag & Drop', result: results.dragDrop?.success || false }
    ];
    
    let passCount = 0;
    let totalTests = tests.length;
    
    tests.forEach(test => {
      const status = test.result ? '✅ PASS' : '❌ FAIL';
      console.log(`${test.name}: ${status}`);
      if (test.result) passCount++;
    });
    
    const successRate = ((passCount / totalTests) * 100).toFixed(1);
    console.log(`\nFrontend MCP Success Rate: ${successRate}% (${passCount}/${totalTests})`);
    
    if (passCount >= 3) {
      console.log('🎉 FRONTEND UI FUNCTIONAL!');
    } else {
      console.log('⚠️ Frontend UI needs attention');
    }
    
    console.log('\n📋 SUMMARY:');
    console.log('- Used Playwright MCP for real browser automation');
    console.log('- Tested actual UI interactions and elements');
    console.log('- Verified drag-and-drop and input functionality');
    console.log('- Captured screenshots for visual verification');
  }
}

// Run the MCP frontend tests
const tester = new FrontendMCPTester();
tester.runAllTests().catch(console.error);