-- Enable realtime for blogs table
ALTER TABLE public.blogs REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blogs;

-- Enable realtime for profiles table  
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for comments table
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Enable realtime for likes table
ALTER TABLE public.likes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- Add admin policies for blogs table
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

-- Insert sample profile data
INSERT INTO public.profiles (user_id, name, email, role) VALUES 
(gen_random_uuid(), 'Admin User', 'admin@devnovate.com', 'admin'),
(gen_random_uuid(), 'John Doe', 'john@example.com', 'user'),
(gen_random_uuid(), 'Jane Smith', 'jane@example.com', 'user');

-- Insert sample blog data
INSERT INTO public.blogs (
  author_id, 
  title, 
  slug, 
  content_markdown, 
  content_html, 
  status,
  published_at,
  views_count,
  likes_count,
  comments_count,
  tags
) 
SELECT 
  p.user_id,
  'Getting Started with React Hooks',
  'getting-started-with-react-hooks',
  '# Getting Started with React Hooks\n\nReact Hooks revolutionized how we write React components...',
  '<h1>Getting Started with React Hooks</h1><p>React Hooks revolutionized how we write React components...</p>',
  'published',
  now(),
  150,
  25,
  8,
  ARRAY['react', 'javascript', 'frontend']
FROM public.profiles p WHERE p.role = 'user' LIMIT 1;

INSERT INTO public.blogs (
  author_id, 
  title, 
  slug, 
  content_markdown, 
  content_html, 
  status,
  views_count,
  likes_count,
  comments_count,
  tags
) 
SELECT 
  p.user_id,
  'Building Scalable APIs with Node.js',
  'building-scalable-apis-with-nodejs',
  '# Building Scalable APIs\n\nLearn how to build robust and scalable APIs...',
  '<h1>Building Scalable APIs</h1><p>Learn how to build robust and scalable APIs...</p>',
  'draft',
  75,
  12,
  3,
  ARRAY['nodejs', 'api', 'backend']
FROM public.profiles p WHERE p.role = 'user' LIMIT 1 OFFSET 1;