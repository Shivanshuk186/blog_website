-- Fix the generate_unique_slug function to properly handle the author_id parameter
CREATE OR REPLACE FUNCTION public.generate_unique_slug(title_text text, author_id_param uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Generate base slug from title
  base_slug := LOWER(title_text);
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\s]', '', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  -- Start with the base slug
  final_slug := base_slug;
  
  -- Check if slug exists for this author and increment if needed
  WHILE EXISTS (
    SELECT 1 FROM public.blogs 
    WHERE slug = final_slug AND author_id = author_id_param
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$function$

-- Update the admin policies to properly view submitted blogs
DROP POLICY IF EXISTS "Admins can view all blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can view all non-deleted blogs" ON public.blogs;

-- Create a comprehensive admin view policy
CREATE POLICY "Admins can view all blogs including submitted" 
ON public.blogs 
FOR SELECT 
USING (is_admin());

-- Add policy for submitted blogs to be visible to admins
CREATE POLICY "Submitted blogs are viewable by admins" 
ON public.blogs 
FOR SELECT 
USING (status = 'submitted' AND is_admin());