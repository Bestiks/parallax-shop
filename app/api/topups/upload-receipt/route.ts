import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const topup_id = formData.get('topup_id') as string

    if (!file || !topup_id) {
      return NextResponse.json(
        { error: 'Файл и ID заявки обязательны' },
        { status: 400 }
      )
    }

    // Проверяем тип файла
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Поддерживаются только JPG, PNG и PDF файлы' },
        { status: 400 }
      )
    }

    // Проверяем размер файла (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Размер файла не должен превышать 5MB' },
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

    // Проверяем, принадлежит ли заявка пользователю
    const { data: topup } = await supabase
      .from('topup_requests')
      .select('*')
      .eq('id', topup_id)
      .eq('user_id', user.id)
      .single()

    if (!topup) {
      return NextResponse.json(
        { error: 'Заявка не найдена или нет доступа' },
        { status: 404 }
      )
    }

    // Генерируем имя файла
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `receipts/${user.id}/${fileName}`

    // Загружаем файл в Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file)

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      )
    }

    // Получаем публичный URL
    const { data: urlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath)

    // Обновляем заявку с ссылкой на чек
    const { error: updateError } = await supabase
      .from('topup_requests')
      .update({
        receipt_url: urlData.publicUrl,
        status: 'processing',
      })
      .eq('id', topup_id)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    // Отправляем сообщение в чат
    const thread = await supabase
      .from('chat_threads')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (thread.data) {
      await supabase
        .from('chat_messages')
        .insert({
          thread_id: thread.data.id,
          sender_id: user.id,
          message: `Прикреплен чек к заявке #${topup_id.substring(0, 8)}...`,
          attachment_url: urlData.publicUrl,
        })
    }

    return NextResponse.json({ 
      message: 'Чек успешно загружен',
      url: urlData.publicUrl 
    })

  } catch (error: any) {
    console.error('Upload receipt error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
