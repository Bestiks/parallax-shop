'use client'
import { useState } from 'react'
import Link from 'next/link'
import AuthCard from '@/components/AuthCard'
import { useAuth } from '@/components/AuthProvider'

export default function RegisterPage(){
  const { supabase } = useAuth()
  const [fullName,setFullName]=useState('')
  const [phone,setPhone]=useState('')
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState('')

  async function onSubmit(e){
    e.preventDefault()
    setMsg('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone } }
    })
    if (error){ setLoading(false); return setMsg(error.message) }

    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (loginErr) return setMsg('Аккаунт создан. Если включено подтверждение email — подтверди письмо и зайди.')
    window.location.href='/account'
  }

  return (
    <AuthCard title="Регистрация" subtitle="Создай аккаунт Parallax.">
      <form className="grid" onSubmit={onSubmit}>
        <input className="input" placeholder="ФИО" value={fullName} onChange={e=>setFullName(e.target.value)} required />
        <input className="input" placeholder="Телефон" value={phone} onChange={e=>setPhone(e.target.value)} required />
        <input className="input" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="input" placeholder="Пароль (мин 6)" type="password" minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required />
        <button className="btn btnPrimary" disabled={loading}>{loading?'Создаём…':'Создать аккаунт'}</button>
        <div className="small">Уже есть аккаунт? <Link href="/auth/login">Войти</Link></div>
        {msg ? <div className="toast">{msg}</div> : null}
      </form>
    </AuthCard>
  )
}