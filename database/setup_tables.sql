-- Supabase Database Setup for Resume Analyzer
-- Run this script in your Supabase SQL Editor (https://app.supabase.com -> SQL Editor)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Main resume analyses table
CREATE TABLE IF NOT EXISTS public.resume_analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL,
    filename TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    extracted_text TEXT,
    overall_score INTEGER,
    analysis_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Extracted skills table
CREATE TABLE IF NOT EXISTS public.extracted_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    confidence INTEGER,
    category TEXT,
    level TEXT,
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Resume improvements table
CREATE TABLE IF NOT EXISTS public.resume_improvements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
    section TEXT NOT NULL,
    priority TEXT,
    suggestion TEXT NOT NULL,
    impact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Career suggestions table
CREATE TABLE IF NOT EXISTS public.career_suggestions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    match_percentage INTEGER,
    reason TEXT,
    salary_range TEXT,
    skills_needed TEXT[], -- Array of strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. ATS compatibility table
CREATE TABLE IF NOT EXISTS public.ats_compatibility (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id UUID NOT NULL REFERENCES public.resume_analyses(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    issues JSONB, -- Store array of issue objects
    recommendations TEXT[], -- Array of recommendation strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_resume_analyses_user_id ON public.resume_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_analyses_created_at ON public.resume_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_extracted_skills_analysis_id ON public.extracted_skills(analysis_id);
CREATE INDEX IF NOT EXISTS idx_resume_improvements_analysis_id ON public.resume_improvements(analysis_id);
CREATE INDEX IF NOT EXISTS idx_career_suggestions_analysis_id ON public.career_suggestions(analysis_id);
CREATE INDEX IF NOT EXISTS idx_ats_compatibility_analysis_id ON public.ats_compatibility(analysis_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extracted_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ats_compatibility ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
-- Resume analyses policies
CREATE POLICY "Users can view their own resume analyses" ON public.resume_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resume analyses" ON public.resume_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resume analyses" ON public.resume_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resume analyses" ON public.resume_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Extracted skills policies
CREATE POLICY "Users can view skills from their analyses" ON public.extracted_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.resume_analyses 
            WHERE id = analysis_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert skills for their analyses" ON public.extracted_skills
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resume_analyses 
            WHERE id = analysis_id AND user_id = auth.uid()
        )
    );

-- Resume improvements policies
CREATE POLICY "Users can view improvements from their analyses" ON public.resume_improvements
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.resume_analyses 
            WHERE id = analysis_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert improvements for their analyses" ON public.resume_improvements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resume_analyses 
            WHERE id = analysis_id AND user_id = auth.uid()
        )
    );

-- Career suggestions policies
CREATE POLICY "Users can view career suggestions from their analyses" ON public.career_suggestions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.resume_analyses 
            WHERE id = analysis_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert career suggestions for their analyses" ON public.career_suggestions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resume_analyses 
            WHERE id = analysis_id AND user_id = auth.uid()
        )
    );

-- ATS compatibility policies
CREATE POLICY "Users can view ATS compatibility from their analyses" ON public.ats_compatibility
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.resume_analyses `
            WHERE id = analysis_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert ATS compatibility for their analyses" ON public.ats_compatibility
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resume_analyses 
            WHERE id = analysis_id AND user_id = auth.uid()
        )
    );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on resume_analyses table
CREATE TRIGGER update_resume_analyses_updated_at 
    BEFORE UPDATE ON public.resume_analyses 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant necessary permissions to authenticated users
GRANT ALL ON public.resume_analyses TO authenticated;
GRANT ALL ON public.extracted_skills TO authenticated;
GRANT ALL ON public.resume_improvements TO authenticated;
GRANT ALL ON public.career_suggestions TO authenticated;
GRANT ALL ON public.ats_compatibility TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verification queries (optional - you can run these to check if tables were created)
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%resume%' OR table_name IN ('extracted_skills', 'career_suggestions', 'ats_compatibility');