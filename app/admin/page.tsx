import { createClient } from '../../lib/supabase/server'
import { 
  FiUsers, FiShoppingBag, FiCreditCard, 
  FiMessageSquare, FiTrendingUp, FiDollarSign 
} from 'react-icons/fi'

export default async function AdminDashboard() {
  const supabase = createClient()

  // Получаем статистику
  const [
    usersCount,
    productsCount,
    activeTopups,
    totalRevenue,
    activeChats,
    newOrders
  ] = await Promise.all([
    // Количество пользователей
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => count || 0),
    
    // Количество товаров
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => count || 0),
    
    // Активные заявки на пополнение
    supabase
      .from('topup_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => count || 0),
    
    // Общая выручка (сумма завершенных пополнений)
    supabase
      .from('balance_transactions')
      .select('amount_rub')
      .eq('type', 'topup')
      .then(({ data }) => data?.reduce((sum, t) => sum + t.amount_rub, 0) || 0),
    
    // Активные чаты (с непрочитанными сообщениями)
    supabase
      .from('chat_messages')
      .select('thread_id')
      .eq('read', false)
      .then(({ data }) => new Set(data?.map(m => m.thread_id)).size),
    
    // Новые заказы (заглушка для будущей реализации)
    0
  ])

  const stats = [
    {
      title: 'Пользователи',
      value: usersCount,
      icon: FiUsers,
      color: 'bg-blue-100 text-blue-600',
      change: '+12%',
    },
    {
      title: 'Товары',
      value: productsCount,
      icon: FiShoppingBag,
      color: 'bg-green-100 text-green-600',
      change: '+5%',
    },
    {
      title: 'Заявки на пополнение',
      value: activeTopups,
      icon: FiCreditCard,
      color: 'bg-yellow-100 text-yellow-600',
      change: `${activeTopups > 0 ? 'Требуют внимания' : 'Все обработаны'}`,
    },
    {
      title: 'Выручка',
      value: `${totalRevenue.toLocaleString('ru-RU')} ₽`,
      icon: FiDollarSign,
      color: 'bg-purple-100 text-purple-600',
      change: '+23%',
    },
    {
      title: 'Активные чаты',
      value: activeChats,
      icon: FiMessageSquare,
      color: 'bg-red-100 text-red-600',
      change: `${activeChats > 0 ? 'Требуют ответа' : 'Все отвечены'}`,
    },
    {
      title: 'Новые заказы',
      value: newOrders,
      icon: FiTrendingUp,
      color: 'bg-indigo-100 text-indigo-600',
      change: 'Ожидают обработки',
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Админ панель</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Быстрые действия */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Быстрые действия</h2>
          <div className="space-y-4">
            <a 
              href="/admin/topups" 
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Обработать заявки на пополнение</h3>
                  <p className="text-sm text-gray-600">
                    {activeTopups} заявок ожидают обработки
                  </p>
                </div>
                <FiCreditCard className="text-gray-400" />
              </div>
            </a>
            
            <a 
              href="/admin/chats" 
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ответить в чатах</h3>
                  <p className="text-sm text-gray-600">
                    {activeChats} чатов с непрочитанными сообщениями
                  </p>
                </div>
                <FiMessageSquare className="text-gray-400" />
              </div>
            </a>
            
            <a 
              href="/admin/products" 
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Управление товарами</h3>
                  <p className="text-sm text-gray-600">
                    Добавить или изменить товары в каталоге
                  </p>
                </div>
                <FiShoppingBag className="text-gray-400" />
              </div>
            </a>
            
            <a 
              href="/admin/users" 
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Управление пользователями</h3>
                  <p className="text-sm text-gray-600">
                    Изменить баланс, роли, заблокировать пользователей
                  </p>
                </div>
                <FiUsers className="text-gray-400" />
              </div>
            </a>
          </div>
        </div>

        {/* Последние действия */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-6">Последние действия</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FiUsers className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Новый пользователь зарегистрировался</p>
                <p className="text-sm text-gray-600">5 минут назад</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FiCreditCard className="text-green-600" />
              </div>
              <div>
                <p className="font-medium">Заявка на пополнение создана</p>
                <p className="text-sm text-gray-600">15 минут назад</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <FiMessageSquare className="text-yellow-600" />
              </div>
              <div>
                <p className="font-medium">Новое сообщение в чате</p>
                <p className="text-sm text-gray-600">30 минут назад</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

