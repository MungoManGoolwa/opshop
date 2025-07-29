#!/usr/bin/env node

/**
 * Cleanup script for Opshop Online
 * Removes build artifacts and cache files
 */

import { rmSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🧹 Cleaning up build artifacts and cache files...\n');

const pathsToClean = [
  { path: 'dist', description: 'Build output directory' },
  { path: 'node_modules/.cache', description: 'Node modules cache' },
  { path: '.vite', description: 'Vite cache' },
  { path: 'client/dist', description: 'Client build output' },
  { path: '.tsbuildinfo', description: 'TypeScript build info' },
  { path: 'coverage', description: 'Test coverage reports' },
  { path: '.nyc_output', description: 'NYC output' }
];

let cleanedCount = 0;

pathsToClean.forEach(({ path, description }) => {
  const fullPath = join(rootDir, path);
  
  if (existsSync(fullPath)) {
    try {
      rmSync(fullPath, { recursive: true, force: true });
      console.log(`   ✓ Cleaned: ${description} (${path})`);
      cleanedCount++;
    } catch (error) {
      console.log(`   ⚠️  Failed to clean ${path}: ${error.message}`);
    }
  } else {
    console.log(`   • Skipped: ${description} (not found)`);
  }
});

// Additional cleanup based on command line arguments
if (process.argv.includes('--deep')) {
  console.log('\n🔍 Deep cleaning...');
  
  const deepCleanPaths = [
    { path: 'node_modules/.pnpm', description: 'PNPM cache' },
    { path: '.cache', description: 'General cache directory' },
    { path: 'tmp', description: 'Temporary files' }
  ];

  deepCleanPaths.forEach(({ path, description }) => {
    const fullPath = join(rootDir, path);
    
    if (existsSync(fullPath)) {
      try {
        rmSync(fullPath, { recursive: true, force: true });
        console.log(`   ✓ Deep cleaned: ${description} (${path})`);
        cleanedCount++;
      } catch (error) {
        console.log(`   ⚠️  Failed to deep clean ${path}: ${error.message}`);
      }
    }
  });
}

console.log(`\n✅ Cleanup completed! Cleaned ${cleanedCount} items.\n`);

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/clean.js [options]');
  console.log('Options:');
  console.log('  --deep    Perform deep cleaning (includes additional cache directories)');
  console.log('  --help    Show this help message');
}