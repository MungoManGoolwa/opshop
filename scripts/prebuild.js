#!/usr/bin/env node

/**
 * Prebuild script for Opshop Online
 * Runs cleanup and type checking before build
 */

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🧹 Starting prebuild cleanup and checks...\n');

// Step 1: Clean up previous build artifacts
console.log('1. Cleaning previous build artifacts...');
try {
  const pathsToClean = [
    join(rootDir, 'dist'),
    join(rootDir, 'node_modules/.cache'),
    join(rootDir, '.vite'),
    join(rootDir, 'client/dist')
  ];

  pathsToClean.forEach(path => {
    if (existsSync(path)) {
      rmSync(path, { recursive: true, force: true });
      console.log(`   ✓ Cleaned: ${path.replace(rootDir, '.')}`);
    }
  });
} catch (error) {
  console.log(`   ⚠️  Clean warning: ${error.message}`);
}

// Step 2: Type checking
console.log('\n2. Running TypeScript type checking...');
try {
  execSync('npx tsc --noEmit --skipLibCheck', { 
    stdio: 'inherit', 
    cwd: rootDir 
  });
  console.log('   ✓ Type checking passed');
} catch (error) {
  console.error('   ❌ Type checking failed');
  process.exit(1);
}

// Step 3: Check for common issues
console.log('\n3. Checking for common build issues...');

// Check if critical files exist
const criticalFiles = [
  'server/index.ts',
  'client/src/main.tsx',
  'vite.config.ts',
  'tsconfig.json'
];

criticalFiles.forEach(file => {
  const filePath = join(rootDir, file);
  if (existsSync(filePath)) {
    console.log(`   ✓ Found: ${file}`);
  } else {
    console.error(`   ❌ Missing critical file: ${file}`);
    process.exit(1);
  }
});

console.log('\n✅ Prebuild checks completed successfully!\n');