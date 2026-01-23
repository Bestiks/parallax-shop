import { createClient } from '../../../../lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient()
    
    await supabase.auth.signOut()
    
    return NextResponse.json({ message: 'Выход успешен' })
    
  } catch (error: any) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
