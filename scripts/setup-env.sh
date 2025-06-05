#!/bin/bash

# Inner Clarity Portal Environment Setup Script

echo "🚀 Setting up Inner Clarity Portal environment..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.local.example .env.local
    echo "✅ .env.local created from example"
    echo "⚠️  Please update the environment variables in .env.local"
else
    echo "✅ .env.local already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "🔧 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env.local file with your Supabase credentials"
echo "2. Run the database setup script in Supabase SQL Editor"
echo "3. Start the development server with: npm run dev"
echo ""
echo "For detailed setup instructions, see docs/database-setup-guide.md"
