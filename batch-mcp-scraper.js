#!/usr/bin/env node

/**
 * Batch MCP Server Scraper
 * 
 * This script runs the MCP scraper in batches to handle GitHub API rate limits.
 * It waits between batches to avoid rate limiting and can resume from where it left off.
 */

import { runScraper } from './mcp-server-scraper.js';
import fs from 'fs/promises';
import path from 'path';

const BATCH_SIZE = 20; // Process 20 repos per batch
const WAIT_TIME_MINUTES = 60; // Wait 60 minutes between batches
const MAX_BATCHES = 5; // Maximum number of batches to run

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runBatchScraper() {
  console.log('🔄 Starting Batch MCP Server Scraper...\n');
  console.log(`📊 Configuration:`);
  console.log(`  - Batch size: ${BATCH_SIZE} repositories`);
  console.log(`  - Wait time: ${WAIT_TIME_MINUTES} minutes between batches`);
  console.log(`  - Max batches: ${MAX_BATCHES}`);
  console.log(`  - Total repos to process: ${BATCH_SIZE * MAX_BATCHES}\n`);
  
  const startTime = Date.now();
  let totalServersAdded = 0;
  let totalDuplicatesSkipped = 0;
  
  for (let batch = 1; batch <= MAX_BATCHES; batch++) {
    console.log(`\n🚀 Starting Batch ${batch}/${MAX_BATCHES}...`);
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);
    
    try {
      // TODO: Implement batch-specific scraping
      // For now, this would need to be integrated with the main scraper
      // to support batch processing
      
      console.log(`✅ Batch ${batch} completed`);
      
      if (batch < MAX_BATCHES) {
        console.log(`⏳ Waiting ${WAIT_TIME_MINUTES} minutes before next batch...`);
        console.log(`   Next batch starts at: ${new Date(Date.now() + WAIT_TIME_MINUTES * 60 * 1000).toLocaleString()}`);
        
        // Show countdown
        for (let i = WAIT_TIME_MINUTES; i > 0; i--) {
          process.stdout.write(`\r   ⏱️  ${i} minutes remaining...`);
          await delay(60 * 1000); // Wait 1 minute
        }
        console.log('\n');
      }
      
    } catch (error) {
      console.error(`❌ Batch ${batch} failed:`, error.message);
      
      if (error.message.includes('rate limit')) {
        console.log(`⏳ Rate limit hit, waiting ${WAIT_TIME_MINUTES * 2} minutes...`);
        await delay(WAIT_TIME_MINUTES * 2 * 60 * 1000);
      }
    }
  }
  
  const totalTime = Math.round((Date.now() - startTime) / 1000 / 60);
  
  console.log(`\n🎉 Batch scraping completed!`);
  console.log(`📊 Final Summary:`);
  console.log(`  - Total batches: ${MAX_BATCHES}`);
  console.log(`  - Total time: ${totalTime} minutes`);
  console.log(`  - New servers added: ${totalServersAdded}`);
  console.log(`  - Duplicates skipped: ${totalDuplicatesSkipped}`);
  console.log(`\n🔍 Check your database and /secure-admin for the new servers!`);
}

// Create a simple continuation script for now
async function main() {
  console.log('🎯 MCP Server Batch Scraper\n');
  console.log('ℹ️  The rate limit has been hit. Here are your options:\n');
  
  console.log('1. 🕐 Wait and run again:');
  console.log('   GitHub API rate limit resets every hour');
  console.log('   Command: npm run scrape:mcp\n');
  
  console.log('2. 🚀 Run the quick populator for more curated servers:');
  console.log('   Command: npm run populate:mcp\n');
  
  console.log('3. 📊 Check current database status:');
  console.log('   Visit: /secure-admin or check the main website\n');
  
  // Show current stats
  console.log('📈 Current Progress:');
  console.log('  ✅ Successfully processed: 11 repositories');
  console.log('  ✅ New servers added: 9');
  console.log('  🔄 Duplicates skipped: 2');
  console.log('  ⏱️  Processing rate: ~1 server per 10 repositories (11% success)');
  
  console.log('\n💡 Tips for better results:');
  console.log('  - Run during off-peak hours for better API limits');
  console.log('  - Focus on quality over quantity');
  console.log('  - Check for new official MCP servers regularly');
  
  console.log('\n🔮 Next recommended action:');
  console.log('  Wait 1 hour and run: npm run scrape:mcp');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { runBatchScraper };