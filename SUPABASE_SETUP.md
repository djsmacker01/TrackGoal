# Supabase Setup Guide

## 1. Database Migration

### Run the Migration SQL:
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the entire contents of `supabase-migration.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration

This will create:
- `users` table (extends auth.users)
- `goals` table with proper types and constraints
- `milestones` table
- `progress_entries` table
- Row Level Security (RLS) policies
- Database functions for analytics
- Proper indexes for performance

## 2. Environment Configuration

Your environment is already configured in `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://phpcmgecfoeulbhuqsvz.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

## 3. Testing the Connection

### Test Database Connection:
1. Start your Angular app: `ng serve`
2. Navigate to: `http://localhost:4200/test-supabase`
3. Click **"Test Connection"** to verify database connectivity
4. Click **"Sign In Test User"** to test authentication
5. Click **"Test Goals CRUD"** to test goal operations

### Expected Results:
- ✅ Database connection successful
- ✅ Authentication working
- ✅ Goals CRUD operations successful
- ✅ Real-time data loading

## 4. Application Features

Once the database is connected, you can:

### Create Goals:
- Navigate to `/add-goal`
- Fill in goal details
- Goals are saved to Supabase database

### View Goals:
- Navigate to `/goals-list`
- See all your goals from the database
- Filter and search functionality

### Update Progress:
- Navigate to `/update-progress/:goalId`
- Update goal progress
- Complete milestones
- Changes saved to database

### Analytics:
- Navigate to `/analytics`
- View progress charts
- Data comes from real database

## 5. Troubleshooting

### Common Issues:

**Connection Failed:**
- Verify your Supabase URL and anon key
- Check if the migration SQL ran successfully
- Ensure RLS policies are enabled

**Authentication Issues:**
- Check if auth is enabled in Supabase
- Verify email templates are configured
- Test with the test user creation

**Goals Not Loading:**
- Check browser console for errors
- Verify the user is authenticated
- Check RLS policies are working

### Debug Steps:
1. Open browser developer tools
2. Check Network tab for API calls
3. Check Console for error messages
4. Use the test component to isolate issues

## 6. Next Steps

After successful database connection:

1. **Add Real Users:** Implement proper user registration
2. **Enhance Security:** Configure additional RLS policies
3. **Add Features:** Implement notifications, sharing, etc.
4. **Deploy:** Deploy to production with proper environment variables

## 7. Production Deployment

For production:
1. Create production environment file
2. Use production Supabase project
3. Configure proper domain settings
4. Set up monitoring and logging 