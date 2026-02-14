'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai'
import { useQueryClient } from '@tanstack/react-query'
import { DashboardShell } from '@/components/dashboard-shell'
import { AutoCategorizeModal } from '@/components/auto-categorize-modal'
import NotificationTriggers from '@/components/notification-triggers'
import DemoWalkthrough from '@/components/demo-walkthrough'
import { demoSession } from '@/lib/demo-mode'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { demoWalkthroughOpenAtom } from '@/store/ui-atoms'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { isDemoMode } = useDemoMode()
  const queryClient = useQueryClient()
  const [isClientReady, setIsClientReady] = useState(false)
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useAtom(
    demoWalkthroughOpenAtom
  )
  const isDemoReady = isClientReady && isDemoMode
  const effectiveSession = session ?? (isDemoReady ? demoSession : null)

  useEffect(() => {
    setIsClientReady(true)
  }, [])

  useEffect(() => {
    if (!isClientReady) return
    if (status === 'loading') return

    if (!session && !isDemoReady) {
      router.push('/auth/login')
      return
    }
  }, [session, status, router, isDemoReady, isClientReady])

  useEffect(() => {
    if (!isClientReady) return
    if (isDemoReady) {
      queryClient.clear()
    }
  }, [isDemoReady, queryClient, isClientReady])

  useEffect(() => {
    if (!isClientReady) return
    if (!isDemoReady) {
      setIsWalkthroughOpen(false)
      return
    }
    try {
      const stored = localStorage.getItem('finance-demo-walkthrough')
      if (!stored) {
        setIsWalkthroughOpen(true)
      }
    } catch (error) {
      setIsWalkthroughOpen(true)
    }
  }, [isClientReady, isDemoReady, setIsWalkthroughOpen])

  if (!isClientReady || (status === 'loading' && !isDemoReady)) {
    return (
      <DashboardShell session={effectiveSession}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!session && !isDemoReady) {
    return null // Will redirect to login
  }

  return (
    <DashboardShell session={effectiveSession}>
      <AutoCategorizeModal />
      <NotificationTriggers />
      <DemoWalkthrough
        isOpen={isDemoReady && isWalkthroughOpen}
        onClose={() => {
          setIsWalkthroughOpen(false)
          try {
            const stored = localStorage.getItem('finance-demo-walkthrough')
            if (!stored) {
              localStorage.setItem('finance-demo-walkthrough', 'skipped')
            }
          } catch (error) {
            void error
          }
        }}
        onComplete={() => {
          try {
            localStorage.setItem('finance-demo-walkthrough', 'done')
          } catch (error) {
            void error
          }
          setIsWalkthroughOpen(false)
        }}
      />
      {children}
    </DashboardShell>
  )
}
