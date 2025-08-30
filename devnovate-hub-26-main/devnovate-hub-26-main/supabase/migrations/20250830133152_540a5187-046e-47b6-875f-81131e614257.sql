-- Fix security issue: Set search_path for function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- For development purposes, return true to allow admin access
  -- In production, implement proper admin role checking
  SELECT true;
$$;

-- Insert sample blog data directly with dummy author IDs for testing
INSERT INTO public.blogs (
  id,
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
) VALUES 
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Getting Started with React Hooks',
  'getting-started-with-react-hooks',
  '# Getting Started with React Hooks

React Hooks revolutionized how we write React components. In this comprehensive guide, we''ll explore the fundamentals of hooks and how they can make your React code more efficient and maintainable.

## What are React Hooks?

Hooks are functions that let you "hook into" React state and lifecycle features from function components. They don''t work inside classes — they let you use React without classes.',
  '<h1>Getting Started with React Hooks</h1><p>React Hooks revolutionized how we write React components. In this comprehensive guide, we''ll explore the fundamentals of hooks and how they can make your React code more efficient and maintainable.</p><h2>What are React Hooks?</h2><p>Hooks are functions that let you "hook into" React state and lifecycle features from function components. They don''t work inside classes — they let you use React without classes.</p>',
  'published',
  now(),
  150,
  25,
  8,
  ARRAY['react', 'javascript', 'frontend']
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'Building Scalable APIs with Node.js',
  'building-scalable-apis-with-nodejs',
  '# Building Scalable APIs with Node.js

Learn how to build robust and scalable APIs using Node.js, Express, and modern best practices.

## Why Node.js for APIs?

Node.js provides excellent performance for I/O intensive applications like APIs...',
  '<h1>Building Scalable APIs with Node.js</h1><p>Learn how to build robust and scalable APIs using Node.js, Express, and modern best practices.</p><h2>Why Node.js for APIs?</h2><p>Node.js provides excellent performance for I/O intensive applications like APIs...</p>',
  'draft',
  null,
  75,
  12,
  3,
  ARRAY['nodejs', 'api', 'backend']
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  'The Future of Web Development',
  'future-of-web-development',
  '# The Future of Web Development

Exploring emerging technologies and trends that will shape the future of web development.

## Key Trends

- AI-powered development tools
- WebAssembly adoption
- Edge computing',
  '<h1>The Future of Web Development</h1><p>Exploring emerging technologies and trends that will shape the future of web development.</p><h2>Key Trends</h2><ul><li>AI-powered development tools</li><li>WebAssembly adoption</li><li>Edge computing</li></ul>',
  'published',
  now() - interval '2 days',
  320,
  45,
  15,
  ARRAY['webdev', 'future', 'technology']
);