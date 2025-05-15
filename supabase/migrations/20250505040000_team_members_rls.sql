-- Enable RLS on team_members table
ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members table
-- Anyone can view team members
CREATE POLICY "Allow public to view team members" 
ON "public"."team_members" 
FOR SELECT USING (true);

-- Only authenticated users can insert
CREATE POLICY "Authenticated users can insert team members" 
ON "public"."team_members" 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only authenticated users can update
CREATE POLICY "Authenticated users can update team members" 
ON "public"."team_members" 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only authenticated users can delete
CREATE POLICY "Authenticated users can delete team members" 
ON "public"."team_members" 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'admin'
  )
); 