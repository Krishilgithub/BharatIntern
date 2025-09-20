# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication with role-based access control for the BharatIntern application.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or sign in
2. Click "New Project"
3. Choose your organization and enter project details:
   - Name: `bharat-intern`
   - Database Password: (generate a strong password)
   - Region: Choose the closest to your users
4. Click "Create new project"

## 2. Get Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 3. Set Up Environment Variables

Create a `.env.local` file in your project root with the following content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
NEXT_PUBLIC_APP_NAME=BharatIntern
```

**Important:** Replace the placeholder values with your actual Supabase credentials.

## 4. Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `supabase-schema.sql` file
3. Paste it into the SQL editor and click **Run**

This will create:
- `profiles` table with role-based access
- Row Level Security (RLS) policies
- Triggers for automatic profile creation
- Job postings and applications tables

## 5. Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Configure the following:

### Site URL
- Set to: `http://localhost:3000` (for development)
- For production: `https://your-domain.com`

### Redirect URLs
Add these URLs:
- `http://localhost:3000/**` (for development)
- `https://your-domain.com/**` (for production)

### Email Settings
- Configure your email provider (SMTP) or use Supabase's built-in email service
- Customize email templates if needed

## 6. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`
3. Try creating an account with different roles:
   - Candidate
   - Company
   - Admin

4. Check your Supabase dashboard:
   - **Authentication** → **Users** to see created users
   - **Table Editor** → **profiles** to see user profiles with roles

## 7. Role-Based Access Control

The system supports three roles:

### Candidate
- Can view and apply to job postings
- Can manage their own profile and applications
- Access: `/candidate/dashboard`

### Company
- Can create and manage job postings
- Can view applications for their jobs
- Can shortlist candidates
- Access: `/company/dashboard`

### Admin
- Full access to all data
- Can manage users and system settings
- Access: `/admin/dashboard`

## 8. Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Role-based policies**: Different access levels based on user roles
- **Automatic profile creation**: Profiles are created when users sign up
- **Email verification**: Users must verify their email addresses

## 9. Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check that `.env.local` exists and has correct values
   - Restart your development server after adding environment variables

2. **"Access denied" errors**
   - Check that RLS policies are properly set up
   - Verify user roles in the profiles table

3. **Profile not created automatically**
   - Check that the database trigger is set up correctly
   - Manually create profile if needed

4. **Email not sending**
   - Configure SMTP settings in Supabase
   - Check spam folder
   - Verify redirect URLs are correct

### Database Queries for Debugging

```sql
-- Check all users
SELECT * FROM auth.users;

-- Check all profiles
SELECT * FROM public.profiles;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

## 10. Production Deployment

1. Update environment variables with production Supabase URL
2. Update Site URL and Redirect URLs in Supabase dashboard
3. Configure proper email settings
4. Set up monitoring and logging
5. Test all authentication flows

## Support

If you encounter issues:
1. Check the Supabase documentation
2. Review the console logs in your browser
3. Check the Supabase dashboard logs
4. Verify your database schema matches the provided SQL

---

**Note:** Keep your Supabase credentials secure and never commit them to version control.
