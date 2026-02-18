'use client'

import { useEffect, useRef, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Navbar } from '@/components/navbar'
import { useToast } from '@/hooks/use-toast'
import { useDemoMode } from '@/hooks/use-demo-mode'
import { Mail, Sparkles } from 'lucide-react'

export default function RegisterPage() {
  const { status } = useSession()
  const searchParams = useSearchParams()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [demoProgress, setDemoProgress] = useState(0)
  const demoProgressIntervalRef = useRef<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { startDemoMode } = useDemoMode()
  const authError = searchParams.get('error')
  const authErrorMessage =
    authError === 'OAuthAccountNotLinked'
      ? 'This email is linked to a different sign-in method.'
      : authError === 'AccessDenied'
        ? 'Access was denied. Please try another account.'
        : authError === 'Configuration'
          ? 'Authentication is misconfigured. Contact support.'
          : authError
            ? 'Sign in failed. Please try again.'
            : null

  useEffect(() => {
    return () => {
      if (demoProgressIntervalRef.current !== null) {
        window.clearInterval(demoProgressIntervalRef.current)
        demoProgressIntervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [router, status])

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      setIsLoading(false)
      return
    }

    try {
      // In a real app, you would make an API call to register the user
      // For now, we'll simulate registration and redirect to login
      toast({
        title: 'Success',
        description: 'Account created successfully! Please sign in.',
      })
      router.push('/auth/login')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/dashboard' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign in with ' + provider,
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  const handleDemoSignIn = () => {
    if (isLoading) return
    setIsDemoLoading(true)
    setDemoProgress(12)
    if (demoProgressIntervalRef.current !== null) {
      window.clearInterval(demoProgressIntervalRef.current)
    }
    demoProgressIntervalRef.current = window.setInterval(() => {
      setDemoProgress((current) => {
        if (current >= 90) return current
        const next =
          current < 40 ? current + 8 : current < 70 ? current + 5 : current + 2
        return Math.min(90, next)
      })
    }, 220)

    try {
      localStorage.removeItem('finance-demo-walkthrough')
      localStorage.removeItem('finance-demo-loading')
      localStorage.setItem('finance-demo-loading', '1')
    } catch (error) {
      void error
    }

    startDemoMode()
    window.setTimeout(() => {
      setDemoProgress(100)
      router.push('/dashboard?demo=1')
    }, 420)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Start your journey to financial freedom
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign up</CardTitle>
              <CardDescription>
                Choose your preferred sign up method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authErrorMessage ? (
                <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                  {authErrorMessage}
                </p>
              ) : null}
              <Button
                variant="outline"
                className={
                  'min-h-12 w-full justify-between gap-3 border-emerald-500/30 bg-emerald-500/5 ' +
                  'px-3 py-2 text-emerald-700 transition hover:border-emerald-500/50 ' +
                  'hover:bg-emerald-500/10 disabled:opacity-60 dark:text-emerald-200'
                }
                onClick={handleDemoSignIn}
                disabled={isLoading}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 text-left">
                    <span className="block text-sm font-semibold">
                      Try the live demo
                    </span>
                    <span className="block text-xs text-emerald-700/70 dark:text-emerald-200/70">
                      Explore with sample data
                    </span>
                  </span>
                </span>
                <span className="hidden text-xs text-emerald-700/70 dark:text-emerald-200/70 sm:inline">
                  No signup
                </span>
              </Button>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={isLoading}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Email Form */}
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-foreground"
                  >
                    Full name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-foreground"
                  >
                    Confirm password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    className="mt-1"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isDemoLoading}>
        <DialogContent className="max-w-[calc(100vw-1.5rem)] sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Preparing demo workspace</DialogTitle>
            <DialogDescription>
              Loading curated data and analytics so you can explore instantly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Initializing demo session</span>
              <span>{demoProgress}%</span>
            </div>
            <Progress value={demoProgress} className="h-2" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
