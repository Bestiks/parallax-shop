'use client'
import RequireAuth from '@/components/RequireAuth'
import Loading from '@/components/Loading'
import { useAuth } from '@/components/AuthProvider'

export default function AccountPage(){
  const { profile, loading, refreshProfile } = useAuth()

  return (
    <RequireAuth>
      <div className="container main">
        <div className="card cardPad">
          <div className="row" style={{justifyContent:'space-between'}}>
            <div>
              <div className="h1">Профиль</div>
              <p className="p">Данные и баланс.</p>
            </div>
            <button className="btn" onClick={refreshProfile}>Обновить</button>
          </div>
          <div className="hr" />
          {loading ? <Loading /> : (
            profile ? (
              <div className="grid grid2">
                <div className="card cardPad">
                  <div className="h2">Данные</div><div className="hr" />
                  <div className="kv"><div className="k">Public ID</div><div className="v">{profile.public_id}</div></div>
                  <div className="kv"><div className="k">ФИО</div><div className="v">{profile.full_name}</div></div>
                  <div className="kv"><div className="k">Телефон</div><div className="v">{profile.phone}</div></div>
                  <div className="kv"><div className="k">Ник</div><div className="v">{profile.username ?? '—'}</div></div>
                </div>
                <div className="card cardPad">
                  <div className="h2">Баланс</div><div className="hr" />
                  <div className="kv"><div className="k">Роль</div><div className="v">{profile.role}</div></div>
                  <div className="kv"><div className="k">Баланс</div><div className="v">{Number(profile.balance_rub||0).toLocaleString('ru-RU')} ₽</div></div>
                  <div className="kv"><div className="k">Статус</div><div className="v">{profile.banned ? 'Забанен' : 'Активен'}</div></div>
                  <p className="small" style={{marginTop:10}}>Пополнение — через чат.</p>
                </div>
              </div>
            ) : <div className="toast">Профиль не найден. Выполни supabase.sql в новом проекте Supabase.</div>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}