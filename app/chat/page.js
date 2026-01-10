'use client'
import { useEffect, useState } from 'react'
import RequireAuth from '@/components/RequireAuth'
import { useAuth } from '@/components/AuthProvider'
import Loading from '@/components/Loading'

function fmt(ts){ try { return new Date(ts).toLocaleString('ru-RU') } catch { return '' } }

export default function ChatPage(){
  const { supabase, user, profile, loading:authLoading } = useAuth()
  const [threadId,setThreadId]=useState(null)
  const [messages,setMessages]=useState([])
  const [text,setText]=useState('')
  const [amount,setAmount]=useState(500)
  const [loading,setLoading]=useState(true)
  const [err,setErr]=useState('')

  const isAdmin = profile?.role === 'admin' && profile?.banned === false

  async function ensureThread(){
    setErr(''); setLoading(true)
    const { data: existing, error } = await supabase.from('chat_threads').select('*').eq('user_id', user.id).order('created_at',{ascending:false}).limit(1)
    if (error){ setErr(error.message); setLoading(false); return }
    let t = existing?.[0]
    if (!t){
      const { data: created, error: cErr } = await supabase.from('chat_threads').insert({ user_id: user.id, status:'open' }).select('*').single()
      if (cErr){ setErr(cErr.message); setLoading(false); return }
      t = created
    }
    setThreadId(t.id)
    setLoading(false)
  }

  async function loadMessages(tid){
    const { data, error } = await supabase.from('chat_messages').select('*').eq('thread_id', tid).order('created_at',{ascending:true})
    if (error){ console.error(error); return }
    setMessages(data || [])
  }

  useEffect(()=>{
    if (authLoading) return
    if (!user) return
    ensureThread()
  }, [authLoading, user?.id])

  useEffect(()=>{
    if (!threadId) return
    loadMessages(threadId)
    const ch = supabase.channel('chat:'+threadId)
      .on('postgres_changes', {event:'*', schema:'public', table:'chat_messages', filter:`thread_id=eq.${threadId}`}, () => loadMessages(threadId))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [threadId])

  async function send(kind='message'){
    setErr('')
    const body = kind==='message' ? text.trim() : `Заявка на пополнение: ${amount} ₽`
    if (!body) return
    const payload = { thread_id: threadId, sender_id: user.id, body, kind, amount_rub: kind==='topup_request' ? Number(amount) : null }
    const { error } = await supabase.from('chat_messages').insert(payload)
    if (error){ setErr(error.message); return }
    setText('')
  }

  async function approveTopup(msg){
    if (!isAdmin) return
    setErr('')
    const a = Number(msg.amount_rub || 0)
    const { error: rpcErr } = await supabase.rpc('admin_add_balance', { p_user_id: msg.sender_id, p_amount_rub: a, p_note: `Пополнение через чат (${threadId})` })
    if (rpcErr){ setErr(rpcErr.message); return }
    const { error } = await supabase.from('chat_messages').insert({ thread_id: threadId, sender_id: user.id, body: `Пополнение подтверждено: +${a} ₽`, kind:'topup_approved', amount_rub:a })
    if (error) setErr(error.message)
  }

  return (
    <RequireAuth>
      <div className="container main">
        <div className="card cardPad" style={{display:'grid', gap:12}}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <div><div className="h1">Чат</div><p className="p">Заявки на пополнение и диалог.</p></div>
            <span className="badge">{isAdmin ? 'Админ' : 'Покупатель'}</span>
          </div>
          <div className="hr" />
          {loading ? <Loading label="Открываем чат..." /> : (
            <>
              <div className="card" style={{padding:12, maxHeight:420, overflow:'auto'}}>
                {messages.length ? messages.map(m => (
                  <div key={m.id} style={{padding:'10px 10px', borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                    <div className="row" style={{justifyContent:'space-between'}}>
                      <div className="small">{m.sender_id===user.id?'Ты':'Собеседник'} · {fmt(m.created_at)} · <span className="badge">{m.kind}</span></div>
                      {isAdmin && m.kind==='topup_request' ? <button className="btn btnPrimary" onClick={()=>approveTopup(m)}>Подтвердить +{m.amount_rub} ₽</button> : null}
                    </div>
                    <div style={{marginTop:6}}>{m.body}</div>
                  </div>
                )) : <div className="small">Сообщений нет.</div>}
              </div>

              {!isAdmin && (
                <div className="card cardPad">
                  <div className="h2">Пополнение</div>
                  <p className="p">Отправь заявку — админ подтвердит и баланс увеличится.</p>
                  <div className="row" style={{marginTop:10}}>
                    <select className="input" style={{maxWidth:220}} value={amount} onChange={e=>setAmount(e.target.value)}>
                      {[200,500,1000,2000,5000,10000].map(v => <option key={v} value={v}>{v} ₽</option>)}
                    </select>
                    <button className="btn btnPrimary" onClick={()=>send('topup_request')}>Отправить заявку</button>
                  </div>
                </div>
              )}

              <div className="card cardPad">
                <div className="h2">Сообщение</div>
                <div className="row" style={{marginTop:10}}>
                  <input className="input" placeholder="Сообщение..." value={text} onChange={e=>setText(e.target.value)} />
                  <button className="btn btnPrimary" onClick={()=>send('message')}>Отправить</button>
                </div>
                {err ? <div className="toast" style={{marginTop:10}}>{err}</div> : null}
              </div>
            </>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}