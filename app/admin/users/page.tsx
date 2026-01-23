'use client'

import { useState, useEffect } from 'react'
import AdminTable from '../../../components/AdminTable'
import { createClient } from '../../../lib/supabase/client'
import { FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
    phone: '',
    role: 'user',
    banned: false,
    balance_rub: 0,
  })
  
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  async function loadUsers() {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function filterUsers() {
    if (!searchTerm.trim()) {
      setFilteredUsers(users)
      return
    }
    
    const term = searchTerm.toLowerCase()
    const filtered = users.filter(user =>
      user.username?.toLowerCase().includes(term) ||
      user.full_name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.phone?.toLowerCase().includes(term) ||
      user.public_id.toString().includes(term)
    )
    
    setFilteredUsers(filtered)
  }

  function handleEdit(user: any) {
    setSelectedUser(user)
    setEditForm({
      username: user.username || '',
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role || 'user',
      banned: user.banned || false,
      balance_rub: user.balance_rub || 0,
    })
    setShowEditModal(true)
  }

  async function handleSave() {
    if (!selectedUser) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          updates: editForm,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowEditModal(false)
        loadUsers() // Обновляем список
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error)
    }
  }

  const columns = [
    { key: 'public_id', label: 'ID' },
    { key: 'username', label: 'Имя пользователя' },
    { key: 'full_name', label: 'Полное имя' },
    { key: 'email', label: 'Email' },
    { 
      key: 'balance_rub', 
      label: 'Баланс',
      render: (value: number) => `${value.toLocaleString('ru-RU')} ₽`
    },
    { 
      key: 'role', 
      label: 'Роль',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'admin' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value === 'admin' ? 'Админ' : 'Пользователь'}
        </span>
      )
    },
    { 
      key: 'banned', 
      label: 'Статус',
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {value ? 'Заблокирован' : 'Активен'}
        </span>
      )
    },
    { 
      key: 'created_at', 
      label: 'Дата регистрации',
      render: (value: string) => new Date(value).toLocaleDateString('ru-RU')
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Управление пользователями</h1>
        <button
          onClick={loadUsers}
          className="flex items-center gap-2 btn-secondary"
        >
          <FiRefreshCw />
          Обновить
        </button>
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
            placeholder="Поиск по имени, email, телефону или ID..."
            className="pl-10 input-field"
          />
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <AdminTable
          columns={columns}
          data={filteredUsers}
          onEdit={handleEdit}
          isLoading={isLoading}
          emptyMessage="Пользователи не найдены"
        />
      </div>

      {/* Модальное окно редактирования */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Редактирование пользователя</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Имя пользователя
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Полное имя
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Баланс, ₽
                  </label>
                  <input
                    type="number"
                    value={editForm.balance_rub}
                    onChange={(e) => setEditForm({...editForm, balance_rub: parseInt(e.target.value) || 0})}
                    className="input-field"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.role === 'admin'}
                      onChange={(e) => setEditForm({...editForm, role: e.target.checked ? 'admin' : 'user'})}
                      className="mr-2"
                    />
                    <span>Администратор</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editForm.banned}
                      onChange={(e) => setEditForm({...editForm, banned: e.target.checked})}
                      className="mr-2"
                    />
                    <span>Заблокировать</span>
                  </label>
                </div>

                <div className="text-sm text-gray-600">
                  <p>ID: {selectedUser.public_id}</p>
                  <p>Email: {selectedUser.email}</p>
                  <p>Зарегистрирован: {new Date(selectedUser.created_at).toLocaleDateString('ru-RU')}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 btn-primary"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setShowEditModal(false)}
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
