'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '../lib/supabase/client'
import { FiSend, FiPaperclip, FiCheck } from 'react-icons/fi'

interface Message {
  id: string
  message: string
  sender_id: string
  attachment_url?: string
  created_at: string
  read: boolean
}

interface ChatUIProps {
  threadId: string
  userId: string
  isAdmin?: boolean
}

export default function ChatUI({ threadId, userId, isAdmin = false }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    loadMessages()
    subscribeToMessages()
  }, [threadId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  async function loadMessages() {
    setIsLoading(true)
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      setMessages(data)
      
      // Помечаем непрочитанные сообщения как прочитанные
      const unreadMessages = data.filter(
        msg => !msg.read && msg.sender_id !== userId
      )
      
      if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg.id)
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .in('id', messageIds)
      }
    }
    
    setIsLoading(false)
  }

  function subscribeToMessages() {
    const channel = supabase
      .channel(`chat:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `thread_id=eq.${threadId}`
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages(prev => [...prev, newMessage])
          
          // Если сообщение не от текущего пользователя, помечаем как прочитанное
          if (newMessage.sender_id !== userId) {
            supabase
              .from('chat_messages')
              .update({ read: true })
              .eq('id', newMessage.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    
    if (!newMessage.trim() && !attachment) return
    
    setIsSending(true)
    
    try {
      let attachmentUrl = null
      
      if (attachment) {
        const fileExt = attachment.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `receipts/${userId}/${fileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, attachment)
        
        if (!uploadError) {
          const { data } = supabase.storage
            .from('receipts')
            .getPublicUrl(filePath)
          
          attachmentUrl = data.publicUrl
        }
      }
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          thread_id: threadId,
          sender_id: userId,
          message: newMessage.trim(),
          attachment_url: attachmentUrl
        })
      
      if (!error) {
        setNewMessage('')
        setAttachment(null)
      }
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error)
    } finally {
      setIsSending(false)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleAttachmentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
      if (validTypes.includes(file.type)) {
        setAttachment(file)
      } else {
        alert('Поддерживаются только JPG, PNG и PDF файлы')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px]">
      {/* Сообщения */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Нет сообщений. Начните общение!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === userId
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.message}</p>
                
                {message.attachment_url && (
                  <div className="mt-2">
                    <a
                      href={message.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1 text-sm ${
                        message.sender_id === userId
                          ? 'text-primary-200 hover:text-white'
                          : 'text-primary-600 hover:text-primary-700'
                      }`}
                    >
                      <FiPaperclip />
                      Вложение
                    </a>
                  </div>
                )}
                
                <div className={`text-xs mt-1 ${
                  message.sender_id === userId ? 'text-primary-200' : 'text-gray-500'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {message.read && message.sender_id === userId && (
                    <span className="ml-2">
                      <FiCheck className="inline" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Форма отправки */}
      <form onSubmit={handleSendMessage} className="border-t bg-white p-4 rounded-b-lg">
        {attachment && (
          <div className="mb-2 flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-sm text-gray-600 truncate">
              {attachment.name}
            </span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <div className="flex-grow">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="input-field"
              disabled={isSending}
            />
          </div>
          
          <label className="cursor-pointer p-2 text-gray-600 hover:text-primary-600">
            <FiPaperclip size={20} />
            <input
              type="file"
              className="hidden"
              onChange={handleAttachmentChange}
              accept=".jpg,.jpeg,.png,.pdf"
              disabled={isSending}
            />
          </label>
          
          <button
            type="submit"
            disabled={isSending || (!newMessage.trim() && !attachment)}
            className="btn-primary flex items-center gap-2"
          >
            <FiSend />
            <span className="hidden sm:inline">Отправить</span>
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Можно прикреплять JPG, PNG, PDF файлы
        </p>
      </form>
    </div>
  )
}

