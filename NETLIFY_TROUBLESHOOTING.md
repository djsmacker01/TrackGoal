# Netlify Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. Build Failures

#### Issue: "Build command failed"
**Solution:**
```bash
# Check your build locally first
npm run build

# If it fails, check for:
# - Missing dependencies
# - TypeScript errors
# - Environment variable issues
```

#### Issue: "Module not found" errors
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 2. Publish Directory Issues

#### Issue: "Publish directory does not exist"
**Solution:**
- Verify the correct publish path in `netlify.toml`
- For Angular 17+: Use `dist/TrackGoal-app/browser`
- For older Angular: Use `dist/TrackGoal-app`

### 3. Environment Variables

#### Issue: "Environment variables not found"
**Solution:**
1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add these variables:
   ```
   SUPABASE_URL=https://phpcmgecfoeulbhuqsvz.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGNtZ2VjZm9ldWxiaHVxc3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDg2NTcsImV4cCI6MjA2ODA4NDY1N30.NctdWI7xQ7E96YRK7RYNnA_9KLV3VUaC4o0rlHTbAp4
   ```

### 4. Node Version Issues

#### Issue: "Node version incompatible"
**Solution:**
- Update `netlify.toml` to specify Node version:
  ```toml
  [build.environment]
  NODE_VERSION = "18"
  ```

### 5. Routing Issues

#### Issue: "404 errors on page refresh"
**Solution:**
- Ensure redirects are configured in `netlify.toml`:
  ```toml
  [[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  ```

### 6. Bundle Size Issues

#### Issue: "Bundle size too large"
**Solution:**
- Update `angular.json` budgets:
  ```json
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "2MB",
      "maximumError": "5MB"
    }
  ]
  ```

## Deployment Checklist

### Before Deploying:
- [ ] `npm run build` works locally
- [ ] No TypeScript errors
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] `netlify.toml` has correct publish path

### After Deploying:
- [ ] Check build logs in Netlify dashboard
- [ ] Verify site is accessible
- [ ] Test authentication flows
- [ ] Check console for errors
- [ ] Test on different devices

## Debugging Commands

```bash
# Test build locally
npm run build

# Check build output
ls -la dist/TrackGoal-app/browser/

# Test deployment locally
netlify dev

# Check Netlify status
netlify status

# View build logs
netlify logs
```

## Common Error Messages

### "Build command failed"
- Check build logs for specific errors
- Verify all dependencies are installed
- Check for TypeScript compilation errors

### "Publish directory does not exist"
- Verify the correct path in `netlify.toml`
- Check that build completed successfully
- Ensure build output matches publish path

### "Environment variables not found"
- Add environment variables in Netlify dashboard
- Check variable names match your code
- Verify no typos in variable names

### "Module not found"
- Clear node_modules and reinstall
- Check package.json for missing dependencies
- Verify import paths are correct

## Getting Help

1. **Check Netlify Build Logs:**
   - Go to your site in Netlify dashboard
   - Click on the latest deployment
   - Review the build logs for errors

2. **Test Locally First:**
   ```bash
   npm run build
   npx serve dist/TrackGoal-app/browser
   ```

3. **Use Netlify CLI for Debugging:**
   ```bash
   netlify login
   netlify status
   netlify logs
   ```

4. **Check Angular Configuration:**
   - Verify `angular.json` settings
   - Check TypeScript configuration
   - Review build budgets

## Quick Fixes

### If build fails:
```bash
# Clear everything and rebuild
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### If deployment fails:
```bash
# Deploy manually
npm run build
netlify deploy --prod --dir=dist/TrackGoal-app/browser
```

### If site doesn't load:
1. Check redirects in `netlify.toml`
2. Verify environment variables
3. Check browser console for errors
4. Test authentication flows

---

**Remember:** Always test your build locally before deploying to catch issues early! 