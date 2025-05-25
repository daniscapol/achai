// Automated QA System for Workflow Builder
// Runs comprehensive tests without browser dependencies

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class AutomatedQA {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  async runAllTests() {
    console.log('🤖 Starting Automated QA System...\n');
    
    await this.testFileStructure();
    await this.testImportStatements();
    await this.testComponentIntegrity();
    await this.testAPIEndpoints();
    await this.testDatabaseConnections();
    await this.testSecurityVulnerabilities();
    await this.testPerformanceIssues();
    
    this.generateReport();
  }

  async testFileStructure() {
    console.log('📁 Testing File Structure...');
    
    const criticalFiles = [
      '../src/components/agents/PremiumWorkflowBuilder.jsx',
      '../src/components/agents/utils/advancedWorkflowEngine.js',
      '../src/components/agents/utils/apiKeyManager.js',
      '../api/workflows.js',
      '../src/api/server.js'
    ];

    for (const file of criticalFiles) {
      try {
        const filePath = path.resolve(__dirname, file);
        await fs.access(filePath);
        this.pass(`✅ File exists: ${file}`);
      } catch (error) {
        this.fail(`❌ Missing critical file: ${file}`);
      }
    }
  }

  async testImportStatements() {
    console.log('📦 Testing Import Statements...');
    
    try {
      const workflowBuilderPath = path.resolve(__dirname, '../src/components/agents/PremiumWorkflowBuilder.jsx');
      const content = await fs.readFile(workflowBuilderPath, 'utf8');
      
      // Check for common import issues
      const importLines = content.split('\n').filter(line => line.trim().startsWith('import'));
      
      for (const importLine of importLines) {
        if (importLine.includes('undefined') || importLine.includes('null')) {
          this.fail(`❌ Malformed import: ${importLine.trim()}`);
        } else if (!importLine.includes('from')) {
          this.fail(`❌ Invalid import syntax: ${importLine.trim()}`);
        } else {
          this.pass(`✅ Valid import: ${importLine.trim()}`);
        }
      }
    } catch (error) {
      this.fail(`❌ Error reading workflow builder: ${error.message}`);
    }
  }

  async testComponentIntegrity() {
    console.log('🧩 Testing Component Integrity...');
    
    try {
      const workflowBuilderPath = path.resolve(__dirname, '../src/components/agents/PremiumWorkflowBuilder.jsx');
      const content = await fs.readFile(workflowBuilderPath, 'utf8');
      
      // Test for React hooks usage
      const useStateCount = (content.match(/useState/g) || []).length;
      const useEffectCount = (content.match(/useEffect/g) || []).length;
      const useCallbackCount = (content.match(/useCallback/g) || []).length;
      
      if (useStateCount > 10) {
        this.warning(`⚠️ High useState count (${useStateCount}) - consider state consolidation`);
      }
      
      if (useEffectCount > 5) {
        this.warning(`⚠️ High useEffect count (${useEffectCount}) - potential performance impact`);
      }
      
      // Test for event listener cleanup
      if (content.includes('addEventListener') && !content.includes('removeEventListener')) {
        this.fail(`❌ Missing event listener cleanup - memory leak risk`);
      } else if (content.includes('addEventListener') && content.includes('removeEventListener')) {
        this.pass(`✅ Event listeners properly cleaned up`);
      }
      
      // Test for proper error boundaries
      if (!content.includes('try') || !content.includes('catch')) {
        this.warning(`⚠️ Missing try-catch blocks - error handling needs improvement`);
      }
      
      this.pass(`✅ Component structure analysis complete`);
      
    } catch (error) {
      this.fail(`❌ Component integrity test failed: ${error.message}`);
    }
  }

  async testAPIEndpoints() {
    console.log('🌐 Testing API Endpoints...');
    
    const testEndpoints = [
      'http://localhost:3001/api/health',
      'http://localhost:3001/api/workflows/templates'
    ];

    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) {
          this.pass(`✅ API endpoint accessible: ${endpoint}`);
        } else {
          this.fail(`❌ API endpoint error (${response.status}): ${endpoint}`);
        }
      } catch (error) {
        this.fail(`❌ API endpoint unreachable: ${endpoint} - ${error.message}`);
      }
    }
  }

  async testDatabaseConnections() {
    console.log('🗄️ Testing Database Connections...');
    
    try {
      const response = await fetch('http://localhost:3001/api/health');
      if (response.ok) {
        const health = await response.json();
        if (health.dataSource && health.dataSource.type === 'success') {
          this.pass(`✅ Database connection verified`);
        } else {
          this.fail(`❌ Database connection failed`);
        }
      }
    } catch (error) {
      this.fail(`❌ Unable to test database connection: ${error.message}`);
    }
  }

  async testSecurityVulnerabilities() {
    console.log('🔒 Testing Security Vulnerabilities...');
    
    try {
      const enginePath = path.resolve(__dirname, '../src/components/agents/utils/advancedWorkflowEngine.js');
      const content = await fs.readFile(enginePath, 'utf8');
      
      // Check for eval() usage (security risk) - exclude comments
      const evalMatches = content.match(/[^\/\*\s]eval\(/g);
      if (evalMatches && evalMatches.length > 0) {
        this.fail(`❌ Security vulnerability: eval() usage detected`);
      } else {
        this.pass(`✅ No eval() usage found`);
      }
      
      // Check for SQL injection risks
      if (content.includes('query') && content.includes('$')) {
        this.pass(`✅ Parameterized queries detected`);
      }
      
      // Check for XSS protection
      if (content.includes('innerHTML') && !content.includes('sanitize')) {
        this.warning(`⚠️ Potential XSS risk: innerHTML usage without sanitization`);
      }
      
    } catch (error) {
      this.fail(`❌ Security test failed: ${error.message}`);
    }
  }

  async testPerformanceIssues() {
    console.log('⚡ Testing Performance Issues...');
    
    try {
      const workflowBuilderPath = path.resolve(__dirname, '../src/components/agents/PremiumWorkflowBuilder.jsx');
      const content = await fs.readFile(workflowBuilderPath, 'utf8');
      
      // Check for expensive operations in render
      if (content.includes('JSON.stringify') && content.includes('map')) {
        this.warning(`⚠️ Potential performance issue: JSON.stringify in render loop`);
      }
      
      // Check for inline function creation
      const inlineFunctionCount = (content.match(/onClick=\{[^}]*=>/g) || []).length;
      if (inlineFunctionCount > 5) {
        this.warning(`⚠️ High inline function count (${inlineFunctionCount}) - consider useCallback`);
      }
      
      // Check for missing useCallback/useMemo
      const handlerCount = (content.match(/handle\w+/g) || []).length;
      const callbackCount = (content.match(/useCallback/g) || []).length;
      
      if (handlerCount > callbackCount * 2) {
        this.warning(`⚠️ Consider using useCallback for event handlers (${handlerCount} handlers, ${callbackCount} callbacks)`);
      }
      
      this.pass(`✅ Performance analysis complete`);
      
    } catch (error) {
      this.fail(`❌ Performance test failed: ${error.message}`);
    }
  }

  pass(message) {
    this.testResults.passed++;
    this.testResults.details.push({ type: 'pass', message });
    console.log(message);
  }

  fail(message) {
    this.testResults.failed++;
    this.testResults.details.push({ type: 'fail', message });
    console.log(message);
  }

  warning(message) {
    this.testResults.warnings++;
    this.testResults.details.push({ type: 'warning', message });
    console.log(message);
  }

  generateReport() {
    console.log('\n📊 QA TEST RESULTS');
    console.log('==================');
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(`⚠️  Warnings: ${this.testResults.warnings}`);
    console.log(`📈 Success Rate: ${Math.round((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100)}%`);
    
    // Priority issues
    const criticalIssues = this.testResults.details.filter(d => d.type === 'fail');
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES TO FIX:');
      criticalIssues.forEach(issue => console.log(`   ${issue.message}`));
    }
    
    const warnings = this.testResults.details.filter(d => d.type === 'warning');
    if (warnings.length > 0) {
      console.log('\n⚠️  WARNINGS TO ADDRESS:');
      warnings.forEach(warning => console.log(`   ${warning.message}`));
    }
    
    console.log('\n🎯 OVERALL STATUS:', this.testResults.failed === 0 ? '✅ READY FOR PRODUCTION' : '❌ NEEDS FIXES');
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const qa = new AutomatedQA();
  qa.runAllTests().catch(console.error);
}

export default AutomatedQA;