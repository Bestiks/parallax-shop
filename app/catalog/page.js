'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Loading from '@/components/Loading'

const CATS = [
  { key:'all', label:'Все' },
  { key:'smartphones', label:'Смартфоны' },
  { key:'laptops', label:'Ноутбуки' },
  { key:'computers', label:'Компьютеры' },
  { key:'watches', label:'Часы' },
]

export default function CatalogPage(){
  const { supabase } = useAuth()
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(true)
  const [category,setCategory]=useState('all')
  const [sort,setSort]=useState('new')
  const [q,setQ]=useState('')

  async function load(){
    setLoading(true)
    let query = supabase.from('products').select('*')
    if (category !== 'all') query = query.eq('category', category)
    if (q.trim()) query = query.ilike('title', `%${q.trim()}%`)
    if (sort==='new') query = query.order('created_at', {ascending:false})
    if (sort==='cheap') query = query.order('price_rub', {ascending:true})
    if (sort==='expensive') query = query.order('price_rub', {ascending:false})
    const { data, error } = await query
    setLoading(false)
    if (error){ console.error(error); setItems([]); return }
    setItems(data || [])
  }

  useEffect(()=>{ load() }, [category, sort])

  return (
    <div className="container main">
      <div className="card cardPad">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div><div className="h1">Каталог</div><p className="p">Товары по категориям.</p></div>
          <span className="badge">Купить</span>
        </div>
        <div className="hr" />
        <div className="grid grid3">
          <div>
            <div className="small">Поиск</div>
            <input className="input" placeholder="iPhone" value={q} onChange={e=>setQ(e.target.value)} />
            <div style={{marginTop:10}}><button className="btn btnPrimary" onClick={load}>Найти</button></div>
          </div>
          <div>
            <div className="small">Категория</div>
            <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
              {CATS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <div className="small">Сортировка</div>
            <select className="input" value={sort} onChange={e=>setSort(e.target.value)}>
              <option value="new">Сначала новые</option>
              <option value="cheap">Сначала дешевле</option>
              <option value="expensive">Сначала дороже</option>
            </select>
          </div>
        </div>
        <div className="hr" />
        {loading ? <Loading label="Грузим товары..." /> : (
          items.length ? (
            <div className="grid grid3">
              {items.map(p => (
                <div key={p.id} className="card">
                  <div style={{padding:12}}>
                    <div style={{height:150, borderRadius:12, border:'1px solid rgba(255,255,255,.10)', background:'rgba(0,0,0,.25)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      {p.image_url ? <img src={p.image_url} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div className="small">Нет фото</div>}
                    </div>
                    <div style={{marginTop:10, display:'flex', justifyContent:'space-between', gap:10}}>
                      <div style={{fontWeight:800}}>{p.title}</div>
                      <div className="badge">{Number(p.price_rub).toLocaleString('ru-RU')} ₽</div>
                    </div>
                    <div className="small" style={{marginTop:6}}>{p.category}</div>
                    <p className="p" style={{marginTop:8}}>{p.description || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="card cardPad">Товаров не найдено.</div>
        )}
      </div>
    </div>
  )
}