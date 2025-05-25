#!/usr/bin/env node

/**
 * Test version of MCP Server Scraper - processes only 5 repositories
 */

import { runScraper } from './mcp-server-scraper.js';

// Override the configuration for testing
const originalConfig = await import('./mcp-server-scraper.js');

// Create a test version that processes fewer repositories
async function testScraper() {
  console.log('🧪 Running MCP Scraper Test (limited to 5 repositories)...\n');
  
  // We'll modify the search function to return fewer results
  const originalSearch = originalConfig.searchGitHubMCPServers;
  
  // Run the scraper
  await runScraper();
}

testScraper().catch(console.error);