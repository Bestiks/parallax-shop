'use client'
import { useEffect, useState } from 'react'
import RequireAdmin from '@/components/RequireAdmin'
import { useAuth } from '@/components/AuthProvider'
import Loading from '@/components/Loading'

export default function AdminUsers(){
  const { supabase } = useAuth()
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(true)
  const [err,setErr]=useState('')

  async function load(){
    setErr(''); setLoading(true)
    const { data, error } = await supabase.from('profiles')
      .select('user_id, public_id, full_name, phone, username, role, banned, balance_rub')
      .order('public_id',{ascending:true})
    setLoading(false)
    if (error){ setErr(error.message); setItems([]); return }
    setItems(data || [])
  }
  useEffect(()=>{ load() }, [])

  async function updateUser(user_id, patch){
    setErr('')
    const { error } = await supabase.from('profiles').update(patch).eq('user_id', user_id)
    if (error){ setErr(error.message); return }
    await load()
  }

  async function addBalance(user_id){
    const raw = prompt('Сколько ₽ добавить?')
    if (!raw) return
    const amt = Number(raw)
    if (!Number.isFinite(amt) || amt===0) return
    const { error } = await supabase.rpc('admin_add_balance', { p_user_id:user_id, p_amount_rub:amt, p_note:'Из админки' })
    if (error){ setErr(error.message); return }
    await load()
  }

  return (
    <RequireAdmin>
      <div className="card cardPad">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div><div className="h1">Пользователи</div><p className="p">Баланс / роль / бан / ник.</p></div>
          <button className="btn" onClick={load}>Обновить</button>
        </div>
        <div className="hr" />
        {loading ? <Loading/> : (
          <div style={{overflow:'auto'}}>
            <table className="table">
              <thead><tr><th>ID</th><th>ФИО</th><th>Телефон</th><th>Ник</th><th>Роль</th><th>Баланс</th><th>Бан</th><th>Действия</th></tr></thead>
              <tbody>
                {items.map(u => (
                  <tr key={u.user_id}>
                    <td>{u.public_id}</td>
                    <td>{u.full_name}</td>
                    <td>{u.phone}</td>
                    <td>{u.username ?? '—'}</td>
                    <td>{u.role}</td>
                    <td>{Number(u.balance_rub||0).toLocaleString('ru-RU')} ₽</td>
                    <td>{u.banned ? 'да' : 'нет'}</td>
                    <td>
                      <div className="row">
                        <button className="btn" onClick={()=>addBalance(u.user_id)}>Баланс</button>
                        <button className="btn" onClick={()=>{
                          const nick = prompt('Новый ник:', u.username ?? '')
                          if (nick===null) return
                          updateUser(u.user_id, { username: nick || null })
                        }}>Ник</button>
                        <button className="btn" onClick={()=>updateUser(u.user_id, { role: u.role==='admin'?'user':'admin' })}>
                          {u.role==='admin'?'Снять admin':'Сделать admin'}
                        </button>
                        <button className="btn btnDanger" onClick={()=>updateUser(u.user_id, { banned: !u.banned })}>
                          {u.banned?'Разбан':'Бан'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {err ? <div className="toast" style={{marginTop:10}}>{err}</div> : null}
      </div>
    </RequireAdmin>
  )
}