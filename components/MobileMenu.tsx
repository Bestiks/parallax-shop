import Link from 'next/link'
import { FiUser, FiLogOut, FiLogIn, FiHome, FiShoppingBag, FiShield, FiMessageSquare } from 'react-icons/fi'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  isLoggedIn: boolean
  isAdmin: boolean
  profile: any
  onLogout: () => void
  currentPath: string
}

export default function MobileMenu({ 
  isOpen, 
  onClose, 
  isLoggedIn, 
  isAdmin, 
  profile, 
  onLogout, 
  currentPath 
}: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-primary-600">Меню</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
          
          <nav className="space-y-4">
            <Link 
              href="/" 
              className={`flex items-center space-x-2 p-2 rounded ${currentPath === '/' ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={onClose}
            >
              <FiHome />
              <span>Главная</span>
            </Link>
            
            <Link 
              href="/catalog" 
              className={`flex items-center space-x-2 p-2 rounded ${currentPath === '/catalog' ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={onClose}
            >
              <FiShoppingBag />
              <span>Каталог</span>
            </Link>
            
            {isAdmin && (
              <Link 
                href="/admin" 
                className={`flex items-center space-x-2 p-2 rounded ${currentPath.startsWith('/admin') ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={onClose}
              >
                <FiShield />
                <span>Админ панель</span>
              </Link>
            )}
            
            {isLoggedIn ? (
              <>
                <div className="pt-4 border-t">
                  <div className="p-2 text-sm text-gray-600">
                    <div>Баланс: <span className="font-semibold">{profile?.balance_rub || 0} ₽</span></div>
                    <div className="truncate">@{profile?.username}</div>
                  </div>
                  
                  <Link 
                    href="/account" 
                    className={`flex items-center space-x-2 p-2 rounded ${currentPath === '/account' ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={onClose}
                  >
                    <FiUser />
                    <span>Аккаунт</span>
                  </Link>
                  
                  <Link 
                    href="/chat" 
                    className={`flex items-center space-x-2 p-2 rounded ${currentPath === '/chat' ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={onClose}
                  >
                    <FiMessageSquare />
                    <span>Чат с поддержкой</span>
                  </Link>
                  
                  <button
                    onClick={() => {
                      onLogout()
                      onClose()
                    }}
                    className="flex items-center space-x-2 p-2 rounded text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FiLogOut />
                    <span>Выйти</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 border-t space-y-2">
                <Link 
                  href="/auth/login" 
                  className="flex items-center space-x-2 p-2 rounded text-gray-700 hover:bg-gray-100"
                  onClick={onClose}
                >
                  <FiLogIn />
                  <span>Войти</span>
                </Link>
                
                <Link 
                  href="/auth/register" 
                  className="btn-primary block text-center"
                  onClick={onClose}
                >
                  Регистрация
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </div>
  )
}
