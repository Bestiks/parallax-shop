import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  // Проверяем админ-роль
  const { data: profile } = await supabase.from('profiles').select('role, banned').eq('id', user.id).single()
  if (!profile || profile.banned || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const { data, error } = await supabase.from('banners').select('*').order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ banners: data || [] })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, banned').eq('id', user.id).single()
  if (!profile || profile.banned || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const payload = await req.json()
  const { data, error } = await supabase.from('banners').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ banner: data })
}

