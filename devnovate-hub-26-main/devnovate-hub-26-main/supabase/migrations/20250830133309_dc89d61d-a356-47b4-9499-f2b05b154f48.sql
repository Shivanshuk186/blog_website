-- Insert a sample blog using an existing profile's user_id to satisfy FK
WITH author AS (
  SELECT user_id FROM public.profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO public.blogs (
  author_id, title, slug, content_markdown, content_html, status, published_at, views_count, likes_count, comments_count, tags
)
SELECT 
  author.user_id,
  'Welcome to Devnovate',
  'welcome-to-devnovate',
  '# Welcome to Devnovate\n\nThis is a sample blog to verify realtime and visibility.',
  '<h1>Welcome to Devnovate</h1><p>This is a sample blog to verify realtime and visibility.</p>',
  'published',
  now(),
  0, 0, 0,
  ARRAY['announcement','devnovate']
FROM author
WHERE EXISTS (SELECT 1 FROM author);

-- If no profiles exist, do nothing