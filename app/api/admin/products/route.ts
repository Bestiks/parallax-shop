import { createClient } from '../../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
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

    // Получаем все товары
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ products: data || [] })

  } catch (error: any) {
    console.error('Admin products API error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, price_rub, category, subcategory, image_url, active } = body

    if (!title || !price_rub || !category) {
      return NextResponse.json(
        { error: 'Название, цена и категория обязательны' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Проверяем авторизацию и права
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

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

    // Создаем товар
    const { data, error } = await supabase
      .from('products')
      .insert({
        title,
        description,
        price_rub: parseInt(price_rub),
        category,
        subcategory,
        image_url,
        active: active !== undefined ? active : true,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Товар создан',
      product: data 
    })

  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, updates } = body

    if (!product_id || !updates) {
      return NextResponse.json(
        { error: 'product_id и updates обязательны' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Проверяем авторизацию и права
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

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

    // Обновляем товар
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', product_id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Товар обновлен',
      product: data 
    })

  } catch (error: any) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const product_id = searchParams.get('id')

    if (!product_id) {
      return NextResponse.json(
        { error: 'ID товара обязателен' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Проверяем авторизацию и права
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

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

    // Удаляем товар
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product_id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      message: 'Товар удален'
    })

  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

