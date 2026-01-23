'use client'

import { useState } from 'react'
import { FiEdit2, FiTrash2, FiEye, FiCheck, FiX } from 'react-icons/fi'

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface AdminTableProps {
  columns: Column[]
  data: any[]
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onView?: (row: any) => void
  onApprove?: (row: any) => void
  onReject?: (row: any) => void
  isLoading?: boolean
  emptyMessage?: string
}

export default function AdminTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  onApprove,
  onReject,
  isLoading = false,
  emptyMessage = 'Нет данных'
}: AdminTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(data.length / itemsPerPage)

  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined) return '-'
    
    if (typeof value === 'boolean') {
      return value ? 'Да' : 'Нет'
    }
    
    if (typeof value === 'number' && key.includes('rub')) {
      return `${value.toLocaleString('ru-RU')} ₽`
    }
    
    if (key.includes('created_at') || key.includes('updated_at')) {
      return new Date(value).toLocaleString('ru-RU')
    }
    
    if (typeof value === 'string' && value.length > 50) {
      return `${value.substring(0, 50)}...`
    }
    
    return value
  }

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete || onView || onApprove || onReject) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                {columns.map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
                {(onEdit || onDelete || onView || onApprove || onReject) && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete || onView || onApprove || onReject) && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : formatValue(col.key, row[col.key])}
                  </td>
                ))}
                
                {(onEdit || onDelete || onView || onApprove || onReject) && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(row)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Просмотр"
                        >
                          <FiEye />
                        </button>
                      )}
                      
                      {onEdit && (
                        <button
                          onClick={() => onEdit(row)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Редактировать"
                        >
                          <FiEdit2 />
                        </button>
                      )}
                      
                      {onApprove && (
                        <button
                          onClick={() => onApprove(row)}
                          className="text-green-600 hover:text-green-900"
                          title="Подтвердить"
                        >
                          <FiCheck />
                        </button>
                      )}
                      
                      {onReject && (
                        <button
                          onClick={() => onReject(row)}
                          className="text-red-600 hover:text-red-900"
                          title="Отклонить"
                        >
                          <FiX />
                        </button>
                      )}
                      
                      {onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="text-red-600 hover:text-red-900"
                          title="Удалить"
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Назад
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Вперед
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Показано <span className="font-medium">{indexOfFirstItem + 1}</span> -{' '}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, data.length)}
                </span>{' '}
                из <span className="font-medium">{data.length}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ←
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  →
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
