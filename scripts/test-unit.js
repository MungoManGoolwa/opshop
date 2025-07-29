#!/usr/bin/env node

/**
 * Unit testing script for Opshop Online
 * Runs client tests with Vitest and server tests with Jest
 */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🧪 Running unit tests...\n');

const coverage = process.argv.includes('--coverage');
const watch = process.argv.includes('--watch');
const verbose = process.argv.includes('--verbose');

try {
  // Step 1: Run client tests with Vitest
  console.log('1. Running client tests (React components, hooks, utilities)...');
  
  let vitestCommand = 'npx vitest run';
  if (coverage) vitestCommand += ' --coverage';
  if (watch) vitestCommand = 'npx vitest';
  if (verbose) vitestCommand += ' --reporter=verbose';
  
  const vitestStartTime = Date.now();
  execSync(vitestCommand, { 
    stdio: 'inherit', 
    cwd: rootDir 
  });
  const vitestDuration = ((Date.now() - vitestStartTime) / 1000).toFixed(1);
  
  console.log(`✅ Client tests completed in ${vitestDuration}s\n`);

  // Step 2: Run server tests with Jest (only if not in watch mode)
  if (!watch) {
    console.log('2. Running server tests (API, storage, services)...');
    
    let jestCommand = 'npx jest --config=jest.config.mjs';
    if (coverage) jestCommand += ' --coverage';
    if (verbose) jestCommand += ' --verbose';
    
    const jestStartTime = Date.now();
    execSync(jestCommand, { 
      stdio: 'inherit', 
      cwd: rootDir 
    });
    const jestDuration = ((Date.now() - jestStartTime) / 1000).toFixed(1);
    
    console.log(`✅ Server tests completed in ${jestDuration}s\n`);
  }

  console.log('🎉 All unit tests passed successfully!');
  
  if (coverage) {
    console.log('\n📊 Coverage reports generated:');
    console.log('   Client: coverage/index.html');
    console.log('   Server: coverage/lcov-report/index.html');
  }

} catch (error) {
  console.error('\n❌ Unit tests failed');
  console.error('\n💡 Troubleshooting tips:');
  console.error('   • Check test output above for specific failures');
  console.error('   • Run tests individually: npx vitest or npx jest');
  console.error('   • Update snapshots if needed: npx vitest -u or npx jest -u');
  console.error('   • Check test setup files for configuration issues');
  
  process.exit(1);
}