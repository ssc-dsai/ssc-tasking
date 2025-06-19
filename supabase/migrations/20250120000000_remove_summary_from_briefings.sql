-- Remove summary column from briefings table
ALTER TABLE public.briefings DROP COLUMN IF EXISTS summary; 