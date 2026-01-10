'use client'
import { useEffect, useState } from 'react'
import RequireAdmin from '@/components/RequireAdmin'
import { useAuth } from '@/components/AuthProvider'
import Loading from '@/components/Loading'

function fmt(ts){ try { return new Date(ts).toLocaleString('ru-RU') } catch { return '' } }

export default function AdminChatThread({ params }){
  const threadId = params.threadId
  const { supabase, user } = useAuth()
  const [messages,setMessages]=useState([])
  const [text,setText]=useState('')
  const [loading,setLoading]=useState(true)
  const [err,setErr]=useState('')

  async function load(){
    setErr(''); setLoading(true)
    const { data, error } = await supabase.from('chat_messages').select('*').eq('thread_id', threadId).order('created_at',{ascending:true})
    setLoading(false)
    if (error){ setErr(error.message); setMessages([]); return }
    setMessages(data || [])
  }
  useEffect(()=>{ load() }, [threadId])

  useEffect(()=>{
    const ch = supabase.channel('adminchat:'+threadId)
      .on('postgres_changes', {event:'*', schema:'public', table:'chat_messages', filter:`thread_id=eq.${threadId}`}, load)
      .subscribe()
    return ()=>{ supabase.removeChannel(ch) }
  }, [threadId])

  async function send(){
    setErr('')
    const body = text.trim()
    if (!body) return
    const { error } = await supabase.from('chat_messages').insert({ thread_id: threadId, sender_id: user.id, body, kind:'message' })
    if (error){ setErr(error.message); return }
    setText('')
  }

  async function approve(msg){
    setErr('')
    const a = Number(msg.amount_rub || 0)
    const { error: rpcErr } = await supabase.rpc('admin_add_balance', { p_user_id: msg.sender_id, p_amount_rub:a, p_note:`Пополнение через чат (${threadId})` })
    if (rpcErr){ setErr(rpcErr.message); return }
    const { error } = await supabase.from('chat_messages').insert({ thread_id: threadId, sender_id: user.id, body:`Пополнение подтверждено: +${a} ₽`, kind:'topup_approved', amount_rub:a })
    if (error) setErr(error.message)
  }

  return (
    <RequireAdmin>
      <div className="card cardPad" style={{display:'grid', gap:12}}>
        <div><div className="h1">Чат: {threadId}</div><p className="p">Подтверждай заявки.</p></div>
        <div className="card" style={{padding:12, maxHeight:420, overflow:'auto'}}>
          {loading ? <Loading/> : (
            messages.length ? messages.map(m => (
              <div key={m.id} style={{padding:'10px 10px', borderBottom:'1px solid rgba(255,255,255,.07)'}}>
                <div className="row" style={{justifyContent:'space-between'}}>
                  <div className="small">{fmt(m.created_at)} · <span className="badge">{m.kind}</span></div>
                  {m.kind==='topup_request' ? <button className="btn btnPrimary" onClick={()=>approve(m)}>Подтвердить +{m.amount_rub} ₽</button> : null}
                </div>
                <div style={{marginTop:6}}>{m.body}</div>
              </div>
            )) : <div className="small">Сообщений нет.</div>
          )}
        </div>
        <div className="card cardPad">
          <div className="h2">Ответ</div>
          <div className="row" style={{marginTop:10}}>
            <input className="input" placeholder="Ответ..." value={text} onChange={e=>setText(e.target.value)} />
            <button className="btn btnPrimary" onClick={send}>Отправить</button>
          </div>
          {err ? <div className="toast" style={{marginTop:10}}>{err}</div> : null}
        </div>
      </div>
    </RequireAdmin>
  )
}