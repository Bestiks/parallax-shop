import { createClient } from '../../../lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const subcategory = searchParams.get('subcategory')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sortBy = searchParams.get('sortBy') || 'price_asc'
    const limit = searchParams.get('limit') || '50'
    const offset = searchParams.get('offset') || '0'

    const supabase = createClient()

    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)

    // Фильтры
    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (subcategory && subcategory !== 'all') {
      query = query.eq('subcategory', subcategory)
    }

    if (minPrice) {
      query = query.gte('price_rub', parseInt(minPrice))
    }

    if (maxPrice) {
      query = query.lte('price_rub', parseInt(maxPrice))
    }

    // Сортировка
    switch (sortBy) {
      case 'price_asc':
        query = query.order('price_rub', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price_rub', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      default:
        query = query.order('price_rub', { ascending: true })
    }

    // Пагинация
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ products: data || [] })

  } catch (error: any) {
    console.error('Products API error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
