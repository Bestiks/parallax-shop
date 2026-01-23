import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Проверяем авторизацию
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    // Проверяем права администратора
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Требуются права администратора' },
        { status: 403 }
      )
    }

    // Получаем всех пользователей
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        balance_transactions (
          amount_rub,
          type,
          created_at
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ users: data || [] })

  } catch (error: any) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, updates } = body

    if (!user_id || !updates) {
      return NextResponse.json(
        { error: 'user_id и updates обязательны' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Проверяем авторизацию и права
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single()

    if (adminProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Требуются права администратора' },
        { status: 403 }
      )
    }

    // Обновляем профиль пользователя
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Если обновляется баланс, создаем транзакцию
    if (updates.balance_rub !== undefined) {
      // Получаем текущий баланс
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('balance_rub')
        .eq('id', user_id)
        .single()

      if (currentProfile) {
        const difference = updates.balance_rub - currentProfile.balance_rub
        
        if (difference !== 0) {
          await supabase
            .from('balance_transactions')
            .insert({
              user_id,
              amount_rub: difference,
              type: 'manual',
              description: 'Корректировка баланса администратором',
            })
        }
      }
    }

    return NextResponse.json({ 
      message: 'Профиль обновлен',
      user: data 
    })

  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
