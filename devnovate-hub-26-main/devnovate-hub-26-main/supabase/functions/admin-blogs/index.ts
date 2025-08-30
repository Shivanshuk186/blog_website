import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface ModerateBody {
  action?: 'list' | 'approve' | 'reject' | 'ban' | 'delete'
  id?: string
  reason?: string
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })

  try {
    const body: ModerateBody = req.method === 'POST' ? await req.json().catch(() => ({})) : {}
    const action = body.action ?? 'list'

    if (action === 'list') {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, blogs: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing blog id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'approve') {
      const { error } = await supabase
        .from('blogs')
        .update({ status: 'published', published_at: new Date().toISOString(), rejection_reason: null })
        .eq('id', body.id)
      if (error) throw error
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('blogs')
        .update({ status: 'rejected', rejection_reason: body.reason || 'Rejected by admin' })
        .eq('id', body.id)
      if (error) throw error
    }

    if (action === 'ban') {
      const { error } = await supabase
        .from('blogs')
        .update({ status: 'rejected', rejection_reason: 'Banned by admin' })
        .eq('id', body.id)
      if (error) throw error
    }

    if (action === 'delete') {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', body.id)
      if (error) throw error
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('admin-blogs error:', err)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})