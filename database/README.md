# Supabase Database Setup for Resume Analyzer

## Problem

The console errors show that the Supabase database tables don't exist:

```
Could not find the table 'public.resume_analyses' in the schema cache
```

## Solution

You need to create the required database tables in your Supabase project.

## Steps to Fix

### 1. Access Supabase SQL Editor

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project (the one with URL: `kqijjfivbwudbvkykgyo.supabase.co`)
3. Navigate to **SQL Editor** in the left sidebar
4. Click **"New Query"**

### 2. Run the Database Setup Script

1. Copy the entire content from `database/setup_tables.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** button (or press Ctrl+Enter)

### 3. Verify Tables Were Created

After running the script, you can verify by running this query:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND (table_name LIKE '%resume%' OR table_name IN ('extracted_skills', 'career_suggestions', 'ats_compatibility'));
```

You should see 5 tables:

- `resume_analyses`
- `extracted_skills`
- `resume_improvements`
- `career_suggestions`
- `ats_compatibility`

### 4. Check Your Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://kqijjfivbwudbvkykgyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## What This Creates

### Tables Structure:

1. **resume_analyses** - Main table storing resume analysis data
2. **extracted_skills** - Skills extracted from resumes
3. **resume_improvements** - Improvement suggestions
4. **career_suggestions** - Career recommendations
5. **ats_compatibility** - ATS compatibility analysis

### Security Features:

- Row Level Security (RLS) enabled
- Users can only access their own data
- Proper indexes for performance
- Foreign key relationships maintained

## After Setup

Once you've run the SQL script:

1. Refresh your Next.js application
2. Upload a resume to test
3. The database errors should be resolved
4. Your analysis history will be saved properly

## Troubleshooting

If you still get errors after setup:

1. Check that all 5 tables exist in Supabase
2. Verify your environment variables are correct
3. Make sure you're logged in to the app (auth.uid() needs to exist)
4. Check browser console for any remaining errors
