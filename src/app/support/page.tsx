import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactForm } from '@/components/support/contact-form'

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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:ring-2 focus:ring-primary"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        tabIndex={-1}
        className="container mx-auto px-4 py-12 space-y-10"
      >
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Support
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">
            Support that keeps you moving.
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Get fast answers, contact support, and resolve common issues without
            breaking your workflow.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {contactOptions.map((option) => (
            <Card key={option.title}>
              <CardHeader>
                <CardTitle className="text-lg">{option.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {option.description}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div id="contact-form">
            <ContactForm />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Frequently asked questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((item) => (
                  <div key={item.question} className="space-y-2">
                    <h3 className="text-base font-semibold">{item.question}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What to include when you contact us</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>
                  To get the fastest help, include your account email, the page
                  or feature you were using, and what you expected versus what
                  happened. For billing questions, mention your plan and last
                  four digits of the payment method if relevant.
                </p>
                <p>
                  We aim to reply within one business day. For urgent account
                  access issues, say &ldquo;Urgent&rdquo; in the subject line.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
