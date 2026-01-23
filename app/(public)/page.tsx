import { createClient } from '../../lib/supabase/server'
import BannerCarousel from '../../components/BannerCarousel'
import ProductCard from '../../components/ProductCard'
import Link from 'next/link'
import { FiSmartphone, FiWatch, FiLaptop, FiMonitor } from 'react-icons/fi'

export default async function HomePage() {
  const supabase = createClient()
  
  // Получаем активные баннеры
  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .eq('active', true)
    .order('sort_order')
    .limit(5)
  
  // Получаем активные товары (ограниченное количество для главной)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('active', true)
    .order('price_rub')
    .limit(8)
  
  const categories = [
    {
      name: 'Смартфоны',
      icon: FiSmartphone,
      href: '/catalog?category=smartphones',
      count: products?.filter(p => p.category === 'smartphones').length || 0
    },
    {
      name: 'Часы',
      icon: FiWatch,
      href: '/catalog?category=watches',
      count: products?.filter(p => p.category === 'watches').length || 0
    },
    {
      name: 'Ноутбуки',
      icon: FiLaptop,
      href: '/catalog?category=laptops',
      count: products?.filter(p => p.category === 'laptops').length || 0
    },
    {
      name: 'Компьютеры',
      icon: FiMonitor,
      href: '/catalog?category=computers',
      count: products?.filter(p => p.category === 'computers').length || 0
    }
  ]

  return (
    <div className="space-y-12">
      {/* Баннеры */}
      {banners && banners.length > 0 && (
        <section>
          <BannerCarousel banners={banners} />
        </section>
      )}

      {/* Категории */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Категории товаров</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4 group-hover:bg-primary-200 transition-colors">
                <category.icon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
              <p className="text-gray-600">{category.count} товаров</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Популярные товары */}
      <section>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Популярные товары</h2>
          <Link 
            href="/catalog" 
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Смотреть все →
          </Link>
        </div>
        
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Нет товаров в каталоге</p>
          </div>
        )}
      </section>

      {/* Преимущества */}
      <section className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-8 text-center">Почему выбирают нас</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <span className="text-green-600 font-bold text-xl">✓</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Гарантия качества</h3>
            <p className="text-gray-600">Все товары проходят проверку перед отправкой</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <span className="text-blue-600 font-bold text-xl">🚚</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Быстрая доставка</h3>
            <p className="text-gray-600">Доставка по всей России за 2-7 дней</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <span className="text-purple-600 font-bold text-xl">🛡️</span>
            </div>
            <h3 className="font-semibold text-lg mb-2">Поддержка 24/7</h3>
            <p className="text-gray-600">Всегда готовы помочь с выбором и решить проблемы</p>
          </div>
        </div>
      </section>
    </div>
  )
}
