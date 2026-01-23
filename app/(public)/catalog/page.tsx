'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import ProductCard from '../../../components/ProductCard'
import Skeleton from '../../../components/Skeleton'
import { FiMonitor, FiSmartphone, FiWatch, FiCpu } from "react-icons/fi";

const categories = [
  { value: 'all', label: 'Все категории' },
  { value: 'smartphones', label: 'Смартфоны' },
  { value: 'watches', label: 'Часы' },
  { value: 'laptops', label: 'Ноутбуки' },
  { value: 'computers', label: 'Компьютеры' },
]

const subcategories = {
  smartphones: [
    { value: 'all', label: 'Все смартфоны' },
    { value: 'iphone', label: 'iPhone' },
    { value: 'android', label: 'Android' },
  ],
  watches: [
    { value: 'all', label: 'Все часы' },
    { value: 'smartwatch', label: 'Умные часы' },
    { value: 'classic', label: 'Классические' },
  ],
  laptops: [
    { value: 'all', label: 'Все ноутбуки' },
    { value: 'apple', label: 'Apple' },
    { value: 'windows', label: 'Windows' },
    { value: 'gaming', label: 'Игровые' },
  ],
  computers: [
    { value: 'all', label: 'Все компьютеры' },
    { value: 'gaming', label: 'Игровые' },
    { value: 'office', label: 'Офисные' },
    { value: 'workstation', label: 'Рабочие станции' },
  ],
}

const sortOptions = [
  { value: 'price_asc', label: 'Цена по возрастанию', icon: FiSortAsc },
  { value: 'price_desc', label: 'Цена по убыванию', icon: FiSortDesc },
  { value: 'newest', label: 'Сначала новые' },
  { value: 'popular', label: 'Популярные' },
]

export default function CatalogPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  )
  const [selectedSubcategory, setSelectedSubcategory] = useState('all')
  const [selectedSort, setSelectedSort] = useState('price_asc')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 500000 })
  const [showFilters, setShowFilters] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, selectedSubcategory, selectedSort, priceRange])

  async function loadProducts() {
    setIsLoading(true)
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('active', true)

    // Фильтр по категории
    if (selectedCategory !== 'all') {
      query = query.eq('category', selectedCategory)
    }

    // Фильтр по подкатегории
    if (selectedSubcategory !== 'all') {
      query = query.eq('subcategory', selectedSubcategory)
    }

    // Фильтр по цене
    query = query.gte('price_rub', priceRange.min)
    query = query.lte('price_rub', priceRange.max)

    // Сортировка
    switch (selectedSort) {
      case 'price_asc':
        query = query.order('price_rub', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price_rub', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'popular':
        // Для популярности можно добавить поле просмотров или продаж
        query = query.order('created_at', { ascending: false })
        break
    }

    const { data, error } = await query

    if (!error && data) {
      setProducts(data)
    }
    
    setIsLoading(false)
  }

  const currentSubcategories = 
    subcategories[selectedCategory as keyof typeof subcategories] || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Каталог товаров</h1>
        <p className="text-gray-600">
          Выберите из {products.length} товаров в нашем каталоге
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Фильтры */}
        <div className="lg:w-1/4">
          <div className="lg:sticky lg:top-24">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FiFilter />
                  Фильтры
                </h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-primary-600"
                >
                  {showFilters ? 'Скрыть' : 'Показать'}
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Категория */}
                <div>
                  <h3 className="font-medium mb-3">Категория</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.value} className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value={category.value}
                          checked={selectedCategory === category.value}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value)
                            setSelectedSubcategory('all')
                          }}
                          className="mr-2"
                        />
                        <span>{category.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Подкатегория */}
                {selectedCategory !== 'all' && currentSubcategories.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Подкатегория</h3>
                    <div className="space-y-2">
                      {currentSubcategories.map((subcat) => (
                        <label key={subcat.value} className="flex items-center">
                          <input
                            type="radio"
                            name="subcategory"
                            value={subcat.value}
                            checked={selectedSubcategory === subcat.value}
                            onChange={(e) => setSelectedSubcategory(e.target.value)}
                            className="mr-2"
                          />
                          <span>{subcat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Цена */}
                <div>
                  <h3 className="font-medium mb-3">Цена, ₽</h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div>
                        <label className="text-sm text-gray-600">От</label>
                        <input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({
                            ...prev,
                            min: parseInt(e.target.value) || 0
                          }))}
                          className="input-field"
                          min="0"
                          max={priceRange.max}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">До</label>
                        <input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({
                            ...prev,
                            max: parseInt(e.target.value) || 500000
                          }))}
                          className="input-field"
                          min={priceRange.min}
                          max="1000000"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500000"
                      step="10000"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({
                        ...prev,
                        max: parseInt(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedSubcategory('all')
                    setPriceRange({ min: 0, max: 500000 })
                  }}
                  className="w-full btn-secondary"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Товары */}
        <div className="lg:w-3/4">
          {/* Сортировка */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-gray-600">
                Найдено <span className="font-semibold">{products.length}</span> товаров
              </div>
              
              <div className="flex items-center gap-4">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="input-field sm:w-auto"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Список товаров */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton type="card" />
                  <div className="p-4">
                    <Skeleton type="text" count={2} />
                    <div className="mt-4">
                      <Skeleton type="text" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500 mb-4">Товары по выбранным фильтрам не найдены</p>
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedSubcategory('all')
                  setPriceRange({ min: 0, max: 500000 })
                }}
                className="btn-primary"
              >
                Сбросить фильтры
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
