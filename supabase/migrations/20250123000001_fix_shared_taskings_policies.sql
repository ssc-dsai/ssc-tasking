-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view shared taskings they have access to" ON public.shared_taskings;
DROP POLICY IF EXISTS "Users can share taskings they own or have admin access to" ON public.shared_taskings;
DROP POLICY IF EXISTS "Users can remove shares they created or remove themselves" ON public.shared_taskings;

-- Create simpler, non-recursive policies
-- Users can view shares where they are involved (recipient, sharer, or tasking owner)
CREATE POLICY "Users can view their related shares" ON public.shared_taskings
  FOR SELECT USING (
    user_id = auth.uid() OR 
    shared_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.taskings t 
      WHERE t.id = tasking_id AND t.user_id = auth.uid()
    )
  );

-- Only tasking owners can create shares (no recursive admin check)
CREATE POLICY "Tasking owners can create shares" ON public.shared_taskings
  FOR INSERT WITH CHECK (
    shared_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.taskings t 
      WHERE t.id = tasking_id AND t.user_id = auth.uid()
    )
  );

-- Users can delete shares they created, or remove themselves, or tasking owner can remove any
CREATE POLICY "Users can manage shares appropriately" ON public.shared_taskings
  FOR DELETE USING (
    shared_by = auth.uid() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.taskings t 
      WHERE t.id = tasking_id AND t.user_id = auth.uid()
    )
  );

-- Allow updates for permission changes (only by tasking owner or the person who shared)
CREATE POLICY "Users can update shares they control" ON public.shared_taskings
  FOR UPDATE USING (
    shared_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.taskings t 
      WHERE t.id = tasking_id AND t.user_id = auth.uid()
    )
  ); 