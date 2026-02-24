import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CookiesPage() {
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
            Legal
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            This policy describes how FinanceFlow uses cookies and similar
            technologies to provide, customize, evaluate, and improve our
            services.
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>What are cookies?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Cookies are small text files sent to your computer or mobile
                device that allow FinanceFlow features and functionality to
                work. They are unique to your account or your browser.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How we use cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                We use cookies for several reasons, including security,
                authentication, and remembering your preferences.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Authentication:</strong> To recognize you when you
                  visit our services.
                </li>
                <li>
                  <strong>Security:</strong> To protect your data and our
                  services from unauthorized access.
                </li>
                <li>
                  <strong>Preferences:</strong> To remember your settings and UI
                  choices.
                </li>
                <li>
                  <strong>Analytics:</strong> To understand how users interact
                  with our platform.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Controlling cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Most browsers allow you to control cookies through their
                settings preferences. However, if you limit the ability of
                websites to set cookies, you may worsen your overall user
                experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
