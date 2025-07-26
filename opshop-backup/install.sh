#!/bin/bash

echo "=== Opshop Online Installation Script ==="
echo "Complete marketplace platform restoration from backup"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the backup directory containing package.json"
    exit 1
fi

echo "🚀 Installing Opshop Online from backup..."
echo ""

echo "1. Installing dependencies..."
npm install

echo ""
echo "2. Environment variables required:"
echo "Please configure these in your .env file or hosting platform:"
echo ""
echo "# Authentication"
echo "SESSION_SECRET=your-session-secret-key"
echo "REPL_ID=your-repl-id"
echo "REPLIT_DOMAINS=opshop.online"
echo ""
echo "# Database"
echo "DATABASE_URL=postgresql://user:password@host:port/database"
echo ""
echo "# Payment Processing"
echo "STRIPE_SECRET_KEY=sk_test_..."
echo "VITE_STRIPE_PUBLIC_KEY=pk_test_..."
echo "PAYPAL_CLIENT_ID=your-paypal-client-id"
echo "PAYPAL_CLIENT_SECRET=your-paypal-secret"
echo ""
echo "# AI Services"
echo "ANTHROPIC_API_KEY=your-anthropic-api-key"
echo ""

echo "3. Database setup:"
echo "Choose one of the following options:"
echo ""
echo "Option A - Import schema and data separately:"
echo "  psql \$DATABASE_URL < schema.sql"
echo "  psql \$DATABASE_URL < data.sql"
echo ""
echo "Option B - Use complete backup:"
echo "  psql \$DATABASE_URL < full_database_backup.sql"
echo ""

echo "4. Starting the application:"
echo "Development mode:"
echo "  npm run dev"
echo ""
echo "Production mode:"
echo "  npm run build"
echo "  npm start"
echo ""

echo "5. Application features:"
echo "✅ Multi-role user system (admin, seller, customer, business)"
echo "✅ AI-powered buyback system with admin approval"
echo "✅ Real-time messaging between users"
echo "✅ Stripe & PayPal payment processing"
echo "✅ Email notification system"
echo "✅ Comprehensive admin dashboard"
echo "✅ Product reviews and ratings"
echo "✅ Breadcrumb navigation throughout"
echo ""

echo "📖 For detailed setup instructions, see backup_manifest.md"
echo ""
echo "🎉 Installation script completed!"
echo "Configure your environment variables and run the database setup commands above."