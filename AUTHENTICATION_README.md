# Authentication System - BharatIntern

This document provides a comprehensive overview of the authentication system implemented in the BharatIntern application using Supabase.

## 🏗️ Architecture Overview

The authentication system is built with the following components:

- **Supabase Auth**: Handles user authentication, email verification, and password management
- **Role-Based Access Control (RBAC)**: Three distinct user roles with different permissions
- **Database Triggers**: Automatic profile creation when users sign up
- **Row Level Security (RLS)**: Database-level security policies

## 👥 User Roles

### 1. Candidate
- **Purpose**: Job seekers looking for internships
- **Permissions**:
  - View and apply to job postings
  - Manage personal profile
  - Track application status
  - Access learning resources
- **Dashboard**: `/candidate/dashboard`

### 2. Company
- **Purpose**: Organizations posting internship opportunities
- **Permissions**:
  - Create and manage job postings
  - Review and shortlist candidates
  - Manage company profile
  - View application analytics
- **Dashboard**: `/company/dashboard`

### 3. Admin
- **Purpose**: System administrators
- **Permissions**:
  - Full system access
  - User management
  - System configuration
  - Analytics and reporting
- **Dashboard**: `/admin/dashboard`

## 🔐 Authentication Flow

### Sign Up Process
1. User selects their role (Candidate/Company/Admin)
2. Fills out registration form with role-specific fields
3. Supabase creates user account and sends verification email
4. Database trigger automatically creates user profile
5. User verifies email and can log in

### Login Process
1. User enters email, password, and selects role
2. System validates credentials with Supabase
3. Checks user's actual role against selected role
4. Redirects to appropriate dashboard based on role
5. Sets up user session with role information

### Password Reset
1. User requests password reset from login page
2. Supabase sends reset email with secure link
3. User clicks link and is redirected to reset page
4. User enters new password
5. Password is updated and user is redirected to login

## 🗄️ Database Schema

### Profiles Table
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('candidate', 'company', 'admin')) DEFAULT 'candidate',
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    location TEXT,
    company_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    skills TEXT[],
    experience_years INTEGER DEFAULT 0,
    education TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Security Policies
- Users can only view/edit their own profiles
- Companies can view candidate profiles
- Admins can view all profiles
- Automatic profile creation via database triggers

## 🛠️ Implementation Details

### AuthContext
The `AuthContext` provides:
- User state management
- Authentication methods (login, signup, logout)
- Role-based access control
- Session persistence

### Key Functions
```javascript
// Login with role validation
const login = async (email, password, role) => {
  // Validates credentials and checks role match
}

// Signup with automatic profile creation
const signup = async (userData) => {
  // Creates user and profile with role information
}

// Logout and session cleanup
const logout = async () => {
  // Clears user session and state
}
```

### Protected Routes
Routes are protected based on user roles:
- `/candidate/*` - Requires candidate role
- `/company/*` - Requires company role  
- `/admin/*` - Requires admin role

## 🔧 Configuration

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_NAME=BharatIntern
```

### Supabase Settings
1. **Authentication** → **Settings**:
   - Site URL: `http://localhost:3000` (dev) / `https://your-domain.com` (prod)
   - Redirect URLs: Include your domain with `/**`

2. **Authentication** → **Email Templates**:
   - Customize confirmation and reset password emails

3. **Database** → **SQL Editor**:
   - Run the schema from `supabase-schema.sql`

## 🧪 Testing

### Manual Testing
1. Create accounts with different roles
2. Test login with correct/incorrect roles
3. Verify email confirmation flow
4. Test password reset functionality
5. Check role-based route protection

### Automated Testing
Run the test script:
```bash
node test-auth.js
```

This will verify:
- Supabase connection
- Authentication functionality
- Database schema setup

## 🚀 Deployment

### Development
1. Set up Supabase project
2. Configure environment variables
3. Run database schema
4. Start development server: `npm run dev`

### Production
1. Update environment variables with production URLs
2. Configure production redirect URLs in Supabase
3. Set up proper email service (SMTP)
4. Deploy application
5. Test all authentication flows

## 🔒 Security Features

### Row Level Security (RLS)
- Database-level access control
- Users can only access their own data
- Role-based data visibility

### Email Verification
- Required for account activation
- Prevents fake accounts
- Secure password reset flow

### Session Management
- Automatic token refresh
- Secure session storage
- Proper logout handling

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check `.env.local` file exists and has correct values
   - Restart development server

2. **"Access denied" errors**
   - Verify user role in profiles table
   - Check RLS policies are applied

3. **Email not sending**
   - Configure SMTP in Supabase dashboard
   - Check spam folder
   - Verify redirect URLs

4. **Profile not created**
   - Check database trigger is set up
   - Verify user metadata is passed correctly

### Debug Queries
```sql
-- Check user profiles
SELECT * FROM public.profiles;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check auth users
SELECT * FROM auth.users;
```

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

## 🤝 Contributing

When making changes to the authentication system:

1. Test all user roles and flows
2. Update documentation if needed
3. Ensure backward compatibility
4. Test with different email providers
5. Verify security policies are maintained

---

**Note**: Always keep your Supabase credentials secure and never commit them to version control.
