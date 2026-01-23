import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, banned').eq('id', user.id).single()
  if (!profile || profile.banned || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
  }

  const { data, error } = await supabase.from('topup_requests').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ topups: data || [] })
}

export async function POST(req: NextRequest) {
  // Можно использовать для смены статуса/подтверждения — в проекте админка делает это напрямую через RPC.
  return NextResponse.json({ error: 'Not implemented. Use Supabase RPC complete_topup.' }, { status: 501 })
}

