export default function Loading({ label='Загрузка...' }) {
  return (
    <div className="card cardPad" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:10}}>
      <div style={{width:10, height:10, borderRadius:999, background:'rgba(124,58,237,.9)', boxShadow:'0 0 20px rgba(124,58,237,.6)'}} />
      <div className="small">{label}</div>
    </div>
  )
}