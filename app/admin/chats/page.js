'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import RequireAdmin from '@/components/RequireAdmin'
import { useAuth } from '@/components/AuthProvider'
import Loading from '@/components/Loading'

export default function AdminChats(){
  const { supabase } = useAuth()
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(true)
  const [err,setErr]=useState('')

  async function load(){
    setErr(''); setLoading(true)
    const { data, error } = await supabase.from('chat_threads').select('id,user_id,status,created_at').order('created_at',{ascending:false})
    setLoading(false)
    if (error){ setErr(error.message); setItems([]); return }
    setItems(data || [])
  }
  useEffect(()=>{ load() }, [])

  return (
    <RequireAdmin>
      <div className="card cardPad">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div><div className="h1">Чаты</div><p className="p">Открывай диалог.</p></div>
          <button className="btn" onClick={load}>Обновить</button>
        </div>
        <div className="hr" />
        {loading ? <Loading/> : (
          <div className="grid">
            {items.map(t => (
              <Link key={t.id} className="card cardPad" href={`/admin/chats/${t.id}`}>
                <div className="row" style={{justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontWeight:800}}>Thread: {t.id}</div>
                    <div className="small">user_id: {t.user_id}</div>
                  </div>
                  <span className="badge">{t.status}</span>
                </div>
              </Link>
            ))}
            {!items.length ? <div className="small">Чатов нет.</div> : null}
          </div>
        )}
        {err ? <div className="toast" style={{marginTop:10}}>{err}</div> : null}
      </div>
    </RequireAdmin>
  )
}