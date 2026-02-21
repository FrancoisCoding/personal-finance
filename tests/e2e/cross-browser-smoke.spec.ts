import { expect, test } from '@playwright/test'

const publicRoutes = ['/', '/support', '/auth/login', '/auth/register']

test.describe('Cross-browser smoke coverage', () => {
  for (const route of publicRoutes) {
    test(`renders ${route} without JS/runtime failures`, async ({ page }) => {
      const pageErrors: string[] = []
      page.on('pageerror', (error) => {
        pageErrors.push(error.message)
      })

      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('main').first()).toBeVisible()

      const hasHorizontalOverflow = await page.evaluate(() => {
        const root = document.documentElement
        return root.scrollWidth - root.clientWidth > 1
      })

      expect(hasHorizontalOverflow).toBeFalsy()
      expect(pageErrors).toHaveLength(0)
    })
  }

  test('allows login form interaction', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })

    await page.locator('#email').fill('cross-browser@example.com')
    await page.locator('#password').fill('StrongPassword123!')

    await expect(page.locator('#email')).toHaveValue(
      'cross-browser@example.com'
    )
    await expect(page.locator('#password')).toHaveValue('StrongPassword123!')
  })

  test('submits support form with a successful response', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message:
            'Thanks for reaching out. We received your message and will reply soon.',
        }),
      })
    })

    await page.goto('/support', { waitUntil: 'domcontentloaded' })

    await page.locator('#contact-name').fill('Cross Browser Smoke')
    await page.locator('#contact-email').fill('cross-browser@example.com')
    await page.locator('#contact-subject').fill('Cross-browser check')
    await page
      .locator('#contact-message')
      .fill('Automated cross-browser validation for support form submit flow.')

    await page.getByRole('button', { name: /send message/i }).click()

    await expect(
      page.locator('#contact-form [aria-live="polite"]')
    ).toContainText(/(thanks for reaching out|message sent successfully)/i)
  })
})
