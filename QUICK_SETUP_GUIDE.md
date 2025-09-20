# 🚀 Quick Setup Guide - BharatIntern Authentication

## Current Status
❌ **Database schema not applied** - This is why login/signup is failing!

## Step 1: Apply Database Schema (REQUIRED)

1. **Open Supabase Dashboard**:
   - Go to: https://kqijjfivbwudbvkykgyo.supabase.co
   - Login with your Supabase account

2. **Navigate to SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Apply the Schema**:
   - Open the file `supabase-schema.sql` in your project
   - Copy ALL the content from that file
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Verify Tables Created**:
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `profiles` (user profiles with roles)
     - `job_postings` (internship postings)
     - `applications` (candidate applications)

## Step 2: Configure Authentication

1. **Go to Authentication → Settings**:
   - Set **Site URL** to: `http://localhost:3001`
   - Add **Redirect URLs**:
     - `http://localhost:3001/**`
     - `http://localhost:3000/**`

2. **Email Settings** (Optional):
   - Go to Authentication → Email Templates
   - Customize the confirmation and reset emails if needed

## Step 3: Test the Setup

1. **Verify Database**:
   ```bash
   node verify-database.js
   ```
   You should see ✅ for all tables.

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Test Signup**:
   - Go to: http://localhost:3001/signup
   - Create a test account with role "candidate"
   - Check your email for verification

4. **Test Login**:
   - After email verification, go to: http://localhost:3001/login
   - Login with your test account

## Step 4: Create Admin User (Optional)

If you need an admin user:

1. **Create a regular user first** (via signup)
2. **Update the user's role** in Supabase:
   - Go to Table Editor → profiles
   - Find your user and change `role` from `candidate` to `admin`

## Troubleshooting

### "Login failed" errors:
- ✅ Database schema applied? (Check Step 1)
- ✅ Email verified? (Check your inbox)
- ✅ Correct role selected? (candidate/company/admin)

### "Signup failed" errors:
- ✅ Database schema applied? (Check Step 1)
- ✅ Valid email format?
- ✅ Password at least 6 characters?
- ✅ Email not already registered?

### "Access denied" errors:
- ✅ User role matches selected role?
- ✅ User profile exists in database?

## Quick Test Commands

```bash
# Verify database setup
node verify-database.js

# Start development server
npm run dev

# Check if server is running
curl http://localhost:3001
```

## Success Indicators

✅ Database verification shows all tables exist
✅ Can signup with any role (candidate/company/admin)
✅ Can login after email verification
✅ Role-based access works correctly
✅ Can access appropriate dashboards

---

**Need help?** Check the browser console for detailed error messages!
