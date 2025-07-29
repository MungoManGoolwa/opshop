import dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables from .env file
dotenv.config()

// Define schema for environment variables with validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Authentication
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  REPL_ID: z.string().optional(),
  ISSUER_URL: z.string().url().optional(),
  REPLIT_DOMAINS: z.string().optional(),
  
  // Payment Processing
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_').optional(),
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  
  // AI Services
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-', 'ANTHROPIC_API_KEY must start with sk-ant-').optional(),
  
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().int().positive()).default('5000'),
  BASE_URL: z.string().url().optional(),
  
  // Email (Optional)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  
  // External Services (Optional)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Testing
  TEST_DATABASE_URL: z.string().url().optional(),
  CI: z.string().transform(val => val === 'true').default('false'),
})

// Validate and parse environment variables
function validateEnv() {
  try {
    const env = envSchema.parse(process.env)
    return env
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:')
      error.errors.forEach(err => {
        console.error(`  • ${err.path.join('.')}: ${err.message}`)
      })
      console.error('\n💡 Check your .env file and ensure all required variables are set')
      console.error('📖 See .env.example for reference')
    }
    process.exit(1)
  }
}

// Export validated environment variables
export const env = validateEnv()

// Helper functions for common environment checks
export const isDevelopment = () => env.NODE_ENV === 'development'
export const isProduction = () => env.NODE_ENV === 'production'
export const isTest = () => env.NODE_ENV === 'test'

// Required services check
export function checkRequiredServices() {
  const missing: string[] = []
  
  if (!env.DATABASE_URL) {
    missing.push('DATABASE_URL')
  }
  
  if (!env.SESSION_SECRET) {
    missing.push('SESSION_SECRET')
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(key => console.error(`  • ${key}`))
    console.error('\n💡 Set these in your .env file before starting the application')
    process.exit(1)
  }
}

// Optional services check with warnings
export function checkOptionalServices() {
  const warnings: string[] = []
  
  if (!env.STRIPE_SECRET_KEY) {
    warnings.push('STRIPE_SECRET_KEY - Payment processing will be disabled')
  }
  
  if (!env.ANTHROPIC_API_KEY) {
    warnings.push('ANTHROPIC_API_KEY - AI buyback system will be disabled')
  }
  
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    warnings.push('PAYPAL credentials - PayPal payments will be disabled')
  }
  
  if (warnings.length > 0 && isDevelopment()) {
    console.warn('⚠️  Optional services not configured:')
    warnings.forEach(warning => console.warn(`  • ${warning}`))
    console.warn('\n💡 Add these to .env file to enable full functionality')
  }
}

// Environment info logging
export function logEnvironmentInfo() {
  if (isDevelopment()) {
    console.log('🔧 Environment Configuration:')
    console.log(`   Mode: ${env.NODE_ENV}`)
    console.log(`   Port: ${env.PORT}`)
    console.log(`   Database: ${env.DATABASE_URL ? '✓ Connected' : '❌ Not configured'}`)
    console.log(`   Stripe: ${env.STRIPE_SECRET_KEY ? '✓ Configured' : '❌ Not configured'}`)
    console.log(`   Anthropic: ${env.ANTHROPIC_API_KEY ? '✓ Configured' : '❌ Not configured'}`)
    console.log(`   PayPal: ${env.PAYPAL_CLIENT_ID ? '✓ Configured' : '❌ Not configured'}`)
    console.log('')
  }
}