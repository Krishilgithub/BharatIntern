# Supabase Authentication Setup Guide

This guide will help you set up Supabase authentication for the BharatIntern project.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Supabase project created

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `bharat-intern`
   - Database Password: (choose a strong password)
   - Region: (choose closest to your users)
5. Click "Create new project"

## Step 2: Get API Keys

1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - Project URL
   - Anon (public) key

## Step 3: Set Up Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Step 4: Set Up Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script
4. This will create:
   - `profiles` table for user data
   - `job_postings` table for internship postings
   - `applications` table for job applications
   - Row Level Security (RLS) policies
   - Triggers for automatic profile creation

## Step 5: Configure Authentication

1. In Supabase dashboard, go to Authentication → Settings
2. Configure the following:

### Site URL
- Set to `http://localhost:3000` for development
- Set to your production domain for production

### Redirect URLs
Add these URLs:
- `http://localhost:3000/**` (for development)
- `https://yourdomain.com/**` (for production)
- `http://localhost:3000/reset-password` (for password reset)

### Email Templates (Optional)
You can customize the email templates in Authentication → Email Templates

## Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/signup`
3. Create a test account
4. Check your email for confirmation link
5. Try logging in

## Step 7: Run Tests

Run the authentication tests to verify everything works:

```bash
npm test
```

## Database Schema Overview

### Profiles Table
Stores user profile information including:
- Basic info (name, email, phone, location)
- Role (candidate, company, admin)
- Company-specific fields (for company users)
- Skills, experience, education (for candidates)
- Verification status

### Job Postings Table
Stores internship/job postings with:
- Company information
- Job details (title, description, requirements)
- Application settings (deadline, max applications)
- Status tracking

### Applications Table
Stores job applications with:
- Candidate and job posting references
- Application materials (cover letter, resume)
- Status tracking
- Review notes

## Security Features

### Row Level Security (RLS)
- Users can only access their own data
- Companies can view candidate profiles and applications for their jobs
- Admins have full access
- Candidates can view active job postings

### Authentication
- Email/password authentication
- Email confirmation required
- Password reset functionality
- Session management

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Check that `.env.local` exists and has correct values
   - Restart your development server after adding environment variables

2. **"Invalid credentials" error**
   - Ensure email confirmation is completed
   - Check that the user exists in Supabase Auth

3. **"Access denied" error**
   - Verify the user's role matches the requested role
   - Check RLS policies are correctly set up

4. **Database connection issues**
   - Verify your Supabase URL and anon key
   - Check that your project is not paused

### Debug Mode

To enable debug logging, add this to your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_DEBUG=true
```

## Production Deployment

1. Update environment variables with production Supabase credentials
2. Update Site URL and Redirect URLs in Supabase dashboard
3. Consider enabling additional security features:
   - Rate limiting
   - IP restrictions
   - Advanced email templates

## Support

If you encounter issues:
1. Check the Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
2. Review the test files for expected behavior
3. Check the browser console for error messages
4. Verify your database schema matches the provided SQL script
