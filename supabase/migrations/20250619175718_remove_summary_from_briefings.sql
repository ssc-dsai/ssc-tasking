-- Remove summary column from briefings table
ALTER TABLE briefings DROP COLUMN IF EXISTS summary;
