-- Fix infinite recursion in shared_taskings policies
-- The issue is that shared_taskings policies were checking taskings table
-- while taskings policies were checking shared_taskings table

-- Drop all existing policies on shared_taskings
DROP POLICY IF EXISTS "Users can view their related shares" ON public.shared_taskings;
DROP POLICY IF EXISTS "Tasking owners can create shares" ON public.shared_taskings;
DROP POLICY IF EXISTS "Users can manage shares appropriately" ON public.shared_taskings;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view shares they are part of" ON public.shared_taskings
  FOR SELECT USING (
    user_id = auth.uid() OR shared_by = auth.uid()
  );

CREATE POLICY "Users can create shares for their taskings" ON public.shared_taskings
  FOR INSERT WITH CHECK (
    shared_by = auth.uid()
  );

CREATE POLICY "Users can delete shares they created or are part of" ON public.shared_taskings
  FOR DELETE USING (
    shared_by = auth.uid() OR user_id = auth.uid()
  ); 