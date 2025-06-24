-- Add RLS policy to allow users to view taskings shared with them
CREATE POLICY "Users can view shared taskings" ON public.taskings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.shared_taskings
            WHERE shared_taskings.tasking_id = taskings.id
            AND shared_taskings.user_id = auth.uid()
        )
    );

-- Also update files policy to allow access to files in shared taskings
DROP POLICY IF EXISTS "Users can view files in their taskings" ON public.files;
CREATE POLICY "Users can view files in their taskings" ON public.files
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = files.tasking_id
            AND (
                taskings.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.shared_taskings
                    WHERE shared_taskings.tasking_id = taskings.id
                    AND shared_taskings.user_id = auth.uid()
                )
            )
        )
    );

-- Also update briefings policy to allow access to briefings in shared taskings
DROP POLICY IF EXISTS "Users can view briefings in their taskings" ON public.briefings;
CREATE POLICY "Users can view briefings in their taskings" ON public.briefings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.taskings
            WHERE taskings.id = briefings.tasking_id
            AND (
                taskings.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.shared_taskings
                    WHERE shared_taskings.tasking_id = taskings.id
                    AND shared_taskings.user_id = auth.uid()
                )
            )
        )
    ); 