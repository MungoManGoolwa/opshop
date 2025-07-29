#!/usr/bin/env node

/**
 * Environment Configuration Checker for Opshop Online
 * Validates environment variables and provides setup guidance
 */

import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log('🔧 Environment Configuration Check\n');

// Load environment variables
const envFile = join(rootDir, '.env');
const envExampleFile = join(rootDir, '.env.example');

if (!existsSync(envFile)) {
  console.error('❌ .env file not found');
  console.error('\n💡 Create .env file from template:');
  console.error('   cp .env.example .env');
  console.error('   # Then edit .env with your actual values\n');
  
  if (existsSync(envExampleFile)) {
    console.log('📋 Available environment variables from .env.example:');
    const exampleContent = readFileSync(envExampleFile, 'utf8');
    const variables = exampleContent
      .split('\n')
      .filter(line => line.includes('=') && !line.startsWith('#'))
      .map(line => line.split('=')[0]);
    
    variables.forEach(variable => {
      console.log(`   • ${variable}`);
    });
  }
  
  process.exit(1);
}

// Parse .env file
function parseEnvFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, ...valueParts] = line.split('=');
      env[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  return env;
}

const env = parseEnvFile(envFile);

// Required variables
const required = {
  'DATABASE_URL': 'Database connection string',
  'SESSION_SECRET': 'Session encryption key (min 32 chars)',
};

// Optional but recommended variables
const optional = {
  'STRIPE_SECRET_KEY': 'Stripe payment processing',
  'ANTHROPIC_API_KEY': 'AI-powered buyback system',
  'PAYPAL_CLIENT_ID': 'PayPal payment processing',
  'PAYPAL_CLIENT_SECRET': 'PayPal payment processing',
  'REPL_ID': 'Replit authentication',
  'REPLIT_DOMAINS': 'Replit authentication domains',
};

// Check required variables
console.log('🔍 Checking required environment variables:\n');
let missingRequired = [];

Object.entries(required).forEach(([key, description]) => {
  const value = env[key];
  if (!value || value.includes('your-') || value.includes('username') || value.includes('password')) {
    console.log(`❌ ${key}: Missing or placeholder value`);
    console.log(`   Description: ${description}`);
    missingRequired.push(key);
  } else {
    console.log(`✅ ${key}: Configured`);
    
    // Additional validation
    if (key === 'SESSION_SECRET' && value.length < 32) {
      console.log(`⚠️  ${key}: Should be at least 32 characters long`);
    }
  }
  console.log('');
});

// Check optional variables
console.log('🔍 Checking optional environment variables:\n');
let missingOptional = [];

Object.entries(optional).forEach(([key, description]) => {
  const value = env[key];
  if (!value || value.includes('your-') || value.includes('test-')) {
    console.log(`⚠️  ${key}: Not configured`);
    console.log(`   Description: ${description}`);
    missingOptional.push(key);
  } else {
    console.log(`✅ ${key}: Configured`);
    
    // Additional validation
    if (key === 'STRIPE_SECRET_KEY' && !value.startsWith('sk_')) {
      console.log(`⚠️  ${key}: Should start with 'sk_'`);
    }
    if (key === 'ANTHROPIC_API_KEY' && !value.startsWith('sk-ant-')) {
      console.log(`⚠️  ${key}: Should start with 'sk-ant-'`);
    }
  }
  console.log('');
});

// Summary and recommendations
console.log('📊 Configuration Summary:\n');

if (missingRequired.length === 0) {
  console.log('✅ All required variables are configured');
} else {
  console.log(`❌ ${missingRequired.length} required variable(s) missing:`);
  missingRequired.forEach(key => console.log(`   • ${key}`));
}

if (missingOptional.length === 0) {
  console.log('✅ All optional variables are configured');
} else {
  console.log(`⚠️  ${missingOptional.length} optional variable(s) not configured:`);
  missingOptional.forEach(key => console.log(`   • ${key}`));
}

console.log('\n📖 Setup Instructions:\n');

if (missingRequired.includes('DATABASE_URL')) {
  console.log('🗄️  Database Setup:');
  console.log('   1. Create a PostgreSQL database');
  console.log('   2. Set DATABASE_URL=postgresql://user:pass@host:port/dbname');
  console.log('   3. Run: npm run db:push\n');
}

if (missingRequired.includes('SESSION_SECRET')) {
  console.log('🔐 Session Security:');
  console.log('   1. Generate a random 32+ character string');
  console.log('   2. Set SESSION_SECRET=your-secret-key');
  console.log('   3. Keep this secret and secure\n');
}

if (missingOptional.includes('STRIPE_SECRET_KEY')) {
  console.log('💳 Stripe Payment Setup:');
  console.log('   1. Create account at https://stripe.com');
  console.log('   2. Get API keys from https://dashboard.stripe.com/apikeys');
  console.log('   3. Set STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY\n');
}

if (missingOptional.includes('ANTHROPIC_API_KEY')) {
  console.log('🤖 AI Buyback Setup:');
  console.log('   1. Create account at https://console.anthropic.com');
  console.log('   2. Generate API key');
  console.log('   3. Set ANTHROPIC_API_KEY=sk-ant-...\n');
}

console.log('🚀 Next Steps:');
console.log('   1. Update missing variables in .env');
console.log('   2. Run: npm run dev');
console.log('   3. Test functionality\n');

// Exit with appropriate code
if (missingRequired.length > 0) {
  console.log('❌ Configuration incomplete - fix required variables before starting');
  process.exit(1);
} else {
  console.log('✅ Configuration ready for development');
  process.exit(0);
}