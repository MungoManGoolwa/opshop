#!/usr/bin/env node

/**
 * Type checking script for Opshop Online
 * Runs TypeScript compiler with appropriate flags
 */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🔍 Running TypeScript type checking...\n');

try {
  const watchMode = process.argv.includes('--watch');
  const verbose = process.argv.includes('--verbose');
  
  const command = watchMode 
    ? 'npx tsc --noEmit --skipLibCheck --watch'
    : 'npx tsc --noEmit --skipLibCheck';

  if (watchMode) {
    console.log('👀 Starting type checking in watch mode...');
    console.log('Press Ctrl+C to exit\n');
  }

  execSync(command, { 
    stdio: verbose ? 'inherit' : 'pipe',
    cwd: rootDir 
  });

  if (!watchMode) {
    console.log('✅ Type checking completed successfully!\n');
  }

} catch (error) {
  console.error('❌ Type checking failed:');
  
  if (error.stdout) {
    console.error(error.stdout.toString());
  }
  if (error.stderr) {
    console.error(error.stderr.toString());
  }
  
  console.error('\n💡 Common fixes:');
  console.error('   • Check for missing imports');
  console.error('   • Verify type definitions are correct');
  console.error('   • Ensure all dependencies are installed');
  console.error('   • Run: npm install --save-dev @types/[missing-package]');
  
  process.exit(1);
}