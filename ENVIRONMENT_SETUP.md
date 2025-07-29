# Environment Configuration Guide

## Overview

Opshop Online now uses a comprehensive environment variable management system with validation, error handling, and developer-friendly setup tools.

## Quick Setup

1. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

2. **Edit Your Settings**
   Edit `.env` with your actual values (see sections below)

3. **Check Configuration**
   ```bash
   node scripts/env-check.js
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## Required Environment Variables

### Database Configuration
```bash
DATABASE_URL=postgresql://username:password@host:port/database_name
```
- **Required**: Yes
- **Description**: PostgreSQL connection string
- **Setup**: Create database on Neon/Railway/Supabase or local PostgreSQL

### Session Security
```bash
SESSION_SECRET=your-super-secret-session-key-minimum-32-characters
```
- **Required**: Yes
- **Description**: Encryption key for user sessions
- **Setup**: Generate random 32+ character string
- **Security**: Keep secret, never commit to version control

## Optional Service Configurations

### Payment Processing

#### Stripe Setup
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key
```
- **Setup Instructions**:
  1. Create account at https://stripe.com
  2. Navigate to https://dashboard.stripe.com/apikeys
  3. Copy "Secret key" (starts with `sk_`)
  4. Copy "Publishable key" (starts with `pk_`)
  5. For subscriptions, also set `STRIPE_PRICE_ID`

#### PayPal Setup
```bash
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```
- **Setup Instructions**:
  1. Create developer account at https://developer.paypal.com
  2. Create new application
  3. Copy Client ID and Client Secret
  4. Use sandbox credentials for development

### AI Services

#### Anthropic (AI Buyback System)
```bash
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
```
- **Setup Instructions**:
  1. Create account at https://console.anthropic.com
  2. Generate API key in dashboard
  3. Key starts with `sk-ant-`

### Authentication (Replit Auth)
```bash
REPL_ID=your-replit-app-id
REPLIT_DOMAINS=your-domain.replit.app,your-custom-domain.com
ISSUER_URL=https://replit.com/oidc
```
- **Setup**: Configured automatically in Replit environment

## Environment Validation

The system automatically validates environment variables on startup:

### Validation Features
- ✅ **Required Variable Check**: Ensures critical variables are set
- ⚠️ **Optional Variable Warning**: Notifies about missing optional services
- 🔍 **Format Validation**: Checks API key formats and URL structures
- 📊 **Service Status**: Reports which services are configured

### Validation Script
```bash
node scripts/env-check.js
```

**Output Example**:
```
🔧 Environment Configuration Check

🔍 Checking required environment variables:
✅ DATABASE_URL: Configured
✅ SESSION_SECRET: Configured

🔍 Checking optional environment variables:
✅ STRIPE_SECRET_KEY: Configured
✅ ANTHROPIC_API_KEY: Configured
⚠️  PAYPAL_CLIENT_ID: Not configured

📊 Configuration Summary:
✅ All required variables are configured
⚠️  1 optional variable(s) not configured:
   • PAYPAL_CLIENT_ID

✅ Configuration ready for development
```

## Error Handling

### Graceful Degradation
Services without configuration gracefully disable:
- **Missing Stripe**: Payment processing returns 503 error
- **Missing Anthropic**: AI buyback system shows fallback pricing
- **Missing PayPal**: PayPal payments disabled

### Development vs Production
- **Development**: Shows detailed warnings for missing optional services
- **Production**: Logs warnings without interrupting service

## Security Best Practices

1. **Never Commit Secrets**
   - `.env` is in `.gitignore`
   - Use `.env.example` for templates only

2. **Rotate Keys Regularly**
   - Especially for production environments
   - Update both API keys and session secrets

3. **Use Environment-Specific Keys**
   - Test keys for development (`sk_test_`, sandbox)
   - Live keys only for production (`sk_live_`, live)

4. **Validate on Startup**
   - System checks configuration before starting
   - Prevents runtime errors from missing config

## Troubleshooting

### Common Issues

#### "Environment validation failed"
- Check `.env` file exists
- Verify required variables are set
- Ensure no placeholder values remain

#### "Payment processing is not configured"
- Set `STRIPE_SECRET_KEY` in `.env`
- Verify key starts with `sk_`
- Check Stripe dashboard for correct keys

#### "AI buyback system will be disabled"
- Set `ANTHROPIC_API_KEY` in `.env`
- Verify key starts with `sk-ant-`
- Check Anthropic console for API access

### Debug Commands

```bash
# Check environment configuration
node scripts/env-check.js

# Test database connection
npm run db:push

# Start with detailed logging
NODE_ENV=development npm run dev
```

## Integration with Build System

The environment system integrates with:
- ✅ **Development Server**: Validates on startup
- ✅ **Build Process**: Includes environment validation
- ✅ **Testing Suite**: Uses test-specific variables
- ✅ **Production Deployment**: Production-ready validation

## Next Steps

1. Set up your `.env` file with required variables
2. Run environment check to validate configuration
3. Start development server
4. Add optional services as needed for full functionality