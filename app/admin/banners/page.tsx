'use client'

import { useState, useEffect } from 'react'
import AdminTable from '../../../components/AdminTable'
import { createClient } from '../../../lib/supabase/client'
import { FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [filteredBanners, setFilteredBanners] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    sort_order: '0',
    active: true,
  })
  
  const supabase = createClient()

  useEffect(() => {
    loadBanners()
  }, [])

  useEffect(() => {
    filterBanners()
  }, [searchTerm, banners])

  async function loadBanners() {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (!error && data) {
        setBanners(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки баннеров:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function filterBanners() {
    if (!searchTerm.trim()) {
      setFilteredBanners(banners)
      return
    }
    
    const term = searchTerm.toLowerCase()
    const filtered = banners.filter(banner =>
      banner.title?.toLowerCase().includes(term) ||
      banner.subtitle?.toLowerCase().includes(term)
    )
    
    setFilteredBanners(filtered)
  }

  function handleEdit(banner: any) {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      sort_order: banner.sort_order.toString(),
      active: banner.active,
    })
    setShowModal(true)
  }

  async function handleDelete(banner: any) {
    if (!confirm('Удалить этот баннер?')) return

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', banner.id)

      if (!error) {
        loadBanners()
      }
    } catch (error) {
      console.error('Ошибка удаления:', error)
    }
  }

  async function handleSave() {
    const bannerData = {
      ...formData,
      sort_order: parseInt(formData.sort_order) || 0,
    }

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update(bannerData)
          .eq('id', editingBanner.id)

        if (!error) {
          setShowModal(false)
          setEditingBanner(null)
          loadBanners()
        }
      } else {
        const { error } = await supabase
          .from('banners')
          .insert(bannerData)

        if (!error) {
          setShowModal(false)
          setFormData({
            title: '',
            subtitle: '',
            image_url: '',
            link_url: '',
            sort_order: '0',
            active: true,
          })
          loadBanners()
        }
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  const columns = [
    { key: 'title', label: 'Заголовок' },
    { key: 'subtitle', label: 'Подзаголовок' },
    { 
      key: 'image_url', 
      label: 'Изображение',
      render: (value: string) => (
        <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden">
          {value && (
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${value})` }}
            />
          )}
        </div>
      )
    },
    { key: 'link_url', label: 'Ссылка' },
    { key: 'sort_order', label: 'Порядок' },
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
        <h1 className="text-3xl font-bold">Управление баннерами</h1>
        <div className="flex gap-2">
          <button
            onClick={loadBanners}
            className="flex items-center gap-2 btn-secondary"
          >
            <FiRefreshCw />
            Обновить
          </button>
          <button
            onClick={() => {
              setEditingBanner(null)
              setFormData({
                title: '',
                subtitle: '',
                image_url: '',
                link_url: '',
                sort_order: '0',
                active: true,
              })
              setShowModal(true)
            }}
            className="flex items-center gap-2 btn-primary"
          >
            <FiPlus />
            Добавить баннер
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
            placeholder="Поиск по заголовку..."
            className="pl-10 input-field"
          />
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <AdminTable
          columns={columns}
          data={filteredBanners}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={isLoading}
          emptyMessage="Баннеры не найдены"
        />
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingBanner ? 'Редактирование баннера' : 'Добавление баннера'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Заголовок *
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
                    Подзаголовок
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL изображения *
                  </label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    className="input-field"
                    placeholder="/placeholder-1.jpg"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Используйте путь к изображению в /public
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ссылка
                  </label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                    className="input-field"
                    placeholder="/catalog?category=smartphones"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Порядок сортировки
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: e.target.value})}
                    className="input-field"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Чем меньше число, тем выше баннер в списке
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
                    Баннер активен (виден на сайте)
                  </label>
                </div>

                {editingBanner && (
                  <div className="text-sm text-gray-600">
                    <p>Создан: {new Date(editingBanner.created_at).toLocaleDateString('ru-RU')}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-6 mt-6 border-t">
                  <button
                    onClick={handleSave}
                    className="flex-1 btn-primary"
                  >
                    {editingBanner ? 'Сохранить' : 'Создать'}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false)
                      setEditingBanner(null)
                    }}
                    className="flex-1 btn-secondary"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
