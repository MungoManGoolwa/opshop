#!/usr/bin/env node

/**
 * End-to-end testing script for Opshop Online
 * Runs Playwright tests across multiple browsers
 */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🎭 Running end-to-end tests...\n');

const headed = process.argv.includes('--headed');
const debug = process.argv.includes('--debug');
const project = process.argv.find(arg => arg.startsWith('--project='))?.split('=')[1];
const workers = process.argv.find(arg => arg.startsWith('--workers='))?.split('=')[1];

try {
  // Ensure Playwright browsers are installed
  console.log('🔧 Checking Playwright browser installation...');
  try {
    execSync('npx playwright install --with-deps', { 
      stdio: debug ? 'inherit' : 'pipe',
      cwd: rootDir 
    });
    console.log('✅ Playwright browsers ready\n');
  } catch (installError) {
    console.log('⚠️  Browser installation issue, continuing with existing browsers...\n');
  }

  // Build command
  let command = 'npx playwright test';
  
  if (headed) command += ' --headed';
  if (debug) command += ' --debug';
  if (project) command += ` --project="${project}"`;
  if (workers) command += ` --workers=${workers}`;

  console.log('🚀 Starting end-to-end test suite...');
  console.log(`📋 Command: ${command}\n`);

  const startTime = Date.now();
  execSync(command, { 
    stdio: 'inherit', 
    cwd: rootDir,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      CI: process.env.CI || 'false'
    }
  });
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n🎉 End-to-end tests completed successfully in ${duration}s!`);
  console.log('\n📊 Test reports generated:');
  console.log('   HTML Report: playwright-report/index.html');
  console.log('   Test Results: test-results/');

} catch (error) {
  console.error('\n❌ End-to-end tests failed');
  console.error('\n💡 Troubleshooting tips:');
  console.error('   • Check if the development server is running');
  console.error('   • Verify database is accessible and seeded with test data');
  console.error('   • Run with --headed flag to see browser interactions');
  console.error('   • Run with --debug flag for step-by-step debugging');
  console.error('   • Check network connectivity and environment variables');
  console.error('   • Run specific project: --project=chromium');
  
  console.error('\n🔧 Available debugging commands:');
  console.error('   node scripts/test-e2e.js --headed');
  console.error('   node scripts/test-e2e.js --debug');
  console.error('   node scripts/test-e2e.js --project=chromium');
  console.error('   npx playwright test --ui');
  
  process.exit(1);
}