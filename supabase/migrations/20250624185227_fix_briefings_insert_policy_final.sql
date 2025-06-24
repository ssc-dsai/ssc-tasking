-- Fix briefings INSERT policy to allow shared users to create briefings in shared taskings
-- This is a focused fix for the RLS policy violation error

-- Drop and recreate the briefings INSERT policy
DROP POLICY IF EXISTS "Users can insert briefings to their taskings" ON public.briefings;
CREATE POLICY "Users can insert briefings to their taskings" ON public.briefings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
            AND (
                -- Allow tasking owner
                taskings.user_id = auth.uid()
                OR 
                -- Allow shared users
                EXISTS (
                    SELECT 1 FROM public.shared_taskings
                    WHERE shared_taskings.tasking_id = taskings.id
                    AND shared_taskings.user_id = auth.uid()
                )
            )
        )
    );

-- Also ensure the briefings UPDATE policy allows shared users
DROP POLICY IF EXISTS "Users can update briefings in their taskings" ON public.briefings;
CREATE POLICY "Users can update briefings in their taskings" ON public.briefings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
            AND (
                -- Allow tasking owner
                taskings.user_id = auth.uid()
                OR 
                -- Allow shared users
                EXISTS (
                    SELECT 1 FROM public.shared_taskings
                    WHERE shared_taskings.tasking_id = taskings.id
                    AND shared_taskings.user_id = auth.uid()
                )
            )
        )
    );

-- Ensure the briefings SELECT policy also allows shared users (should already be fixed but let's be sure)
DROP POLICY IF EXISTS "Users can view briefings in their taskings" ON public.briefings;
CREATE POLICY "Users can view briefings in their taskings" ON public.briefings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
            AND (
                -- Allow tasking owner
                taskings.user_id = auth.uid()
                OR 
                -- Allow shared users
                EXISTS (
                    SELECT 1 FROM public.shared_taskings
                    WHERE shared_taskings.tasking_id = taskings.id
                    AND shared_taskings.user_id = auth.uid()
                )
            )
        )
    );
