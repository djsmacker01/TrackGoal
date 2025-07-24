#!/bin/bash

echo "🚀 TrackGoal Deployment Script"
echo "=============================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if build output exists
if [ ! -d "dist/TrackGoal-app/browser" ]; then
    echo "❌ Build output not found at dist/TrackGoal-app/browser"
    echo "📁 Available build output:"
    ls -la dist/
    exit 1
fi

echo ""
echo "🎉 Build is ready for deployment!"
echo ""
echo "📁 Build output location: dist/TrackGoal-app/browser"
echo ""
echo "🌐 To deploy to Netlify:"
echo "1. Go to https://app.netlify.com"
echo "2. Click 'New site from Git' or 'Add new site' → 'Deploy manually'"
echo "3. Drag and drop the 'dist/TrackGoal-app/browser' folder"
echo "4. Your site will be deployed with a random URL"
echo ""
echo "🔧 Don't forget to set environment variables in Netlify:"
echo "   SUPABASE_URL=https://phpcmgecfoeulbhuqsvz.supabase.co"
echo "   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGNtZ2VjZm9ldWxiaHVxc3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDg2NTcsImV4cCI6MjA2ODA4NDY1N30.NctdWI7xQ7E96YRK7RYNnA_9KLV3VUaC4o0rlHTbAp4"
echo ""
echo "📖 For detailed instructions, see DOMAIN_SETUP.md" 