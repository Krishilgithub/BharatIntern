-- Supabase Database Schema for BharatIntern
-- Run this script in your Supabase SQL editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
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

-- Create RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Companies can view candidate profiles
CREATE POLICY "Companies can view candidate profiles" ON public.profiles
    FOR SELECT USING (
        role = 'candidate' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'company'
        )
    );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'candidate')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create job postings table
CREATE TABLE IF NOT EXISTS public.job_postings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[],
    skills_required TEXT[],
    location TEXT,
    remote_allowed BOOLEAN DEFAULT FALSE,
    duration_weeks INTEGER,
    stipend_amount DECIMAL(10,2),
    application_deadline TIMESTAMP WITH TIME ZONE,
    start_date TIMESTAMP WITH TIME ZONE,
    max_applications INTEGER,
    current_applications INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('draft', 'active', 'paused', 'closed')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    job_posting_id UUID REFERENCES public.job_postings(id) ON DELETE CASCADE NOT NULL,
    cover_letter TEXT,
    resume_url TEXT,
    status TEXT CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted')) DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    UNIQUE(candidate_id, job_posting_id)
);

-- Create RLS policies for job_postings
ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

-- Companies can manage their own job postings
CREATE POLICY "Companies can manage own job postings" ON public.job_postings
    FOR ALL USING (
        company_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'company'
        )
    );

-- Candidates can view active job postings
CREATE POLICY "Candidates can view active job postings" ON public.job_postings
    FOR SELECT USING (
        status = 'active' AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'candidate'
        )
    );

-- Admins can view all job postings
CREATE POLICY "Admins can view all job postings" ON public.job_postings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Candidates can manage their own applications
CREATE POLICY "Candidates can manage own applications" ON public.applications
    FOR ALL USING (
        candidate_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'candidate'
        )
    );

-- Companies can view applications for their job postings
CREATE POLICY "Companies can view applications for their jobs" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.job_postings jp
            JOIN public.profiles p ON jp.company_id = p.id
            WHERE jp.id = job_posting_id 
            AND p.id = auth.uid() 
            AND p.role = 'company'
        )
    );

-- Admins can view all applications
CREATE POLICY "Admins can view all applications" ON public.applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_job_postings_company_id ON public.job_postings(company_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON public.job_postings(status);
CREATE INDEX IF NOT EXISTS idx_applications_candidate_id ON public.applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_posting_id ON public.applications(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- Create function to update job posting application count
CREATE OR REPLACE FUNCTION public.update_application_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.job_postings 
        SET current_applications = current_applications + 1
        WHERE id = NEW.job_posting_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.job_postings 
        SET current_applications = current_applications - 1
        WHERE id = OLD.job_posting_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update application count
DROP TRIGGER IF EXISTS update_job_application_count ON public.applications;
CREATE TRIGGER update_job_application_count
    AFTER INSERT OR DELETE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.update_application_count();

-- Insert sample admin user (optional - replace with your admin email)
-- Note: This will only work if the user is already created in Supabase Auth
-- INSERT INTO public.profiles (id, email, name, role, is_verified)
-- SELECT id, email, 'Admin User', 'admin', true
-- FROM auth.users 
-- WHERE email = 'admin@bharatintern.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', is_verified = true;
