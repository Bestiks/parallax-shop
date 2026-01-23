'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../lib/supabase/client'
import { FiShoppingCart, FiUser, FiLogOut, FiLogIn, FiMenu, FiX, FiShield } from 'react-icons/fi'
import MobileMenu from './MobileMenu'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser()
    })
    
    return () => subscription.unsubscribe()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      setIsLoggedIn(true)
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profile)
      setIsAdmin(profile?.role === 'admin')
    } else {
      setIsLoggedIn(false)
      setProfile(null)
      setIsAdmin(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-primary-600">
                Parallax Shop
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                <Link 
                  href="/" 
                  className={`hover:text-primary-600 transition-colors ${pathname === '/' ? 'text-primary-600 font-semibold' : ''}`}
                >
                  Главная
                </Link>
                <Link 
                  href="/catalog" 
                  className={`hover:text-primary-600 transition-colors ${pathname === '/catalog' ? 'text-primary-600 font-semibold' : ''}`}
                >
                  Каталог
                </Link>
                
                {isAdmin && (
                  <Link 
                    href="/admin" 
                    className={`hover:text-primary-600 transition-colors flex items-center gap-1 ${pathname.startsWith('/admin') ? 'text-primary-600 font-semibold' : ''}`}
                  >
                    <FiShield />
                    Админ
                  </Link>
                )}
              </nav>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Баланс: <span className="font-semibold">{profile?.balance_rub || 0} ₽</span>
                    </span>
                    <Link 
                      href="/account" 
                      className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <FiUser />
                      <span>Аккаунт</span>
                    </Link>
                    <Link 
                      href="/chat" 
                      className="text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      Чат
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <FiLogOut />
                      <span>Выйти</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/auth/login" 
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    <FiLogIn />
                    <span>Войти</span>
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="btn-primary"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>

            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        profile={profile}
        onLogout={handleLogout}
        currentPath={pathname}
      />
    </>
  )
}
