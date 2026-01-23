import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { thread_id, message, attachment_url } = body

    if (!thread_id || !message) {
      return NextResponse.json(
        { error: 'thread_id и message обязательны' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Проверяем авторизацию
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    // Проверяем, есть ли у пользователя доступ к этому потоку
    const { data: thread } = await supabase
      .from('chat_threads')
      .select('*')
      .eq('id', thread_id)
      .single()

    if (!thread) {
      return NextResponse.json(
        { error: 'Чат не найден' },
        { status: 404 }
      )
    }

    // Проверяем доступ (пользователь или админ)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Профиль не найден' },
        { status: 403 }
      )
    }

    const isAdmin = profile.role === 'admin'
    const isThreadOwner = thread.user_id === user.id

    if (!isAdmin && !isThreadOwner) {
      return NextResponse.json(
        { error: 'Нет доступа к этому чату' },
        { status: 403 }
      )
    }

    // Отправляем сообщение
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        thread_id,
        sender_id: user.id,
        message,
        attachment_url,
        read: false,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Обновляем время последнего сообщения в потоке
    await supabase
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', thread_id)

    return NextResponse.json({ message: data })

  } catch (error: any) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

