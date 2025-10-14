-- Database Migration: Add missing columns to fix frontend compatibility issues
-- Run this in your Supabase SQL editor (PostgreSQL syntax)

-- Step 1: Add missing formatting_score column to ats_compatibility table
ALTER TABLE ats_compatibility 
ADD COLUMN IF NOT EXISTS formatting_score INTEGER;

-- Step 2: Add constraint for formatting_score
ALTER TABLE ats_compatibility 
ADD CONSTRAINT IF NOT EXISTS formatting_score_range 
CHECK (formatting_score >= 0 AND formatting_score <= 100);

-- Step 3: Update existing records to have default formatting_score
UPDATE ats_compatibility 
SET formatting_score = COALESCE(formatting_score, score) 
WHERE formatting_score IS NULL;

-- Step 4: Verify the column was added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'ats_compatibility' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Optional: Add other useful columns for future features
ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS analysis_version TEXT DEFAULT 'v1.0';
ALTER TABLE resume_analyses ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER;

-- Grant permissions to authenticated users
GRANT ALL ON ats_compatibility TO authenticated;
GRANT ALL ON resume_analyses TO authenticated;
GRANT ALL ON extracted_skills TO authenticated;
GRANT ALL ON resume_improvements TO authenticated;
GRANT ALL ON career_suggestions TO authenticated;

-- Show success message
SELECT 'Migration completed! Added formatting_score column to ats_compatibility table.' as status;