import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export default async function AdminRootPage() {
  const cookieStore = cookies()
  if (isAdminAuthenticated(cookieStore)) {
    redirect('/admin/portal')
  }
  redirect('/admin/login')
}
