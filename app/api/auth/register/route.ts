import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, phone, username } = body

    // Валидация
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, пароль и имя пользователя обязательны' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Имя пользователя должно содержать минимум 3 символа' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Проверяем, существует ли пользователь с таким email
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким именем уже существует' },
        { status: 400 }
      )
    }

    // Регистрируем пользователя
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone,
          username,
        },
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Не удалось создать пользователя' },
        { status: 500 }
      )
    }

    // Триггер handle_new_user автоматически создаст профиль
    // Ждем немного, чтобы триггер выполнился
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Получаем созданный профиль
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    return NextResponse.json({
      message: 'Регистрация успешна',
      user: authData.user,
      profile,
    })

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
