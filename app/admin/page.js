'use client'
import Link from 'next/link'
import RequireAdmin from '@/components/RequireAdmin'
export default function AdminPage(){
  return (
    <RequireAdmin>
      <div className="card cardPad">
        <div className="h1">Админка</div>
        <p className="p">Пользователи, товары, чаты.</p>
        <div className="hr" />
        <div className="row">
          <Link className="btn btnPrimary" href="/admin/users">Пользователи</Link>
          <Link className="btn" href="/admin/products">Товары</Link>
          <Link className="btn" href="/admin/chats">Чаты</Link>
        </div>
      </div>
    </RequireAdmin>
  )
}