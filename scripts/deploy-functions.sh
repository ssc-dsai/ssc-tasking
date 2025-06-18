#!/bin/bash

# Deploy Supabase Edge Functions
# Usage: ./scripts/deploy-functions.sh [function-name]

set -e

echo "🚀 Deploying Supabase Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm i supabase@"beta" -g"
    exit 1
fi

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "   supabase login"
    exit 1
fi

# Change to the project root directory
cd "$(dirname "$0")/.."

# If specific function is provided, deploy only that function
if [ "$1" ]; then
    echo "📦 Deploying function: $1"
    supabase functions deploy "$1"
    echo "✅ Function $1 deployed successfully!"
else
    echo "📦 Deploying all functions..."
    supabase functions deploy
    echo "✅ All functions deployed successfully!"
fi

echo "🎉 Deployment complete!"
echo ""
echo "Your functions are available at:"
echo "https://your-project-ref.supabase.co/functions/v1/"
echo ""
echo "Don't forget to set up your environment variables in the Supabase dashboard if needed." 