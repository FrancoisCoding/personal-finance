import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const contactOptions = [
  {
    title: 'Email support',
    description: 'Reach us at support@financeflow.app for account help.',
  },
  {
    title: 'In-app chat',
    description: 'Chat with a specialist during business hours.',
  },
  {
    title: 'Status updates',
    description: 'View service status and maintenance notices.',
  },
]

const faqItems = [
  {
    question: 'How do I connect a new account?',
    answer:
      'Go to Dashboard, select Connect Account, and follow the secure prompt.',
  },
  {
    question: 'How do I update my subscription?',
    answer:
      'Open Settings, then Billing to change plans, payment methods, or cancel.',
  },
  {
    question: 'How can I export my data?',
    answer: 'Use the Export option in Settings to download your transactions.',
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
            How can we help?
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Find quick answers, reach the support team, or explore
            troubleshooting steps for common workflows.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
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

        <Card>
          <CardHeader>
            <CardTitle>Frequently asked questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.question} className="space-y-2">
                <h3 className="text-base font-semibold">{item.question}</h3>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
