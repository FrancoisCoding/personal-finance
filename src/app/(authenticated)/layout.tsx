'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardShell } from '@/components/dashboard-shell'
import { AutoCategorizeModal } from '@/components/auto-categorize-modal'
import NotificationTriggers from '@/components/notification-triggers'
import { demoSession } from '@/lib/demo-mode'
import { useDemoMode } from '@/hooks/use-demo-mode'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDemoMode } = useDemoMode()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (status === 'loading') return

    if (!session && !isDemoMode) {
      router.push('/auth/login')
      return
    }
  }, [session, status, router, isDemoMode])

  useEffect(() => {
    if (isDemoMode) {
      queryClient.clear()
    }
  }, [isDemoMode, queryClient])

  if (status === 'loading' && !isDemoMode) {
    return (
      <DashboardShell session={session}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!session && !isDemoMode) {
    return null // Will redirect to login
  }

  return (
    <DashboardShell session={session ?? (isDemoMode ? demoSession : null)}>
      <AutoCategorizeModal />
      <NotificationTriggers />
      {children}
    </DashboardShell>
  )
}
