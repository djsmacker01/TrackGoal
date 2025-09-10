# Fix Supabase Email Configuration Issue

## Problem
You're getting a 500 Internal Server Error with "Error sending confirmation email" when trying to sign up users.

## Root Cause
Your Supabase project exists but has email configuration issues. The email service is not properly configured to send confirmation emails.

## Solutions

### Option 1: Configure Supabase Email Settings (Recommended)

#### Step 1: Access Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Log into your account
3. Navigate to your project: `phpcmgecfoeulbhuqsvz`
4. Go to **Authentication** → **Settings**

#### Step 2: Configure Site URL and Redirect URLs
1. In **Site URL**, set:
   - Development: `http://localhost:4200`
   - Production: `
   `

2. In **Redirect URLs**, add:
   - `http://localhost:4200/verify-email`
   - `https://trackgoal.online/verify-email`
   - `http://localhost:4200/**` (for development)
   - `https://trackgoal.online/**` (for production)

#### Step 3: Configure Email Settings
1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. **Enable email confirmations**: Turn this ON
3. Choose one of these options:

**Option A: Use Supabase's Built-in Email (Free)**
- Keep "Use Supabase's built-in email service" enabled
- This should work for development and small projects

**Option B: Use Custom SMTP (Recommended for Production)**
- Disable "Use Supabase's built-in email service"
- Configure your SMTP provider:
  - **Gmail**: Use App Password
  - **SendGrid**: Use API key
  - **Mailgun**: Use API key
  - **AWS SES**: Use access keys

#### Step 4: Configure Email Templates
1. Go to **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. Ensure the template includes:
   - `{{ .ConfirmationURL }}` for the confirmation link
   - Proper HTML structure
4. Test the template

#### Step 5: Test Configuration
1. Try signing up with a test email
2. Check if confirmation email is received
3. If not, check the Supabase logs in **Logs** → **Auth**

### Option 2: Disable Email Confirmation (Development Only)

If you want to skip email confirmation for development:

1. Go to **Authentication** → **Settings**
2. **Enable email confirmations**: Turn this OFF
3. **Enable email change confirmations**: Turn this OFF

**⚠️ Warning**: Only do this for development. Production should always have email confirmation enabled.

### Option 3: Use Custom Email Provider

#### Gmail SMTP Configuration
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. In Supabase SMTP settings:
   - **Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **Username**: Your Gmail address
   - **Password**: Your App Password
   - **Sender email**: Your Gmail address
   - **Sender name**: TrackGoal

#### SendGrid Configuration
1. Create a SendGrid account
2. Generate an API key
3. In Supabase SMTP settings:
   - **Host**: `smtp.sendgrid.net`
   - **Port**: `587`
   - **Username**: `apikey`
   - **Password**: Your SendGrid API key
   - **Sender email**: Your verified sender email
   - **Sender name**: TrackGoal

## Testing the Fix

### 1. Test Signup Process
```bash
# Start your development server
npm start

# Try signing up with a test email
# Check browser console for any errors
# Check Supabase logs for email sending status
```

### 2. Check Supabase Logs
1. Go to **Logs** → **Auth** in your Supabase dashboard
2. Look for signup attempts and any error messages
3. Check if emails are being sent successfully

### 3. Verify Email Delivery
- Check spam folder
- Verify sender email is not blocked
- Test with different email providers (Gmail, Yahoo, Outlook)

## Common Issues and Solutions

### Issue: "Invalid redirect URL"
**Solution**: Add your redirect URLs to the allowed list in Supabase settings

### Issue: "Email template not found"
**Solution**: Ensure email templates are properly configured in Supabase

### Issue: "SMTP authentication failed"
**Solution**: Check your SMTP credentials and ensure 2FA is properly configured

### Issue: "Rate limit exceeded"
**Solution**: Wait a few minutes or upgrade your Supabase plan

## Production Considerations

### Security
- Always use HTTPS in production
- Use strong SMTP credentials
- Regularly rotate API keys
- Monitor email sending limits

### Performance
- Use a reliable email provider (SendGrid, Mailgun, AWS SES)
- Set up email delivery monitoring
- Implement retry logic for failed emails

### Compliance
- Ensure GDPR compliance for EU users
- Include unsubscribe links in emails
- Follow CAN-SPAM Act requirements

## Next Steps

1. **Immediate**: Configure email settings in Supabase dashboard
2. **Short-term**: Test signup process thoroughly
3. **Long-term**: Set up proper email monitoring and analytics
4. **Production**: Use a professional email service provider

## Support

If you continue to have issues:
1. Check Supabase status page
2. Review Supabase documentation
3. Contact Supabase support
4. Check your project's usage limits

---

**Note**: The code has been updated to handle email confirmation errors gracefully and provide better user feedback.
