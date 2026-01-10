'use client'
import { useEffect, useState } from 'react'
import RequireAdmin from '@/components/RequireAdmin'
import { useAuth } from '@/components/AuthProvider'
import Loading from '@/components/Loading'

const CATS = [
  { key:'smartphones', label:'Смартфоны' },
  { key:'laptops', label:'Ноутбуки' },
  { key:'computers', label:'Компьютеры' },
  { key:'watches', label:'Часы' },
]

export default function AdminProducts(){
  const { supabase } = useAuth()
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(true)
  const [err,setErr]=useState('')
  const [title,setTitle]=useState('')
  const [price,setPrice]=useState(0)
  const [category,setCategory]=useState('smartphones')
  const [imageUrl,setImageUrl]=useState('')
  const [description,setDescription]=useState('')

  async function load(){
    setErr(''); setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('created_at',{ascending:false})
    setLoading(false)
    if (error){ setErr(error.message); setItems([]); return }
    setItems(data || [])
  }
  useEffect(()=>{ load() }, [])

  async function add(e){
    e.preventDefault()
    setErr('')
    const { error } = await supabase.from('products').insert({
      title: title.trim(),
      category,
      price_rub: Number(price),
      image_url: imageUrl.trim() || null,
      description: description.trim() || null,
    })
    if (error){ setErr(error.message); return }
    setTitle(''); setPrice(0); setImageUrl(''); setDescription('')
    await load()
  }

  async function del(id){
    if (!confirm('Удалить товар?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error){ setErr(error.message); return }
    await load()
  }

  return (
    <RequireAdmin>
      <div className="card cardPad">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div><div className="h1">Товары</div><p className="p">Добавление/удаление.</p></div>
          <button className="btn" onClick={load}>Обновить</button>
        </div>
        <div className="hr" />
        <form className="grid grid2" onSubmit={add}>
          <div className="grid">
            <input className="input" placeholder="Название" value={title} onChange={e=>setTitle(e.target.value)} required />
            <textarea className="input" placeholder="Описание" value={description} onChange={e=>setDescription(e.target.value)} rows={3} />
            <input className="input" placeholder="Ссылка на фото (URL)" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />
          </div>
          <div className="grid">
            <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
              {CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
            <input className="input" type="number" min={0} placeholder="Цена ₽" value={price} onChange={e=>setPrice(e.target.value)} required />
            <button className="btn btnPrimary">Добавить</button>
            <div className="small">Фото — URL. (Storage можно подключить позже).</div>
          </div>
        </form>
        <div className="hr" />
        {loading ? <Loading/> : (
          <div style={{overflow:'auto'}}>
            <table className="table">
              <thead><tr><th>ID</th><th>Название</th><th>Категория</th><th>Цена</th><th></th></tr></thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.title}</td>
                    <td>{p.category}</td>
                    <td>{Number(p.price_rub).toLocaleString('ru-RU')} ₽</td>
                    <td><button className="btn btnDanger" onClick={()=>del(p.id)}>Удалить</button></td>
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