'use client'
import Loading from '@/components/Loading'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import RequireAuth from '@/components/RequireAuth'

export default function RequireAdmin({ children }){
  const { profile, loading } = useAuth()
  return (
    <RequireAuth>
      <div className="container main">
        {loading ? <Loading/> : (
          profile?.role === 'admin' && profile?.banned === false ? children : (
            <div className="card cardPad">
              <div className="h1">Нет доступа</div>
              <p className="p">Нужна роль admin.</p>
              <div style={{marginTop:12}}><Link className="btn" href="/">На главную</Link></div>
            </div>
          )
        )}
      </div>
    </RequireAuth>
  )
}