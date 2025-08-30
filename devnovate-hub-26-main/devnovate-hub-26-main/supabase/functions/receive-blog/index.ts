import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface BlogData {
  title: string
  content_html: string
  content_markdown: string
  author_id: string
  tags?: string[]
  cover_image_url?: string
  status?: string
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })

    if (req.method === 'POST') {
      const blogData: BlogData = await req.json()

      // Validate required fields
      if (!blogData.title || !blogData.content_html || !blogData.author_id) {
        return new Response(
          JSON.stringify({ 
            error: 'Missing required fields: title, content_html, author_id' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Generate unique slug
      const { data: slug } = await supabase.rpc('generate_unique_slug', {
        title_text: blogData.title,
        author_id: blogData.author_id
      })

      // Insert blog into database
      const { data, error } = await supabase
        .from('blogs')
        .insert({
          title: blogData.title,
          content_html: blogData.content_html,
          content_markdown: blogData.content_markdown || blogData.content_html,
          author_id: blogData.author_id,
          slug: slug,
          tags: blogData.tags || [],
          cover_image_url: blogData.cover_image_url,
          status: blogData.status || 'published',
          published_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to create blog post' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          blog: data,
          message: 'Blog post created successfully'
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET method - return API documentation
    if (req.method === 'GET') {
      const documentation = {
        endpoint: '/receive-blog',
        method: 'POST',
        description: 'Receive blog posts from external websites',
        required_fields: {
          title: 'string - Blog post title',
          content_html: 'string - HTML content of the blog',
          author_id: 'string - UUID of the author',
        },
        optional_fields: {
          content_markdown: 'string - Markdown content (defaults to content_html)',
          tags: 'string[] - Array of tags',
          cover_image_url: 'string - URL of cover image',
          status: 'string - published/draft (defaults to published)'
        },
        example: {
          title: 'My Blog Post',
          content_html: '<p>This is the content</p>',
          content_markdown: 'This is the content',
          author_id: 'uuid-here',
          tags: ['tech', 'ai'],
          cover_image_url: 'https://example.com/image.jpg',
          status: 'published'
        }
      }

      return new Response(
        JSON.stringify(documentation, null, 2),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})