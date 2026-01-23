import { requireUser } from '../../lib/auth/requireUser'
import { ReactNode } from 'react'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  await requireUser()
  return <>{children}</>
}
