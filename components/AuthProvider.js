'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseClient'
const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(u){
    if (!u) { setProfile(null); return }
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', u.id).single()
    if (error) { setProfile(null); return }
    setProfile(data)
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getUser()
      if (!mounted) return
      setUser(data.user ?? null)
      await loadProfile(data.user ?? null)
      setLoading(false)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null
      setUser(u)
      await loadProfile(u)
    })
    return () => { mounted = false; sub.subscription.unsubscribe() }
  }, [supabase])

  return <Ctx.Provider value={{ supabase, user, profile, loading, refreshProfile:()=>loadProfile(user) }}>{children}</Ctx.Provider>
}
export function useAuth(){ const v = useContext(Ctx); if(!v) throw new Error('useAuth'); return v }
