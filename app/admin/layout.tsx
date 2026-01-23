import { requireAdmin } from '../../lib/auth/requireAdmin'
import { ReactNode } from 'react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin()
  return <>{children}</>
}
