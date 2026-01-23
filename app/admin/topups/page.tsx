'use client'

import { useState, useEffect } from 'react'
import AdminTable from '../../../components/AdminTable'
import { createClient } from '../../../lib/supabase/client'
import { FiRefreshCw, FiSearch, FiCheck, FiX, FiEye } from 'react-icons/fi'

export default function AdminTopupsPage() {
  const [topups, setTopups] = useState<any[]>([])
  const [filteredTopups, setFilteredTopups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)
  
  const supabase = createClient()

  const statusOptions = [
    { value: 'all', label: 'Все статусы' },
    { value: 'pending', label: 'Ожидание' },
    { value: 'processing', label: 'В обработке' },
    { value: 'completed', label: 'Завершено' },
    { value: 'rejected', label: 'Отклонено' },
  ]

  useEffect(() => {
    loadTopups()
  }, [])

  useEffect(() => {
    filterTopups()
  }, [searchTerm, selectedStatus, topups])

  async function loadTopups() {
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('topup_requests')
        .select(`
          *,
          profiles (
            username,
            full_name,
            public_id
          )
        `)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setTopups(data)
      }
    } catch (error) {
      console.error('Ошибка загрузки заявок:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function filterTopups() {
    let filtered = topups

    // Фильтр по статусу
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(topup => topup.status === selectedStatus)
    }

    // Фильтр по поиску
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(topup =>
        topup.id.toLowerCase().includes(term) ||
        topup.profiles?.username?.toLowerCase().includes(term) ||
        topup.profiles?.full_name?.toLowerCase().includes(term) ||
        topup.amount_rub.toString().includes(term)
      )
    }

    setFilteredTopups(filtered)
  }

  async function handleApprove(topup: any) {
    if (!confirm(`Подтвердить пополнение на ${topup.amount_rub} ₽?`)) return

    try {
      // Используем функцию Supabase для подтверждения пополнения
      const { data, error } = await supabase.rpc('complete_topup', {
        request_id: topup.id,
        admin_id: (await supabase.auth.getUser()).data.user?.id
      })

      if (!error) {
        loadTopups()
      }
    } catch (error) {
      console.error('Ошибка подтверждения:', error)
    }
  }

  async function handleReject(topup: any) {
    if (!confirm(`Отклонить заявку на ${topup.amount_rub} ₽?`)) return

    try {
      const { error } = await supabase
        .from('topup_requests')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
          admin_notes: 'Отклонено администратором'
        })
        .eq('id', topup.id)

      if (!error) {
        loadTopups()
      }
    } catch (error) {
      console.error('Ошибка отклонения:', error)
    }
  }

  function viewReceipt(url: string) {
    setSelectedReceipt(url)
    setShowReceiptModal(true)
  }

  const columns = [
    { 
      key: 'id', 
      label: 'ID заявки',
      render: (value: string) => value.substring(0, 8) + '...'
    },
    { 
      key: 'profiles.username', 
      label: 'Пользователь',
      render: (value: any, row: any) => (
        <div>
          <div className="font-medium">{row.profiles?.username}</div>
          <div className="text-xs text-gray-500">ID: {row.profiles?.public_id}</div>
        </div>
      )
    },
    { 
      key: 'amount_rub', 
      label: 'Сумма',
      render: (value: number) => `${value.toLocaleString('ru-RU')} ₽`
    },
    { 
      key: 'status', 
      label: 'Статус',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'completed' ? 'bg-green-100 text-green-800' :
          value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          value === 'processing' ? 'bg-blue-100 text-blue-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value === 'completed' ? 'Завершено' :
           value === 'pending' ? 'Ожидание' :
           value === 'processing' ? 'В обработке' :
           'Отклонено'}
        </span>
      )
    },
    { 
      key: 'receipt_url', 
      label: 'Чек',
      render: (value: string) => value ? (
        <button
          onClick={() => viewReceipt(value)}
          className="text-primary-600 hover:text-primary-700 text-sm"
        >
          Просмотреть
        </button>
      ) : 'Нет'
    },
    { 
      key: 'created_at', 
      label: 'Дата создания',
      render: (value: string) => new Date(value).toLocaleDateString('ru-RU')
    },
    { 
      key: 'updated_at', 
      label: 'Последнее обновление',
      render: (value: string) => new Date(value).toLocaleDateString('ru-RU')
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Заявки на пополнение</h1>
        <button
          onClick={loadTopups}
          className="flex items-center gap-2 btn-secondary"
        >
          <FiRefreshCw />
          Обновить
        </button>
      </div>

      {/* Фильтры */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Поиск по ID, имени пользователя или сумме..."
            className="pl-10 input-field"
          />
        </div>

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Всего заявок</div>
          <div className="text-2xl font-bold">{topups.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Ожидают</div>
          <div className="text-2xl font-bold text-yellow-600">
            {topups.filter(t => t.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">В обработке</div>
          <div className="text-2xl font-bold text-blue-600">
            {topups.filter(t => t.status === 'processing').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Завершено</div>
          <div className="text-2xl font-bold text-green-600">
            {topups.filter(t => t.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <AdminTable
          columns={columns}
          data={filteredTopups}
          onView={(row) => viewReceipt(row.receipt_url)}
          onApprove={(row) => row.status === 'processing' && handleApprove(row)}
          onReject={(row) => (row.status === 'pending' || row.status === 'processing') && handleReject(row)}
          isLoading={isLoading}
          emptyMessage="Заявки не найдены"
        />
      </div>

      {/* Модальное окно просмотра чека */}
      {showReceiptModal && selectedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Просмотр чека</h2>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="flex flex-col items-center">
                {selectedReceipt.endsWith('.pdf') ? (
                  <iframe
                    src={selectedReceipt}
                    className="w-full h-[60vh] border rounded"
                    title="PDF чек"
                  />
                ) : (
                  <img
                    src={selectedReceipt}
                    alt="Чек"
                    className="max-w-full max-h-[60vh] object-contain rounded"
                  />
                )}
                
                <div className="mt-6">
                  <a
                    href={selectedReceipt}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Открыть в новой вкладке
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
