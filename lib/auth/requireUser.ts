import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'

export async function requireUser() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Проверяем, есть ли профиль и не забанен ли пользователь
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('banned, role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    redirect('/auth/login')
  }

  if (profile.banned) {
    redirect('/auth/login?error=banned')
  }

  return { user, profile }
}
