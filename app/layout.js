import './globals.css'
import Shell from '@/components/Shell'
import { AuthProvider } from '@/components/AuthProvider'

export const metadata = { title: 'Parallax Shop', description: 'Parallax Shop' }

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  )
}
