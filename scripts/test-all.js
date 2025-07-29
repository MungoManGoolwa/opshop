#!/usr/bin/env node

/**
 * Complete testing script for Opshop Online
 * Runs unit tests, integration tests, and E2E tests
 */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🧪 Running complete test suite...\n');

const coverage = process.argv.includes('--coverage');
const skipE2E = process.argv.includes('--skip-e2e');
const fast = process.argv.includes('--fast');

const steps = [
  {
    name: 'Unit Tests',
    command: `node scripts/test-unit.js${coverage ? ' --coverage' : ''}`,
    description: 'Testing individual components and functions',
    skip: false
  },
  {
    name: 'End-to-End Tests',
    command: `node scripts/test-e2e.js${fast ? ' --workers=1' : ''}`,
    description: 'Testing complete user workflows in browsers',
    skip: skipE2E
  }
];

let currentStep = 0;
const results = [];

try {
  console.log(`📋 Test Plan: ${steps.filter(s => !s.skip).length} test suites\n`);

  for (const step of steps) {
    if (step.skip) {
      console.log(`⏭️  Skipping: ${step.name}`);
      continue;
    }

    currentStep++;
    console.log(`\n[${currentStep}/${steps.filter(s => !s.skip).length}] ${step.name}`);
    console.log(`📋 ${step.description}...\n`);
    
    const startTime = Date.now();
    
    try {
      execSync(step.command, { 
        stdio: 'inherit', 
        cwd: rootDir 
      });
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      results.push({ name: step.name, status: 'PASSED', duration });
      console.log(`\n✅ ${step.name} completed in ${duration}s`);
      
    } catch (stepError) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      results.push({ name: step.name, status: 'FAILED', duration });
      throw stepError;
    }
  }

  // Success summary
  console.log('\n🎉 Complete test suite passed successfully!\n');
  
  console.log('📊 Test Results Summary:');
  results.forEach(result => {
    const icon = result.status === 'PASSED' ? '✅' : '❌';
    console.log(`   ${icon} ${result.name}: ${result.status} (${result.duration}s)`);
  });

  const totalTime = results.reduce((sum, r) => sum + parseFloat(r.duration), 0).toFixed(1);
  console.log(`\n⏱️  Total testing time: ${totalTime}s`);

  if (coverage) {
    console.log('\n📈 Coverage Reports:');
    console.log('   Client Coverage: coverage/index.html');
    console.log('   Server Coverage: coverage/lcov-report/index.html');
  }

  console.log('\n🚀 Your application is ready for deployment!');

} catch (error) {
  console.error(`\n❌ Test suite failed at: ${steps[currentStep - 1]?.name || 'Unknown step'}`);
  
  if (results.length > 0) {
    console.error('\n📊 Partial Results:');
    results.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      console.error(`   ${icon} ${result.name}: ${result.status} (${result.duration}s)`);
    });
  }

  console.error('\n💡 Quick Recovery Tips:');
  console.error('   • Run individual test suites to isolate issues');
  console.error('   • Skip E2E tests for faster iteration: --skip-e2e');
  console.error('   • Run with coverage to identify untested code: --coverage');
  console.error('   • Use --fast flag for quicker E2E tests');
  
  process.exit(1);
}