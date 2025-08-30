-- Enable realtime for the blogs table
ALTER TABLE public.blogs REPLICA IDENTITY FULL;

-- Add the blogs table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs;

-- Add the profiles table to the realtime publication for author information
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;