-- Quick Database Fix Script
-- Run this in Supabase SQL Editor to fix the ats_compatibility table

BEGIN;

-- Add missing columns to ats_compatibility table
ALTER TABLE public.ats_compatibility 
ADD COLUMN IF NOT EXISTS ats_score INTEGER,
ADD COLUMN IF NOT EXISTS parsing_success BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS format_issues TEXT[],
ADD COLUMN IF NOT EXISTS keyword_optimization TEXT;

-- Make the old score column nullable
ALTER TABLE public.ats_compatibility 
ALTER COLUMN score DROP NOT NULL;

-- Migrate existing data
UPDATE public.ats_compatibility 
SET ats_score = score 
WHERE ats_score IS NULL AND score IS NOT NULL;

COMMIT;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ats_compatibility'
ORDER BY ordinal_position;
