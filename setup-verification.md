# Supabase Setup Verification Guide

## Step-by-Step Verification

### 1. Environment Configuration
- [ ] Update `src/environments/environment.ts` with your Supabase credentials
- [ ] Verify the URL format: `https://your-project-id.supabase.co`
- [ ] Verify the anon key starts with `eyJ`

### 2. Database Schema
- [ ] Run the SQL migration in Supabase SQL Editor
- [ ] Check that tables are created:
  - `users` table
  - `goals` table  
  - `milestones` table
  - `progress_entries` table
- [ ] Verify RLS policies are enabled
- [ ] Check that indexes are created

### 3. Authentication Setup
- [ ] Add redirect URLs in Supabase Auth settings
- [ ] Test connection at `/test-supabase`

### 4. Test Commands

Run these commands to test the setup:

```bash
# Start the development server
ng serve

# Navigate to test page
# http://localhost:4200/test-supabase
```

### 5. Expected Test Results

✅ **Connection Status**: "Connected successfully"
✅ **Authentication**: Can sign in/out
✅ **Goal Creation**: Can create test goals
✅ **Goal Retrieval**: Can fetch goals from database

### 6. Troubleshooting

**If connection fails:**
- Check your Supabase URL and anon key
- Verify the project is active
- Check browser console for CORS errors

**If authentication fails:**
- Verify redirect URLs are correct
- Check that email confirmation is disabled (for testing)
- Try creating a user manually in Supabase dashboard

**If database operations fail:**
- Verify the SQL migration ran successfully
- Check that RLS policies are properly configured
- Ensure you're authenticated before testing CRUD operations

### 7. Next Steps After Setup

1. **Test the onboarding flow** at `/onboarding`
2. **Create a real user account** through signup
3. **Test goal creation** and management
4. **Verify real-time updates** work
5. **Deploy to production** with updated environment.prod.ts

## Quick Test Commands

```bash
# Check if Angular builds successfully
npm run build

# Start development server
ng serve

# Test specific route
curl http://localhost:4200/test-supabase
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS errors | Check redirect URLs in Supabase Auth settings |
| RLS policy errors | Ensure user is authenticated before database operations |
| Type errors | The Goal model has been updated for compatibility |
| Build failures | Check that all imports are correct |

## Production Checklist

- [ ] Update `environment.prod.ts` with production credentials
- [ ] Set production redirect URLs in Supabase
- [ ] Configure custom domain (if needed)
- [ ] Set up monitoring and logging
- [ ] Test all features with real data 