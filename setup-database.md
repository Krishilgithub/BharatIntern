# Database Setup Instructions

## Step 1: Apply Database Schema

1. Go to your Supabase dashboard: https://kqijjfivbwudbvkykgyo.supabase.co
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the entire content from `supabase-schema.sql` file
5. Paste it into the SQL editor
6. Click **Run** to execute the schema

## Step 2: Verify Tables Created

After running the schema, you should see these tables:
- `profiles` - User profiles with roles
- `job_postings` - Job postings by companies
- `applications` - Applications by candidates

## Step 3: Check Authentication Settings

1. Go to **Authentication** → **Settings**
2. Set **Site URL** to: `http://localhost:3001`
3. Add **Redirect URLs**:
   - `http://localhost:3001/**`
   - `http://localhost:3000/**` (backup)

## Step 4: Test Authentication

1. Restart your development server: `npm run dev`
2. Go to `http://localhost:3001/signup`
3. Try creating an account with role "candidate"
4. Check your email for verification
5. After verification, try logging in

## Troubleshooting

### If you get "relation profiles does not exist" error:
- The database schema hasn't been applied yet
- Follow Step 1 above

### If signup fails:
- Check that email authentication is enabled in Supabase
- Verify the redirect URLs are set correctly
- Check the browser console for detailed error messages

### If login fails:
- Make sure you've verified your email address
- Check that the user profile was created (go to Table Editor → profiles)
- Verify the role matches what you're trying to login as
