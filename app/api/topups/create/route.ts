import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount_rub } = body

    if (!amount_rub || amount_rub < 100) {
      return NextResponse.json(
        { error: 'Сумма должна быть не менее 100 рублей' },
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

    // Проверяем, не забанен ли пользователь
    const { data: profile } = await supabase
      .from('profiles')
      .select('banned')
      .eq('id', user.id)
      .single()

    if (profile?.banned) {
      return NextResponse.json(
        { error: 'Ваш аккаунт заблокирован' },
        { status: 403 }
      )
    }

    // Создаем заявку на пополнение
    const { data, error } = await supabase
      .from('topup_requests')
      .insert({
        user_id: user.id,
        amount_rub,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Отправляем сообщение в чат с информацией о реквизитах
    const thread = await supabase
      .from('chat_threads')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (thread.data) {
      const message = `Создана заявка на пополнение баланса на сумму ${amount_rub} ₽.\n\nРеквизиты для оплаты:\nБанк: Тинькофф\nСчет: 5536 9138 1234 5678\nПолучатель: ООО "Parallax Shop"\nНазначение: Пополнение баланса #${data.id}\n\nПосле оплаты прикрепите чек к этому сообщению.`
      
      await supabase
        .from('chat_messages')
        .insert({
          thread_id: thread.data.id,
          sender_id: user.id, // От имени системы можно использовать специальный ID
          message,
        })
    }

    return NextResponse.json({ 
      message: 'Заявка создана',
      topup: data 
    })

  } catch (error: any) {
    console.error('Create topup error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
