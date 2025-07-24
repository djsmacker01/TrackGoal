#!/bin/bash

echo "🚀 TrackGoal Free Tier Deployment"
echo "================================="

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

# Build the application with production optimizations
echo "🔨 Building application (optimized for free tier)..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check build size (important for free tier)
echo "📊 Build size analysis:"
if command -v du &> /dev/null; then
    BUILD_SIZE=$(du -sh dist/TrackGoal-app/browser/ | cut -f1)
    echo "📁 Build size: $BUILD_SIZE"
    
    # Check if size is reasonable for free tier
    if [[ "$BUILD_SIZE" == *"M"* ]]; then
        SIZE_NUM=$(echo $BUILD_SIZE | sed 's/M.*//')
        if (( $(echo "$SIZE_NUM > 10" | bc -l) )); then
            echo "⚠️  Warning: Build size is large ($BUILD_SIZE). Consider optimizing."
        else
            echo "✅ Build size is good for free tier ($BUILD_SIZE)"
        fi
    else
        echo "✅ Build size is excellent for free tier ($BUILD_SIZE)"
    fi
else
    echo "📁 Build output created successfully"
fi

# Check if build output exists
if [ ! -d "dist/TrackGoal-app/browser" ]; then
    echo "❌ Build output not found at dist/TrackGoal-app/browser"
    echo "📁 Available build output:"
    ls -la dist/
    exit 1
fi

echo ""
echo "🎉 Build is ready for Netlify Free Tier deployment!"
echo ""
echo "📁 Build output location: dist/TrackGoal-app/browser"
echo ""
echo "🌐 Free Tier Deployment Options:"
echo ""
echo "Option 1: Manual Deployment (Recommended)"
echo "1. Go to https://app.netlify.com"
echo "2. Sign up/Login (free account)"
echo "3. Click 'Add new site' → 'Deploy manually'"
echo "4. Drag and drop the 'dist/TrackGoal-app/browser' folder"
echo "5. Wait 1-2 minutes for deployment"
echo ""
echo "Option 2: Git-based Deployment"
echo "1. Push your code to GitHub/GitLab"
echo "2. In Netlify: 'New site from Git'"
echo "3. Connect your repository"
echo "4. Set build settings:"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist/TrackGoal-app/browser"
echo ""
echo "🔧 Free Tier Environment Variables (set in Netlify dashboard):"
echo "   SUPABASE_URL=https://phpcmgecfoeulbhuqsvz.supabase.co"
echo "   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGNtZ2VjZm9ldWxiaHVxc3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDg2NTcsImV4cCI6MjA2ODA4NDY1N30.NctdWI7xQ7E96YRK7RYNnA_9KLV3VUaC4o0rlHTbAp4"
echo ""
echo "📊 Free Tier Limits:"
echo "   ✅ 100GB bandwidth/month (sufficient for ~100k users)"
echo "   ✅ 300 build minutes/month (plenty for your app)"
echo "   ✅ 1 custom domain per site (perfect for your Namecheap domain)"
echo "   ✅ Automatic SSL certificates"
echo ""
echo "📖 For detailed instructions, see NETLIFY_FREE_TIER_GUIDE.md" 