-- Quick Fix: Add missing formatting_score column
-- Copy and paste this into your Supabase SQL Editor

ALTER TABLE ats_compatibility 
ADD COLUMN IF NOT EXISTS formatting_score INTEGER CHECK (formatting_score >= 0 AND formatting_score <= 100);

-- Verify it worked
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ats_compatibility' 
AND table_schema = 'public' 
ORDER BY ordinal_position;

-- Success message
SELECT 'formatting_score column added successfully!' as result;