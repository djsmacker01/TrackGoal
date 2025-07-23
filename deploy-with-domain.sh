#!/bin/bash

# TrackGoal Deployment Script with Custom Domain Setup
# This script will build and deploy your app to Netlify

echo "🚀 Starting TrackGoal deployment with custom domain setup..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist/TrackGoal-app/browser

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed! Please check the errors above."
    exit 1
fi

echo "✅ Deployment completed successfully!"

# Get the deployed URL
DEPLOY_URL=$(netlify status --json | grep -o '"url":"[^"]*"' | cut -d'"' -f4)

echo ""
echo "🎉 Your TrackGoal app is now deployed!"
echo "📱 Deployed URL: $DEPLOY_URL"
echo ""
echo "🔗 Next Steps for Custom Domain Setup:"
echo "1. Go to your Netlify dashboard"
echo "2. Click on your deployed site"
echo "3. Go to 'Domain settings'"
echo "4. Click 'Add custom domain'"
echo "5. Enter your Namecheap domain"
echo "6. Follow the DNS configuration instructions"
echo ""
echo "📖 For detailed instructions, see DOMAIN_SETUP.md"
echo ""
echo "🔧 Environment Variables to set in Netlify:"
echo "   SUPABASE_URL=https://phpcmgecfoeulbhuqsvz.supabase.co"
echo "   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGNtZ2VjZm9ldWxiaHVxc3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDg2NTcsImV4cCI6MjA2ODA4NDY1N30.NctdWI7xQ7E96YRK7RYNnA_9KLV3VUaC4o0rlHTbAp4"
echo ""
echo "🌍 Don't forget to update Supabase redirect URLs with your custom domain!" 