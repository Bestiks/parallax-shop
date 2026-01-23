'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '../../../../lib/supabase/client'
import ChatUI from '../../../../components/ChatUI'
import Link from 'next/link'
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiDollarSign } from 'react-icons/fi'

export default function AdminChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const threadId = params.threadId as string
  
  const [thread, setThread] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    if (threadId) {
      loadThread()
    }
  }, [threadId])

  async function loadThread() {
    setIsLoading(true)
    
    try {
      // Получаем информацию о потоке
      const { data: threadData, error: threadError } = await supabase
        .from('chat_threads')
        .select(`
          *,
          profiles (
            id,
            username,
            full_name,
            email,
            phone,
            balance_rub,
            role,
            banned,
            public_id
          )
        `)
        .eq('id', threadId)
        .single()

      if (threadError) throw threadError

      if (!threadData) {
        router.push('/admin/chats')
        return
      }

      setThread(threadData)
      setUserProfile(threadData.profiles)

      // Получаем текущего пользователя (админа)
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      // Помечаем все сообщения как прочитанные
      await supabase
        .from('chat_messages')
        .update({ read: true })
        .eq('thread_id', threadId)
        .neq('sender_id', authUser?.id)

    } catch (error) {
      console.error('Ошибка загрузки чата:', error)
      router.push('/admin/chats')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <div className="h-[600px] bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-48 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!thread || !userProfile || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Чат не найден</p>
          <Link href="/admin/chats" className="text-primary-600 hover:text-primary-700">
            Вернуться к списку чатов
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/admin/chats"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4"
        >
          <FiArrowLeft />
          Назад к списку чатов
        </Link>
        
        <h1 className="text-3xl font-bold">Чат с пользователем</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Чат */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ChatUI 
              threadId={threadId} 
              userId={user.id}
              isAdmin={true}
            />
          </div>
        </div>

        {/* Информация о пользователе */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FiUser />
              Информация о пользователе
            </h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Имя пользователя</div>
                <div className="font-medium">@{userProfile.username}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Полное имя</div>
                <div className="font-medium">{userProfile.full_name || 'Не указано'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <FiMail />
                  Email
                </div>
                <div className="font-medium truncate">{userProfile.email}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <FiPhone />
                  Телефон
                </div>
                <div className="font-medium">{userProfile.phone || 'Не указан'}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <FiDollarSign />
                  Баланс
                </div>
                <div className="font-medium text-lg text-primary-600">
                  {userProfile.balance_rub.toLocaleString('ru-RU')} ₽
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  userProfile.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {userProfile.role === 'admin' ? 'Администратор' : 'Пользователь'}
                </span>
                
                <span className={`px-2 py-1 text-xs rounded-full ${
                  userProfile.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {userProfile.banned ? 'Заблокирован' : 'Активен'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <div>ID: {userProfile.public_id}</div>
                <div>Зарегистрирован: {new Date(userProfile.created_at).toLocaleDateString('ru-RU')}</div>
              </div>
            </div>
            
            <div className="mt-6 space-y-2">
              <Link
                href={`/admin/users`}
                className="w-full btn-secondary text-center block"
              >
                Управление пользователем
              </Link>
            </div>
          </div>

          {/* Быстрые действия */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  // Копирование ID пользователя
                  navigator.clipboard.writeText(userProfile.id)
                  alert('ID пользователя скопирован')
                }}
                className="w-full btn-secondary"
              >
                Скопировать ID пользователя
              </button>
              
              <button
                onClick={() => {
                  navigator.clipboard.writeText(userProfile.email)
                  alert('Email скопирован')
                }}
                className="w-full btn-secondary"
              >
                Скопировать email
              </button>
              
              <Link
                href={`/admin/topups`}
                className="w-full btn-primary text-center block"
              >
                Проверить заявки на пополнение
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
