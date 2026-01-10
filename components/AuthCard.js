export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="container main">
      <div className="card" style={{maxWidth:520, margin:'0 auto'}}>
        <div className="cardPad">
          <div className="h1">{title}</div>
          {subtitle ? <p className="p">{subtitle}</p> : null}
          <div className="hr" />
          {children}
        </div>
      </div>
    </div>
  )
}