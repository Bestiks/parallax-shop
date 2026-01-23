import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('banned, role')
    .eq('id', user.id)
    .single()

  if (error || !profile || profile.banned || profile.role !== 'admin') {
    redirect('/account')
  }

  return { user, profile }
}
