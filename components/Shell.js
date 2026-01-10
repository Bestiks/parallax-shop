'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

export default function Shell({ children }) {
  const { user, profile, supabase } = useAuth()
  const [open, setOpen] = useState(false)

  async function logout(){
    await supabase.auth.signOut()
    window.location.href = '/'
  }
  const isAdmin = profile?.role === 'admin' && profile?.banned === false

  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      <header className="header">
        <div className="container headerInner">
          <Link className="brand" href="/">Parallax.</Link>
          <nav className="nav">
            <Link href="/catalog">Каталог</Link>
            <Link href="/chat">Чат</Link>
            {user && <Link href="/account">Профиль</Link>}
            {isAdmin && <Link href="/admin">Админ</Link>}
            {!user && <Link href="/auth/login">Войти</Link>}
            {!user && <Link href="/auth/register">Регистрация</Link>}
            {user && <button className="btn" onClick={logout}>Выйти</button>}
          </nav>
          <button className="btn burger" onClick={() => setOpen(v=>!v)} aria-label="menu">☰</button>
        </div>
        {open && (
          <div className="container">
            <div className="mobileMenu card">
              <Link onClick={()=>setOpen(false)} href="/catalog">Каталог</Link>
              <Link onClick={()=>setOpen(false)} href="/chat">Чат</Link>
              {user && <Link onClick={()=>setOpen(false)} href="/account">Профиль</Link>}
              {isAdmin && <Link onClick={()=>setOpen(false)} href="/admin">Админ</Link>}
              {!user && <Link onClick={()=>setOpen(false)} href="/auth/login">Войти</Link>}
              {!user && <Link onClick={()=>setOpen(false)} href="/auth/register">Регистрация</Link>}
              {user && <button className="btn" onClick={logout}>Выйти</button>}
            </div>
          </div>
        )}
      </header>
      {children}
      <footer className="footer">
        <div className="container footerInner">
          <div>© {new Date().getFullYear()} Parallax Shop</div>
          <div className="row">
            <a href="/legal/privacy">Политика</a>
            <a href="/legal/terms">Соглашение</a>
            <span>support@parallax.shop</span>
            <span>@parallax_support</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
