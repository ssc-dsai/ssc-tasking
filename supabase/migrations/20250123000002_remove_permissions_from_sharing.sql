-- Remove permission_level column from shared_taskings table
ALTER TABLE public.shared_taskings DROP COLUMN IF EXISTS permission_level;

-- Update the policies to remove permission checks
DROP POLICY IF EXISTS "Users can view their related shares" ON public.shared_taskings;
DROP POLICY IF EXISTS "Tasking owners can create shares" ON public.shared_taskings;
DROP POLICY IF EXISTS "Users can manage shares appropriately" ON public.shared_taskings;
DROP POLICY IF EXISTS "Users can update shares they control" ON public.shared_taskings;

-- Create simplified policies without permissions
CREATE POLICY "Users can view their related shares" ON public.shared_taskings
  FOR SELECT USING (
    user_id = auth.uid() OR 
    shared_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.taskings t 
      WHERE t.id = tasking_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Tasking owners can create shares" ON public.shared_taskings
  FOR INSERT WITH CHECK (
    shared_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.taskings t 
      WHERE t.id = tasking_id AND t.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage shares appropriately" ON public.shared_taskings
  FOR DELETE USING (
    shared_by = auth.uid() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.taskings t 
      WHERE t.id = tasking_id AND t.user_id = auth.uid()
    )
  );

-- Remove the search function and recreate without permission references
DROP FUNCTION IF EXISTS public.search_users_for_sharing(TEXT, INTEGER);

-- Create simplified search function
CREATE OR REPLACE FUNCTION public.search_users_for_sharing(search_term TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email::TEXT,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email::TEXT) as full_name,
    u.raw_user_meta_data->>'avatar_url' as avatar_url
  FROM auth.users u
  WHERE 
    u.id != auth.uid() -- Exclude current user
    AND (
      u.email ILIKE '%' || search_term || '%' OR
      COALESCE(u.raw_user_meta_data->>'full_name', '') ILIKE '%' || search_term || '%'
    )
    AND u.email_confirmed_at IS NOT NULL -- Only confirmed users
  ORDER BY 
    CASE 
      WHEN u.email ILIKE search_term || '%' THEN 1
      WHEN COALESCE(u.raw_user_meta_data->>'full_name', '') ILIKE search_term || '%' THEN 2
      ELSE 3
    END,
    u.email
  LIMIT limit_count;
END;
$$; 