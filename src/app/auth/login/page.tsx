'use client'

import { useEffect, useRef, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useFormik } from 'formik'
import { z } from 'zod'
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
import { getCredentialsSignInErrorMessage } from '@/lib/credentials-signin-result'
import { Mail, Sparkles } from 'lucide-react'

const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type TLoginFormValues = z.infer<typeof loginFormSchema>
const loginAttemptStorageKey = 'finance-login-attempt'
const loginCredentialsErrorMessage =
  'Incorrect email or password. Please check both fields and try again.'

const validateLoginForm = (values: TLoginFormValues) => {
  const parsedValues = loginFormSchema.safeParse(values)
  if (parsedValues.success) {
    return {}
  }

  const formErrors: Partial<Record<keyof TLoginFormValues, string>> = {}
  for (const issue of parsedValues.error.issues) {
    const fieldName = issue.path[0]
    if (typeof fieldName !== 'string') continue
    if (!formErrors[fieldName as keyof TLoginFormValues]) {
      formErrors[fieldName as keyof TLoginFormValues] = issue.message
    }
  }

  return formErrors
}

export default function LoginPage() {
  const { status } = useSession()
  const [authError, setAuthError] = useState<string | null>(null)
  const [credentialsError, setCredentialsError] = useState<string | null>(null)
  const [callbackUrl, setCallbackUrl] = useState('/dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [demoProgress, setDemoProgress] = useState(0)
  const demoProgressIntervalRef = useRef<number | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { startDemoMode } = useDemoMode()
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

  const getSafeCallbackUrl = (callbackValue: string | null) => {
    if (!callbackValue) {
      return '/dashboard'
    }

    if (callbackValue.startsWith('/')) {
      return callbackValue
    }

    try {
      const parsedCallbackUrl = new URL(callbackValue, window.location.origin)
      if (parsedCallbackUrl.origin !== window.location.origin) {
        return '/dashboard'
      }

      const normalizedCallbackUrl = `${parsedCallbackUrl.pathname}${parsedCallbackUrl.search}${parsedCallbackUrl.hash}`
      return normalizedCallbackUrl.startsWith('/')
        ? normalizedCallbackUrl
        : '/dashboard'
    } catch {
      return '/dashboard'
    }
  }

  useEffect(() => {
    return () => {
      if (demoProgressIntervalRef.current !== null) {
        window.clearInterval(demoProgressIntervalRef.current)
        demoProgressIntervalRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search)
    const authErrorValue = queryParams.get('error')
    const callbackValue = queryParams.get('callbackUrl')
    const safeCallbackUrl = getSafeCallbackUrl(callbackValue)

    if (authErrorValue === 'CredentialsSignin') {
      setAuthError(null)
      setCredentialsError(loginCredentialsErrorMessage)
    } else {
      setAuthError(authErrorValue)
      try {
        const attemptTimestampValue = window.sessionStorage.getItem(
          loginAttemptStorageKey
        )
        if (attemptTimestampValue) {
          const attemptTimestamp = Number.parseInt(attemptTimestampValue, 10)
          if (
            Number.isFinite(attemptTimestamp) &&
            Date.now() - attemptTimestamp < 2 * 60 * 1000 &&
            safeCallbackUrl
          ) {
            setCredentialsError(loginCredentialsErrorMessage)
          }
          window.sessionStorage.removeItem(loginAttemptStorageKey)
        }
      } catch {}
    }

    setCallbackUrl(safeCallbackUrl)
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(callbackUrl)
    }
  }, [callbackUrl, router, status])

  const formik = useFormik<TLoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: validateLoginForm,
    onSubmit: async (values) => {
      setCredentialsError(null)
      setIsLoading(true)

      try {
        try {
          window.sessionStorage.setItem(
            loginAttemptStorageKey,
            Date.now().toString()
          )
        } catch {}

        const result = await signIn('credentials', {
          email: values.email.trim(),
          password: values.password,
          callbackUrl,
          redirect: false,
        })

        const signInErrorMessage = getCredentialsSignInErrorMessage(result)
        if (signInErrorMessage) {
          try {
            window.sessionStorage.removeItem(loginAttemptStorageKey)
          } catch {}
          if (signInErrorMessage === 'Invalid email or password') {
            setCredentialsError(loginCredentialsErrorMessage)
          } else {
            toast({
              title: 'Error',
              description: signInErrorMessage,
              variant: 'destructive',
            })
          }
          return
        }

        try {
          window.sessionStorage.removeItem(loginAttemptStorageKey)
        } catch {}
        router.push(callbackUrl)
      } catch (error) {
        try {
          window.sessionStorage.removeItem(loginAttemptStorageKey)
        } catch {}
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    },
  })

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl })
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
    <div className="min-h-screen min-h-dvh bg-background">
      <Navbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign in</CardTitle>
              <CardDescription>
                Choose your preferred sign in method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {authErrorMessage ? (
                <p className="rounded-md border border-red-500/70 bg-red-950/70 px-3 py-2 text-sm text-red-50">
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
              <form
                onSubmit={formik.handleSubmit}
                className="space-y-4"
                noValidate
              >
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={(event) => {
                      formik.handleChange(event)
                      if (credentialsError) {
                        setCredentialsError(null)
                      }
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your email"
                    required
                    className="mt-1"
                    aria-invalid={Boolean(
                      formik.touched.email && formik.errors.email
                    )}
                    aria-describedby={
                      formik.touched.email && formik.errors.email
                        ? 'login-email-error'
                        : undefined
                    }
                  />
                  {formik.touched.email && formik.errors.email ? (
                    <p
                      id="login-email-error"
                      className="mt-1 text-xs text-red-200"
                    >
                      {formik.errors.email}
                    </p>
                  ) : null}
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
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={(event) => {
                      formik.handleChange(event)
                      if (credentialsError) {
                        setCredentialsError(null)
                      }
                    }}
                    onBlur={formik.handleBlur}
                    placeholder="Enter your password"
                    required
                    className="mt-1"
                    aria-invalid={Boolean(
                      formik.touched.password && formik.errors.password
                    )}
                    aria-describedby={
                      formik.touched.password && formik.errors.password
                        ? 'login-password-error'
                        : undefined
                    }
                  />
                  {formik.touched.password && formik.errors.password ? (
                    <p
                      id="login-password-error"
                      className="mt-1 text-xs text-red-200"
                    >
                      {formik.errors.password}
                    </p>
                  ) : null}
                  <div className="mt-2 text-right">
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                {credentialsError ? (
                  <p
                    className="rounded-md border border-red-500/70 bg-red-950/70 px-3 py-2 text-sm text-red-50"
                    aria-live="polite"
                  >
                    {credentialsError}
                  </p>
                ) : null}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/auth/register"
                    className="text-primary hover:underline"
                  >
                    Sign up
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
