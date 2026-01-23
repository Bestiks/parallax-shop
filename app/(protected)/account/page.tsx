'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'
import { FiUser, FiPhone, FiMail, FiEdit2, FiCheck, FiX, FiCreditCard, FiMessageSquare } from 'react-icons/fi'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    full_name: '',
    phone: '',
    username: '',
  })
  const [topups, setTopups] = useState<any[]>([])
  const [amount, setAmount] = useState('')
  const [isCreatingTopup, setIsCreatingTopup] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Загружаем профиль
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
      setEditData({
        full_name: profileData.full_name || '',
        phone: profileData.phone || '',
        username: profileData.username || '',
      })
    }

    // Загружаем заявки на пополнение
    const { data: topupsData } = await supabase
      .from('topup_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (topupsData) {
      setTopups(topupsData)
    }

    setIsLoading(false)
  }

  async function handleUpdateProfile() {
    if (!profile) return

    const { error } = await supabase
      .from('profiles')
      .update(editData)
      .eq('id', profile.id)

    if (!error) {
      setProfile({ ...profile, ...editData })
      setIsEditing(false)
    }
  }

  async function handleCreateTopup() {
    if (!profile || !amount || isNaN(parseInt(amount))) return

    setIsCreatingTopup(true)

    try {
      const response = await fetch('/api/topups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_rub: parseInt(amount),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setAmount('')
        loadData() // Обновляем список заявок
        
        // Перенаправляем в чат
        router.push('/chat')
      }
    } catch (error) {
      console.error('Ошибка создания заявки:', error)
    } finally {
      setIsCreatingTopup(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Профиль не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FiUser />
                Информация профиля
              </h2>
              <button
                onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
              >
                {isEditing ? <><FiCheck /> Сохранить</> : <><FiEdit2 /> Редактировать</>}
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID пользователя
                </label>
                <div className="input-field bg-gray-50">
                  {profile.public_id}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FiUser />
                  Полное имя
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.full_name}
                    onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    className="input-field"
                    placeholder="Введите полное имя"
                  />
                ) : (
                  <div className="input-field bg-gray-50">
                    {profile.full_name || 'Не указано'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FiPhone />
                  Телефон
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="input-field"
                    placeholder="+7 (999) 123-45-67"
                  />
                ) : (
                  <div className="input-field bg-gray-50">
                    {profile.phone || 'Не указан'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя пользователя
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.username}
                    onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                    className="input-field"
                    placeholder="username"
                  />
                ) : (
                  <div className="input-field bg-gray-50">
                    @{profile.username}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditData({
                        full_name: profile.full_name || '',
                        phone: profile.phone || '',
                        username: profile.username || '',
                      })
                    }}
                    className="btn-secondary"
                  >
                    <FiX /> Отмена
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* История заявок */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <FiCreditCard />
              История заявок на пополнение
            </h2>

            {topups.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Сумма
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дата
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topups.map((topup) => (
                      <tr key={topup.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {topup.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {topup.amount_rub.toLocaleString('ru-RU')} ₽
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            topup.status === 'completed' ? 'bg-green-100 text-green-800' :
                            topup.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            topup.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {topup.status === 'completed' ? 'Завершено' :
                             topup.status === 'pending' ? 'Ожидание' :
                             topup.status === 'rejected' ? 'Отклонено' :
                             'В обработке'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(topup.created_at).toLocaleDateString('ru-RU')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Нет заявок на пополнение
              </div>
            )}
          </div>
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Баланс */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Баланс</h2>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {profile.balance_rub.toLocaleString('ru-RU')} ₽
              </div>
              <p className="text-gray-600">Доступно для покупок</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Пополнить баланс</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Сумма пополнения, ₽
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="input-field"
                  placeholder="1000"
                  min="100"
                />
              </div>
              <button
                onClick={handleCreateTopup}
                disabled={!amount || isNaN(parseInt(amount)) || isCreatingTopup}
                className="w-full btn-primary"
              >
                {isCreatingTopup ? 'Создание...' : 'Создать заявку'}
              </button>
              <p className="text-xs text-gray-500 text-center">
                После создания заявки вам будут предоставлены реквизиты для оплаты
              </p>
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/chat')}
                className="w-full flex items-center justify-center gap-2 btn-secondary"
              >
                <FiMessageSquare />
                Чат с поддержкой
              </button>
            </div>
          </div>

          {/* Статус аккаунта */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Статус аккаунта</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Роль:</span>
                <span className={`font-medium ${
                  profile.role === 'admin' ? 'text-red-600' : 'text-gray-900'
                }`}>
                  {profile.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Статус:</span>
                <span className={`font-medium ${
                  profile.banned ? 'text-red-600' : 'text-green-600'
                }`}>
                  {profile.banned ? 'Заблокирован' : 'Активен'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Регистрация:</span>
                <span className="font-medium">
                  {new Date(profile.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
