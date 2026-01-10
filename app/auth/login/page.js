'use client'
import { useState } from 'react'
import Link from 'next/link'
import AuthCard from '@/components/AuthCard'
import { useAuth } from '@/components/AuthProvider'

export default function LoginPage(){
  const { supabase } = useAuth()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState('')

  async function onSubmit(e){
    e.preventDefault()
    setMsg('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setMsg(error.message)
    window.location.href='/account'
  }

  return (
    <AuthCard title="Вход" subtitle="Войди, чтобы пользоваться аккаунтом.">
      <form className="grid" onSubmit={onSubmit}>
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input" placeholder="Пароль" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn btnPrimary" disabled={loading}>{loading?'Входим…':'Войти'}</button>
        <div className="small">Нет аккаунта? <Link href="/auth/register">Регистрация</Link></div>
        {msg ? <div className="toast">{msg}</div> : null}
      </form>
    </AuthCard>
  )
}