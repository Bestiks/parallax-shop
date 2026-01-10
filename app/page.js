import Link from 'next/link'
export default function Home(){
  return (
    <div className="container main">
      <div className="card cardPad">
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>
            <div className="h1">Parallax Shop</div>
            <p className="p">Каталог, баланс, чат и админка.</p>
          </div>
          <span className="badge">Next.js + Supabase</span>
        </div>
        <div className="hr" />
        <div className="row">
          <Link className="btn btnPrimary" href="/catalog">Каталог</Link>
          <Link className="btn" href="/chat">Чат</Link>
          <Link className="btn" href="/account">Профиль</Link>
        </div>
      </div>
    </div>
  )
}
