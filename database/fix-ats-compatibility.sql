-- Fix ATS Compatibility Table Schema
-- This adds missing columns that the frontend expects

-- Add missing columns to ats_compatibility table
ALTER TABLE public.ats_compatibility 
ADD COLUMN IF NOT EXISTS ats_score INTEGER,
ADD COLUMN IF NOT EXISTS parsing_success BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS format_issues TEXT[],
ADD COLUMN IF NOT EXISTS keyword_optimization TEXT;

-- Update the score column to be nullable (since we now have ats_score)
ALTER TABLE public.ats_compatibility 
ALTER COLUMN score DROP NOT NULL;

-- Migrate existing data if any
UPDATE public.ats_compatibility 
SET ats_score = score 
WHERE ats_score IS NULL AND score IS NOT NULL;

-- Add comment
COMMENT ON COLUMN public.ats_compatibility.ats_score IS 'ATS compatibility score (0-100)';
COMMENT ON COLUMN public.ats_compatibility.parsing_success IS 'Whether ATS can successfully parse the resume';
COMMENT ON COLUMN public.ats_compatibility.format_issues IS 'Array of formatting issues detected';
COMMENT ON COLUMN public.ats_compatibility.keyword_optimization IS 'Keyword optimization analysis';
