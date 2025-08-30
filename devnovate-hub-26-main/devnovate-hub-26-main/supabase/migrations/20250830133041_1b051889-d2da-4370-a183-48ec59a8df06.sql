-- Enable realtime for all tables
ALTER TABLE public.blogs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs;

ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;

-- Create function to check if user is admin (without relying on profiles table for now)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- For now, return true to allow admin access during development
  -- In production, you should implement proper admin role checking
  SELECT true;
$$;

-- Add admin policies for blogs table to see all blogs
CREATE POLICY "Admins can view all blogs" 
ON public.blogs 
FOR SELECT 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can update all blogs" 
ON public.blogs 
FOR UPDATE 
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete all blogs" 
ON public.blogs 
FOR DELETE 
TO authenticated
USING (public.is_admin());

-- Allow public access to blogs for now (since no authentication is set up)
CREATE POLICY "Public can view all blogs" 
ON public.blogs 
FOR SELECT 
TO anon
USING (true);