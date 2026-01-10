'use client'
import Loading from '@/components/Loading'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

export default function RequireAuth({ children }){
  const { user, loading } = useAuth()
  if (loading) return <div className="container main"><Loading /></div>
  if (!user) return (
    <div className="container main"><div className="card cardPad">
      <div className="h1">Нужен вход</div>
      <p className="p">Чтобы открыть страницу — войди.</p>
      <div className="row" style={{marginTop:12}}>
        <Link className="btn btnPrimary" href="/auth/login">Войти</Link>
        <Link className="btn" href="/auth/register">Регистрация</Link>
      </div>
    </div></div>
  )
  return children
}