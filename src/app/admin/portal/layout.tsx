import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  if (!isAdminAuthenticated(cookieStore)) {
    redirect('/admin/login')
  }
  return children
}
