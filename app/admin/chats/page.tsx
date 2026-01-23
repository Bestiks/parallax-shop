'use client'

import { useState, useEffect } from 'react'
import { createClient } from '../../../lib/supabase/client'
import Link from 'next/link'
import { FiMessageSquare, FiUser, FiClock, FiSearch } from 'react-icons/fi'

interface ChatThread {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  profiles: {
    username: string
    full_name: string
    public_id: number
  }
  unread_count: number
  last_message?: string
}

export default function AdminChatsPage() {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [filteredThreads, setFilteredThreads] = useState<ChatThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    loadChats()
    subscribeToChats()
  }, [])

  useEffect(() => {
    filterThreads()
  }, [searchTerm, threads])

  async function loadChats() {
    setIsLoading(true)
    
    try {
      // Получаем все потоки чатов с информацией о пользователях
      const { data: threadsData, error: threadsError } = await supabase
        .from('chat_threads')
        .select(`
          *,
          profiles (
            username,
            full_name,
            public_id
          )
        `)
        .order('updated_at', { ascending: false })
      
      if (threadsError) throw threadsError

      // Для каждого потока получаем количество непрочитанных сообщений
      const threadsWithStats = await Promise.all(
        (threadsData || []).map(async (thread) => {
          const { count: unreadCount } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id)
            .eq('read', false)
            .neq('sender_id', thread.user_id) // Сообщения от пользователя админу

          // Получаем последнее сообщение
          const { data: lastMessage } = await supabase
            .from('chat_messages')
            .select('message, created_at')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...thread,
            unread_count: unreadCount || 0,
            last_message: lastMessage?.message,
            last_message_time: lastMessage?.created_at,
          }
        })
      )

      setThreads(threadsWithStats)
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function subscribeToChats() {
    const channel = supabase
      .channel('admin-chats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        () => {
          loadChats() // Обновляем список при новых сообщениях
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  function filterThreads() {
    if (!searchTerm.trim()) {
      setFilteredThreads(threads)
      return
    }
    
    const term = searchTerm.toLowerCase()
    const filtered = threads.filter(thread =>
      thread.profiles?.username?.toLowerCase().includes(term) ||
      thread.profiles?.full_name?.toLowerCase().includes(term) ||
      thread.last_message?.toLowerCase().includes(term)
    )
    
    setFilteredThreads(filtered)
  }

  function formatTime(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)

    if (diffHours < 24) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } else if (diffHours < 48) {
      return 'Вчера'
    } else {
      return date.toLocaleDateString('ru-RU')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Чат с пользователями</h1>

      {/* Поиск */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по имени пользователя или сообщению..."
            className="pl-10 input-field"
          />
        </div>
      </div>

      {/* Список чатов */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredThreads.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredThreads.map((thread) => (
              <Link
                key={thread.id}
                href={`/admin/chats/${thread.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <FiUser className="text-primary-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {thread.profiles?.full_name || thread.profiles?.username}
                          </h3>
                          <span className="text-sm text-gray-500">
                            @{thread.profiles?.username}
                          </span>
                          <span className="text-sm text-gray-500">
                            ID: {thread.profiles?.public_id}
                          </span>
                        </div>
                        
                        {thread.last_message && (
                          <p className="text-gray-600 text-sm mt-1 truncate max-w-2xl">
                            {thread.last_message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <FiClock />
                        <span>{formatTime(thread.updated_at)}</span>
                      </div>
                      
                      {thread.unread_count > 0 && (
                        <div className="mt-2">
                          <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                            {thread.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FiMessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Нет активных чатов</p>
            <p className="text-gray-500 text-sm mt-1">
              Когда пользователи напишут в чат, они появятся здесь
            </p>
          </div>
        )}
      </div>

      {/* Статистика */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FiMessageSquare className="text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {threads.length}
              </div>
              <div className="text-sm text-gray-600">Всего чатов</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <FiClock className="text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {threads.filter(t => t.unread_count > 0).length}
              </div>
              <div className="text-sm text-gray-600">Чатов с непрочитанными</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FiUser className="text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">
                {new Set(threads.map(t => t.user_id)).size}
              </div>
              <div className="text-sm text-gray-600">Уникальных пользователей</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
