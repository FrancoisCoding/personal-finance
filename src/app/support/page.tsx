'use client'

import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion } from '@/components/ui/accordion'
import { ContactForm } from '@/components/support/contact-form'
import { Info } from 'lucide-react'

const contactOptions = [
  {
    title: 'Email support',
    description:
      'Send account and billing questions to support@financeflow.dev.',
  },
  {
    title: 'In-app chat',
    description: 'Chat with a specialist during business hours for quick help.',
  },
  {
    title: 'Service updates',
    description: 'Review live platform status and maintenance notices.',
  },
]

const faqItems = [
  {
    question: 'How do I connect a new account?',
    answer:
      'From the Dashboard, select Connect Bank Account and follow the secure prompt. We use bank-level encryption and do not store your login credentials. You can disconnect or reconnect accounts anytime from Accounts.',
  },
  {
    question: 'How do I update my subscription?',
    answer:
      'Open Billing in your account to change plans, update payment methods, or cancel. Changes take effect at the next billing cycle. Refunds follow our terms of service.',
  },
  {
    question: 'How can I export my data?',
    answer:
      'In Transactions, use the Export option to download your filtered activity as CSV. You can choose date range and accounts. Exports are generated on demand and include categories and notes.',
  },
  {
    question: 'Is my financial data secure?',
    answer:
      'Yes. We use encryption in transit and at rest, and we never sell your data. Our security practices are described in our Privacy Policy. For sensitive actions we support two-factor authentication.',
  },
  {
    question: 'What happens if I miss a payment?',
    answer:
      'We will send reminders before due dates. If a payment is missed, you can update the transaction or reminder in the app. We do not report to credit bureaus; your bank or creditor may have their own policies.',
  },
  {
    question: 'Can I use FinanceFlow with multiple currencies?',
    answer:
      'You can set a display currency in Profile so all amounts are shown in one currency. Adding accounts in other currencies is supported; we use approximate conversion for summaries. For exact multi-currency reporting, use filters and exports.',
  },
]

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto px-4 py-20 space-y-16"
      >
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Help Center
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
            Support that keeps you moving.
          </h1>
          <p className="text-muted-foreground text-lg text-balance">
            Get fast answers, contact support, and resolve common issues without
            breaking your workflow.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contactOptions.map((option) => (
            <Card
              key={option.title}
              className="border-border/60 bg-card/50 backdrop-blur-sm"
            >
              <CardHeader>
                <CardTitle className="text-lg">{option.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                {option.description}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-12 xl:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-8">
            <div id="contact-form">
              <ContactForm />
            </div>

            <Card className="border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm shadow-sm overflow-hidden border">
              <div className="bg-emerald-500/10 px-6 py-3 border-b border-emerald-500/10 flex items-center gap-2">
                <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Speed up your request
                </span>
              </div>
              <CardContent className="p-6 text-sm text-muted-foreground space-y-4 leading-relaxed">
                <p>To get the fastest help, please include:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your account email address</li>
                  <li>The specific page or feature you were using</li>
                  <li>What you expected versus what actually happened</li>
                  <li>For billing: Last four digits of your payment method</li>
                </ul>
                <p className="pt-2 italic border-t border-emerald-500/10">
                  We usually respond within one business day. For account
                  lockouts, use &ldquo;Urgent&rdquo; in the subject.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Frequently Asked Questions
            </h2>
            <Card className="border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <Accordion items={faqItems} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
