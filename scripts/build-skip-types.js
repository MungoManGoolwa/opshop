#!/usr/bin/env node

/**
 * Complete build process without type checking
 * For when you need to build despite TypeScript errors
 */

import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🚀 Starting build process (skipping type checks)...\n');

const steps = [
  {
    name: 'Cleanup',
    command: 'node scripts/clean.js',
    description: 'Cleaning build artifacts and cache files'
  },
  {
    name: 'Client build',
    command: 'vite build',
    description: 'Building client application'
  },
  {
    name: 'Server build', 
    command: 'esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist',
    description: 'Building server bundle'
  },
  {
    name: 'Postbuild verification',
    command: 'node scripts/postbuild.js',
    description: 'Verifying build outputs and providing summary'
  }
];

let currentStep = 0;

try {
  for (const step of steps) {
    currentStep++;
    console.log(`\n[${currentStep}/${steps.length}] ${step.name}`);
    console.log(`📋 ${step.description}...\n`);
    
    const startTime = Date.now();
    execSync(step.command, { 
      stdio: 'inherit', 
      cwd: rootDir 
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`\n✅ Step ${currentStep} completed in ${duration}s`);
  }

  console.log('\n🎉 Build process completed successfully!');
  console.log('\n⚠️  Note: Type checking was skipped - run "node scripts/type-check.js" to review TypeScript errors');
  console.log('\n📋 Next steps:');
  console.log('   🔐 Ensure environment variables are set');
  console.log('   🗄️  Run database migrations: npm run db:push');
  console.log('   🚀 Start production server: npm start');

} catch (error) {
  console.error(`\n❌ Build failed at step ${currentStep}: ${steps[currentStep - 1]?.name}`);
  console.error('\n💡 Troubleshooting tips:');
  console.error('   • Check the error output above');
  console.error('   • Clean and retry: node scripts/clean.js --deep');
  console.error('   • Verify dependencies: npm install');
  
  process.exit(1);
}