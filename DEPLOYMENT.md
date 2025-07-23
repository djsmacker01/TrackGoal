# 🚀 TrackGoal Deployment Guide

## Deploy to Netlify

### Method 1: Drag & Drop (Quickest)

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Go to Netlify:**
   - Visit https://app.netlify.com/
   - Sign up/Login with your account

3. **Deploy:**
   - Drag and drop the `dist/TrackGoal-app/browser` folder to Netlify
   - Your site will be live in seconds!

### Method 2: Git Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to https://app.netlify.com/
   - Click "New site from Git"
   - Connect your GitHub account
   - Select your repository

3. **Configure build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist/TrackGoal-app/browser`

### Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

```
SUPABASE_URL=https://phpcmgecfoeulbhuqsvz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGNtZ2VjZm9ldWxiaHVxc3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDg2NTcsImV4cCI6MjA2ODA4NDY1N30.NctdWI7xQ7E96YRK7RYNnA_9KLV3VUaC4o0rlHTbAp4
```

### Custom Domain (Optional)

1. Go to Site Settings → Domain Management
2. Add your custom domain
3. Configure DNS settings

### Troubleshooting

**Build fails:**
- Check Node.js version (use 18+)
- Ensure all dependencies are installed
- Check for TypeScript errors

**App doesn't load:**
- Verify environment variables are set
- Check browser console for errors
- Ensure Supabase is properly configured

**Routing issues:**
- The `netlify.toml` file handles SPA routing
- All routes redirect to `index.html`

### Performance Tips

1. **Enable compression** in Netlify settings
2. **Set up CDN** for faster global delivery
3. **Optimize images** before deployment
4. **Enable caching** for static assets

### Monitoring

- Use Netlify Analytics to track performance
- Set up error monitoring with Sentry
- Monitor Core Web Vitals

## 🎉 Success!

Your TrackGoal app should now be live on Netlify! 