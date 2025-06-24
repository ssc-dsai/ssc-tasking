-- Fix the search_users_for_sharing function to properly cast types
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