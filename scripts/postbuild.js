#!/usr/bin/env node

/**
 * Postbuild script for Opshop Online
 * Verifies build output and provides summary
 */

import { statSync, existsSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🔍 Starting postbuild verification...\n');

// Step 1: Verify build outputs exist
console.log('1. Verifying build outputs...');

const expectedOutputs = [
  { path: 'dist/index.js', description: 'Server bundle' },
  { path: 'dist/public', description: 'Client assets directory' },
  { path: 'dist/public/index.html', description: 'Client entry point' }
];

let buildSuccess = true;

expectedOutputs.forEach(({ path, description }) => {
  const fullPath = join(rootDir, path);
  if (existsSync(fullPath)) {
    console.log(`   ✓ ${description}: ${path}`);
  } else {
    console.error(`   ❌ Missing ${description}: ${path}`);
    buildSuccess = false;
  }
});

if (!buildSuccess) {
  console.error('\n❌ Build verification failed - missing required outputs');
  process.exit(1);
}

// Step 2: Calculate bundle sizes
console.log('\n2. Build summary:');

try {
  // Server bundle size
  const serverBundlePath = join(rootDir, 'dist/index.js');
  if (existsSync(serverBundlePath)) {
    const serverStats = statSync(serverBundlePath);
    const serverSizeKB = Math.round(serverStats.size / 1024);
    console.log(`   📦 Server bundle size: ${serverSizeKB}KB`);
    
    // Warn if bundle is very large
    if (serverSizeKB > 5000) {
      console.log(`   ⚠️  Large server bundle detected (${serverSizeKB}KB)`);
    }
  }

  // Client assets
  const clientAssetsPath = join(rootDir, 'dist/public');
  if (existsSync(clientAssetsPath)) {
    const clientFiles = readdirSync(clientAssetsPath, { recursive: true });
    console.log(`   📁 Client assets: ${clientFiles.length} files`);
    
    // Find main client JS bundle
    const jsFiles = clientFiles.filter(file => 
      typeof file === 'string' && file.endsWith('.js') && !file.includes('vendor')
    );
    
    if (jsFiles.length > 0) {
      const mainJsPath = join(clientAssetsPath, jsFiles[0]);
      if (existsSync(mainJsPath)) {
        const clientStats = statSync(mainJsPath);
        const clientSizeKB = Math.round(clientStats.size / 1024);
        console.log(`   📦 Main client bundle: ${clientSizeKB}KB`);
      }
    }
  }

} catch (error) {
  console.log(`   ⚠️  Size calculation warning: ${error.message}`);
}

// Step 3: Check for optimization opportunities
console.log('\n3. Optimization checks:');

// Check for source maps in production
const sourceMapFiles = readdirSync(join(rootDir, 'dist/public'), { recursive: true })
  .filter(file => typeof file === 'string' && file.endsWith('.map'));

if (sourceMapFiles.length > 0) {
  console.log(`   ⚠️  Found ${sourceMapFiles.length} source map files (consider removing for production)`);
} else {
  console.log('   ✓ No source maps found (good for production)');
}

// Step 4: Environment recommendations
console.log('\n4. Deployment recommendations:');
console.log('   📋 Set NODE_ENV=production for optimal performance');
console.log('   🔐 Ensure all environment secrets are configured');
console.log('   🗄️  Run database migrations: npm run db:push');
console.log('   🚀 Start with: npm start');

console.log('\n✅ Postbuild verification completed successfully!\n');