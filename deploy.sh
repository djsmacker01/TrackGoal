#!/bin/bash

echo "🚀 Starting TrackGoal deployment to Netlify..."

# Build the application
echo "📦 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build files are in: dist/TrackGoal-app/browser"
    echo ""
    echo "🌐 To deploy to Netlify:"
    echo "1. Go to https://app.netlify.com/"
    echo "2. Drag and drop the 'dist/TrackGoal-app/browser' folder"
    echo "3. Or connect your GitHub repository for automatic deployments"
    echo ""
    echo "🔧 Environment variables to set in Netlify:"
    echo "- SUPABASE_URL: https://phpcmgecfoeulbhuqsvz.supabase.co"
    echo "- SUPABASE_ANON_KEY: (your anon key)"
else
    echo "❌ Build failed!"
    exit 1
fi 