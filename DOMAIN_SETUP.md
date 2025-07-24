# Custom Domain Setup with Namecheap and Netlify

## Overview
This guide will help you connect your Namecheap domain to your TrackGoal app deployed on Netlify.

## Prerequisites
- ✅ TrackGoal app built and ready for deployment
- ✅ Netlify account created
- ✅ Namecheap domain purchased
- ✅ Netlify deployment configured

## Step 1: Deploy to Netlify

### Option A: Deploy via Netlify CLI
```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy your app
npm run build
netlify deploy --prod --dir=dist/TrackGoal-app/browser
```

### Option B: Deploy via Netlify Dashboard
1. Go to [netlify.com](https://netlify.com) and sign in
2. Click "New site from Git" or "Add new site" → "Deploy manually"
3. Drag and drop your `dist/TrackGoal-app/browser` folder
4. Your site will be deployed with a random URL like `https://random-name.netlify.app`

## Step 2: Configure Custom Domain in Netlify

1. **In Netlify Dashboard:**
   - Go to your deployed site
   - Click "Domain settings" in the top navigation
   - Click "Add custom domain"
   - Enter your domain (e.g., `yourdomain.com` or `www.yourdomain.com`)
   - Click "Verify"
   

2. **Netlify will provide DNS records to configure in Namecheap**

## Step 3: Configure DNS in Namecheap

### Method 1: Using Netlify's DNS (Recommended)
1. In Netlify domain settings, click "Use Netlify DNS"
2. Netlify will provide nameservers
3. In Namecheap:
   - Go to your domain management
   - Click "Domain" tab
   - Under "Nameservers", select "Custom DNS"
   - Replace existing nameservers with Netlify's nameservers:
     ```
     dns1.p01.nsone.net
     dns2.p01.nsone.net
     dns3.p01.nsone.net
     dns4.p01.nsone.net
     ```
   - Save changes

### Method 2: Using Namecheap DNS (Alternative)
1. In Netlify, get the DNS records to add
2. In Namecheap:
   - Go to "Advanced DNS"
   - Add these records:
     ```
     Type: A
     Host: @
     Value: 75.2.60.5
     TTL: Automatic
     
     Type: CNAME
     Host: www
     Value: your-site-name.netlify.app
     TTL: Automatic
     ```

## Step 4: SSL Certificate Setup

1. **Netlify will automatically provision SSL:**
   - Go to "HTTPS" in domain settings
   - Enable "Let's Encrypt certificate"
   - Netlify will automatically handle SSL renewal

2. **Force HTTPS redirect:**
   - In domain settings, enable "Force HTTPS"
   - This ensures all traffic uses secure connections

## Step 5: Environment Variables for Production

### Set up Supabase environment variables in Netlify:
1. In Netlify dashboard, go to "Site settings" → "Environment variables"
2. Add these variables:
   ```
   SUPABASE_URL=https://phpcmgecfoeulbhuqsvz.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGNtZ2VjZm9ldWxiaHVxc3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDg2NTcsImV4cCI6MjA2ODA4NDY1N30.NctdWI7xQ7E96YRK7RYNnA_9KLV3VUaC4o0rlHTbAp4
   ```

## Step 6: Update Supabase Settings

### Configure Redirect URLs in Supabase:
1. Go to your Supabase project dashboard
2. Navigate to Authentication → URL Configuration
3. Add your custom domain URLs:
   ```
   https://trackgoal.online/auth/callback
   https://www.trackgoal.online/auth/callback
   https://trackgoal.online/auth/confirm
   https://www.trackgoal.online/auth/confirm
   ```

### Update Site URL:
1. In Supabase dashboard, go to Settings → API
2. Update the Site URL to your custom domain
3. Save changes

## Step 7: Test Your Domain

1. **DNS Propagation:**
   - DNS changes can take 24-48 hours to propagate
   - You can check propagation at [whatsmydns.net](https://whatsmydns.net)

2. **Test the site:**
   - Visit your custom domain
   - Test authentication flows
   - Verify all features work correctly

## Step 8: Optional - Subdomain Setup

If you want to use a subdomain (e.g., `app.yourdomain.com`):

1. **In Netlify:**
   - Add the subdomain in domain settings
   - Netlify will provide DNS records

2. **In Namecheap:**
   - Add CNAME record:
     ```
     Type: CNAME
     Host: app
     Value: your-site-name.netlify.app
     TTL: Automatic
     ```

## Troubleshooting

### Common Issues:

1. **Domain not resolving:**
   - Check DNS propagation
   - Verify nameservers are correct
   - Wait 24-48 hours for full propagation

2. **SSL certificate issues:**
   - Ensure DNS is properly configured
   - Check that A/CNAME records are correct
   - Contact Netlify support if needed

3. **Authentication not working:**
   - Verify Supabase redirect URLs are updated
   - Check environment variables in Netlify
   - Test with both www and non-www versions

### Useful Commands:
```bash
# Check if your domain resolves
nslookup yourdomain.com

# Test SSL certificate
curl -I https://yourdomain.com

# Check DNS propagation
dig yourdomain.com
```

## Security Considerations

1. **Environment Variables:**
   - Never commit sensitive keys to Git
   - Use Netlify's environment variables
   - Rotate keys regularly

2. **HTTPS:**
   - Always force HTTPS redirects
   - Use HSTS headers if needed
   - Monitor SSL certificate expiration

3. **Domain Security:**
   - Enable domain lock in Namecheap
   - Use strong registrar passwords
   - Enable 2FA on all accounts

## Next Steps

1. **Monitor Performance:**
   - Set up Netlify Analytics
   - Monitor Core Web Vitals
   - Track user engagement

2. **Backup Strategy:**
   - Regular database backups
   - Version control for code
   - Document configuration changes

3. **Maintenance:**
   - Keep dependencies updated
   - Monitor for security updates
   - Regular SSL certificate checks

## Support Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Namecheap Knowledge Base](https://www.namecheap.com/support/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Note:** This setup assumes you're using the current Supabase configuration. If you change your Supabase project, update the environment variables and redirect URLs accordingly. 