'use client'

import { type FormEvent, useState } from 'react'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface IContactFormState {
  name: string
  email: string
  subject: string
  message: string
}

const defaultFormState: IContactFormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
}

export function ContactForm() {
  const { toast } = useToast()
  const [formState, setFormState] =
    useState<IContactFormState>(defaultFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const handleFieldChange = <TKey extends keyof IContactFormState>(
    field: TKey,
    value: IContactFormState[TKey]
  ) => {
    setFormState((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setStatusMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        const errorMessage =
          typeof payload?.error === 'string'
            ? payload.error
            : 'Unable to submit your message.'
        throw new Error(errorMessage)
      }

      setFormState(defaultFormState)
      const successMessage =
        typeof payload?.message === 'string'
          ? payload.message
          : 'Message sent successfully.'
      setStatusMessage(successMessage)
      toast({
        title: 'Message sent',
        description: successMessage,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to submit your message.'
      setStatusMessage(message)
      toast({
        title: 'Message failed',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-border/60 bg-card/95">
      <CardHeader>
        <CardTitle>Contact support</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                autoComplete="name"
                placeholder="Your name"
                value={formState.name}
                onChange={(event) =>
                  handleFieldChange('name', event.target.value)
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formState.email}
                onChange={(event) =>
                  handleFieldChange('email', event.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-subject">Subject</Label>
            <Input
              id="contact-subject"
              placeholder="What do you need help with?"
              value={formState.subject}
              onChange={(event) =>
                handleFieldChange('subject', event.target.value)
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">Message</Label>
            <Textarea
              id="contact-message"
              rows={6}
              placeholder="Share the issue, your browser, and what you already tried."
              value={formState.message}
              onChange={(event) =>
                handleFieldChange('message', event.target.value)
              }
              required
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p aria-live="polite" className="text-xs text-muted-foreground">
              {statusMessage || 'We usually reply within one business day.'}
            </p>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-h-11 w-full gap-2 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send message
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
