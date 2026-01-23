'use client'

import { useState, useEffect } from 'react'
import AdminTable from '../../../components/AdminTable'
import { createClient } from '../../../lib/supabase/client'
import { FiPlus, FiRefreshCw, FiSearch, FiUpload } from 'react-icons/fi'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_rub: '',
    category: 'smartphones',
    subcategory: '',
    image_url: '',
    active: true,
  })
  
  const supabase = createClient()

  const categories = [
    { value: 'smartphones', label: 'Смартфоны' },
    { value: 'watches', label: 'Часы' },
    { value: 'laptops', label: 'Ноутбуки' },
    { value: 'computers', label: 'Компьютеры' },
  ]

  const subcategories = {
    smartphones: [
      { value: '', label: 'Не выбрано' },
      { value: 'iphone', label: 'iPhone' },
      { value: 'android', label: 'Android' },
    ],
    watches: [
      { value: '', label: 'Не выбрано' },
      { value: 'smartwatch', label: 'Умные часы' },
      { value: 'classic', label: 'Классические' },
    ],
    laptops: [
      { value: '', label: 'Не выбрано' },
      { value: 'apple', label: 'Apple' },
      { value: 'windows', label: 'Windows' },
      { value: 'gaming', label: 'Игровые' },
    ],
    computers: [
      { value: '', label: 'Не выбрано' },
      { value: 'gaming', label: 'Игровые' },
      { value: 'office', label: 'Офисные' },
      { value: 'workstation', label: 'Рабочие станции' },
    ],
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchTerm, products])

  async function loadProducts() {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()
      
      if (response.ok) {
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function filterProducts() {
    if (!searchTerm.trim()) {
      setFilteredProducts(products)
      return
    }
    
    const term = searchTerm.toLowerCase()
    const filtered = products.filter(product =>
      product.title?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term) ||
      product.subcategory?.toLowerCase().includes(term)
    )
    
    setFilteredProducts(filtered)
  }

  function handleEdit(product: any) {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      description: product.description || '',
      price_rub: product.price_rub.toString(),
      category: product.category,
      subcategory: product.subcategory || '',
      image_url: product.image_url || '',
      active: product.active,
    })
    setShowModal(true)
  }

  async function handleDelete(product: any) {
    if (!confirm('Удалить этот товар?')) return

    try {
      const response = await fetch(`/api/admin/products?id=${product.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadProducts()
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
    }
  }

  async function handleSave() {
    const method = editingProduct ? 'PATCH' : 'POST'
    const url = editingProduct ? '/api/admin/products' : '/api/admin/products'
    
    const payload = editingProduct ? {
      product_id: editingProduct.id,
      updates: {
        ...formData,
        price_rub: parseInt(formData.price_rub),
      }
    } : {
      ...formData,
      price_rub: parseInt(formData.price_rub),
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        setShowModal(false)
        setEditingProduct(null)
        setFormData({
          title: '',
          description: '',
          price_rub: '',
          category: 'smartphones',
          subcategory: '',
          image_url: '',
          active: true,
        })
        loadProducts()
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  const columns = [
    { key: 'title', label: 'Название' },
    { 
      key: 'price_rub', 
      label: 'Цена',
      render: (value: number) => `${value.toLocaleString('ru-RU')} ₽`
    },
    { key: 'category', label: 'Категория' },
    { key: 'subcategory', label: 'Подкатегория' },
    { 
      key: 'active', 
      label: 'Статус',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value ? 'Активен' : 'Неактивен'}
        </span>
      )
    },
    { 
      key: 'created_at', 
      label: 'Дата создания',
      render: (value: string) => new Date(value).toLocaleDateString('ru-RU')
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Управление товарами</h1>
        <div className="flex gap-2">
          <button
            onClick={loadProducts}
            className="flex items-center gap-2 btn-secondary"
          >
            <FiRefreshCw />
            Обновить
          </button>
          <button
            onClick={() => {
              setEditingProduct(null)
              setFormData({
                title: '',
                description: '',
                price_rub: '',
                category: 'smartphones',
                subcategory: '',
                image_url: '',
                active: true,
              })
              setShowModal(true)
            }}
            className="flex items-center gap-2 btn-primary"
          >
            <FiPlus />
            Добавить товар
          </button>
        </div>
      </div>

      {/* Поиск */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по названию или описанию..."
            className="pl-10 input-field"
          />
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <AdminTable
          columns={columns}
          data={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          emptyMessage="Товары не найдены"
        />
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingProduct ? 'Редактирование товара' : 'Добавление товара'}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Название *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Цена, ₽ *
                    </label>
                    <input
                      type="number"
                      value={formData.price_rub}
                      onChange={(e) => setFormData({...formData, price_rub: e.target.value})}
                      className="input-field"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Категория *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({
                        ...formData, 
                        category: e.target.value,
                        subcategory: ''
                      })}
                      className="input-field"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Подкатегория
                    </label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                      className="input-field"
                    >
                      {subcategories[formData.category as keyof typeof subcategories]?.map((subcat) => (
                        <option key={subcat.value} value={subcat.value}>
                          {subcat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Описание
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="input-field h-32 resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL изображения
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        className="input-field"
                        placeholder="/placeholder-1.jpg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Используйте путь к изображению в /public или внешний URL
                    </p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({...formData, active: e.target.checked})}
                      className="mr-2"
                      id="active"
                    />
                    <label htmlFor="active" className="text-sm text-gray-700">
                      Товар активен (виден в каталоге)
                    </label>
                  </div>

                  {editingProduct && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>ID: {editingProduct.id}</p>
                      <p>Создан: {new Date(editingProduct.created_at).toLocaleDateString('ru-RU')}</p>
                      <p>Обновлен: {new Date(editingProduct.updated_at).toLocaleDateString('ru-RU')}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={handleSave}
                  className="flex-1 btn-primary"
                >
                  {editingProduct ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingProduct(null)
                  }}
                  className="flex-1 btn-secondary"
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
