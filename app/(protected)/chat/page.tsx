'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'
import ChatUI from '../../../components/ChatUI'
import Loading from '../../../components/Loading'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const [thread, setThread] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadChatThread()
  }, [])

  async function loadChatThread() {
    setIsLoading(true)
    
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/auth/login')
      return
    }
    
    setUser(authUser)

    // Получаем или создаем поток чата
    const { data: threadData } = await supabase
      .from('chat_threads')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    if (threadData) {
      setThread(threadData)
    }

    setIsLoading(false)
  }

  if (isLoading) {
    return <Loading />
  }

  if (!thread || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Чат не найден</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Чат с поддержкой</h1>
      
      <div className="mb-6 text-gray-600">
        <p>Здесь вы можете общаться с администратором по вопросам:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Пополнения баланса и загрузки чеков</li>
          <li>Проблем с заказами</li>
          <li>Технических вопросов</li>
          <li>Предложений и жалоб</li>
        </ul>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ChatUI 
          threadId={thread.id} 
          userId={user.id}
        />
      </div>
    </div>
  )
}
