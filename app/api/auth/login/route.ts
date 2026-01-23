import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // Проверяем, не забанен ли пользователь
    const { data: profile } = await supabase
      .from('profiles')
      .select('banned')
      .eq('id', data.user.id)
      .single()

    if (profile?.banned) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Ваш аккаунт заблокирован' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      message: 'Вход успешен',
      user: data.user,
    })

  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
