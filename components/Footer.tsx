import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Parallax Shop</h3>
            <p className="text-gray-300">
              Лучший интернет-магазин электроники. Качество, надежность, сервис.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-gray-300 hover:text-white transition-colors">
                  Каталог
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-gray-300 hover:text-white transition-colors">
                  Личный кабинет
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Юридическая информация</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy" className="text-gray-300 hover:text-white transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-gray-300 hover:text-white transition-colors">
                  Условия использования
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Parallax Shop. Все права защищены.</p>
        </div>
      </div>
    </footer>
  )
}
