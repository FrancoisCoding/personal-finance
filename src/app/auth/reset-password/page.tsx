'use client'

import { FormEvent, Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  getPasswordRequirementStatuses,
  isPasswordPolicyCompliant,
} from '@/lib/password-policy'
import { CheckCircle2, XCircle } from 'lucide-react'

function ResetPasswordPageContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidatingToken, setIsValidatingToken] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')
  const [passwordPolicyError, setPasswordPolicyError] = useState<string | null>(
    null
  )
  const [passwordPolicyDetails, setPasswordPolicyDetails] = useState<string[]>(
    []
  )
  const passwordRequirementStatuses = getPasswordRequirementStatuses(password)
  const hasPasswordRequirementsMet = isPasswordPolicyCompliant(password)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [router, status])

  useEffect(() => {
    const runTokenValidation = async () => {
      if (!token) {
        setIsTokenValid(false)
        setValidationMessage('This password reset link is invalid.')
        setIsValidatingToken(false)
        return
      }

      setIsValidatingToken(true)
      try {
        const response = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(token)}`,
          { method: 'GET' }
        )
        const payload = await response.json().catch(() => ({}))
        if (!payload?.valid) {
          setIsTokenValid(false)
          setValidationMessage(
            'This password reset link is invalid or has expired.'
          )
          return
        }
        setIsTokenValid(true)
        setValidationMessage('')
      } catch (error) {
        setIsTokenValid(false)
        setValidationMessage('Unable to validate this reset link right now.')
      } finally {
        setIsValidatingToken(false)
      }
    }

    void runTokenValidation()
  }, [token])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setPasswordPolicyError(null)
    setPasswordPolicyDetails([])

    if (!hasPasswordRequirementsMet) {
      const unmetRequirements = passwordRequirementStatuses
        .filter((requirement) => !requirement.isMet)
        .map((requirement) => requirement.label)
      setPasswordPolicyError('Password does not meet security requirements.')
      setPasswordPolicyDetails(unmetRequirements)
      toast({
        title: 'Password requirements',
        description:
          'Please satisfy all password requirements before updating your password.',
        variant: 'destructive',
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (Array.isArray(payload?.details)) {
          const normalizedDetails = payload.details.filter(
            (detail: unknown) => typeof detail === 'string'
          )
          if (normalizedDetails.length > 0) {
            setPasswordPolicyError(
              typeof payload?.error === 'string'
                ? payload.error
                : 'Password does not meet security requirements.'
            )
            setPasswordPolicyDetails(normalizedDetails)
          }
        }
        const message =
          typeof payload?.error === 'string'
            ? payload.error
            : 'Unable to reset password right now.'
        throw new Error(message)
      }

      toast({
        title: 'Password updated',
        description:
          typeof payload?.message === 'string'
            ? payload.message
            : 'Your password has been reset successfully.',
      })
      router.push('/auth/login')
    } catch (error) {
      toast({
        title: 'Reset failed',
        description:
          error instanceof Error
            ? error.message
            : 'Unable to reset password right now.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create a new password
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a strong password for your account.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reset password</CardTitle>
              <CardDescription>
                This link expires after one hour and can only be used once.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isValidatingToken ? (
                <p className="text-sm text-muted-foreground">
                  Validating your reset link...
                </p>
              ) : !isTokenValid ? (
                <div className="space-y-3">
                  <p className="rounded-md border border-red-500/70 bg-red-950/70 px-3 py-2 text-sm text-red-50">
                    {validationMessage ||
                      'This password reset link is invalid.'}
                  </p>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Request a new reset link
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-foreground"
                    >
                      New password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        if (passwordPolicyError) {
                          setPasswordPolicyError(null)
                          setPasswordPolicyDetails([])
                        }
                      }}
                      placeholder="Enter a new password"
                      required
                      autoComplete="new-password"
                      className="mt-1"
                    />
                    <div className="mt-2 rounded-md border border-border/80 bg-card/50 p-3">
                      <p className="mb-2 text-xs font-semibold text-foreground">
                        Password requirements
                      </p>
                      <ul className="space-y-1.5">
                        {passwordRequirementStatuses.map((requirement) => (
                          <li
                            key={requirement.key}
                            className="flex items-center gap-2 text-xs"
                          >
                            {requirement.isMet ? (
                              <CheckCircle2
                                className="h-3.5 w-3.5 text-emerald-400"
                                aria-hidden="true"
                              />
                            ) : (
                              <XCircle
                                className="h-3.5 w-3.5 text-red-300"
                                aria-hidden="true"
                              />
                            )}
                            <span
                              className={
                                requirement.isMet
                                  ? 'text-emerald-300'
                                  : 'text-red-200'
                              }
                            >
                              {requirement.label}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {passwordPolicyError ? (
                      <p className="mt-2 rounded-md border border-red-500/70 bg-red-950/70 px-3 py-2 text-xs text-red-50">
                        {passwordPolicyError}
                      </p>
                    ) : null}
                    {passwordPolicyDetails.length > 0 ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-100">
                        {passwordPolicyDetails.map((detail) => (
                          <li key={detail}>{detail}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-foreground"
                    >
                      Confirm new password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm your new password"
                      required
                      autoComplete="new-password"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Updating password...' : 'Update password'}
                  </Button>
                </form>
              )}

              <p className="text-center text-sm text-muted-foreground">
                <Link
                  href="/auth/login"
                  className="text-primary hover:underline"
                >
                  Back to sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Navbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
          >
            <div className="w-full max-w-md space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Loading password reset...
                  </p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      }
    >
      <ResetPasswordPageContent />
    </Suspense>
  )
}
