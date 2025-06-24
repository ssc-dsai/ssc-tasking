-- Create shared_taskings table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.shared_taskings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tasking_id UUID NOT NULL REFERENCES public.taskings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES auth.users(id),
  permission_level TEXT NOT NULL DEFAULT 'read' CHECK (permission_level IN ('read', 'write', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicate shares
  UNIQUE(tasking_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shared_taskings_tasking_id ON public.shared_taskings(tasking_id);
CREATE INDEX IF NOT EXISTS idx_shared_taskings_user_id ON public.shared_taskings(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_taskings_shared_by ON public.shared_taskings(shared_by);

-- Enable RLS
ALTER TABLE public.shared_taskings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_taskings
-- Users can see shares where they are the recipient, owner, or sharer
CREATE POLICY "Users can view shared taskings they have access to" ON public.shared_taskings
  FOR SELECT USING (
    user_id = auth.uid() OR 
    shared_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.taskings t 
      WHERE t.id = tasking_id AND t.user_id = auth.uid()
    )
  );

-- Users can insert shares for taskings they own or have admin permission on
CREATE POLICY "Users can share taskings they own or have admin access to" ON public.shared_taskings
  FOR INSERT WITH CHECK (
    shared_by = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM public.taskings t 
        WHERE t.id = tasking_id AND t.user_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM public.shared_taskings st 
        WHERE st.tasking_id = tasking_id AND st.user_id = auth.uid() AND st.permission_level = 'admin'
      )
    )
  );

-- Users can delete shares for taskings they own or admin, or remove themselves
CREATE POLICY "Users can remove shares they created or remove themselves" ON public.shared_taskings
  FOR DELETE USING (
    shared_by = auth.uid() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.taskings t 
      WHERE t.id = tasking_id AND t.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.shared_taskings st 
      WHERE st.tasking_id = tasking_id AND st.user_id = auth.uid() AND st.permission_level = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_shared_taskings_updated_at
  BEFORE UPDATE ON public.shared_taskings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create a function to get user profile info for sharing
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