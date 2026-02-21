import { expect, test } from '@playwright/test'

const publicRoutes = ['/', '/support', '/auth/login', '/auth/register']

test.describe('Mobile smoke coverage', () => {
  for (const route of publicRoutes) {
    test(`renders without horizontal overflow on ${route}`, async ({
      page,
    }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('main').first()).toBeVisible()

      const hasHorizontalOverflow = await page.evaluate(() => {
        const root = document.documentElement
        return root.scrollWidth - root.clientWidth > 1
      })

      expect(hasHorizontalOverflow).toBeFalsy()
    })
  }

  test('keeps sign-in form usable when focusing inputs', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })

    const emailInput = page.locator('#email')
    const passwordInput = page.locator('#password')

    await emailInput.click()
    await emailInput.fill('mobile-smoke@example.com')
    await passwordInput.click()
    await passwordInput.fill('StrongPassword123!')

    const viewportScale = await page.evaluate(() => {
      return window.visualViewport?.scale ?? 1
    })

    expect(viewportScale).toBeLessThanOrEqual(1.01)
  })

  test('renders compact unauthenticated navigation controls', async ({
    page,
  }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' })

    await expect(
      page.locator('nav').getByRole('link', { name: /support/i })
    ).toBeVisible()
    await expect(
      page.locator('nav').locator('a[href="/auth/login"]').first()
    ).toBeVisible()
  })

  test('submits support form successfully', async ({ page }) => {
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

    await page.locator('#contact-name').fill('Mobile Tester')
    await page.locator('#contact-email').fill('mobile@example.com')
    await page
      .locator('#contact-subject')
      .fill('Mobile layout and interaction verification')
    await page
      .locator('#contact-message')
      .fill('This is an automated mobile smoke test for the support form.')

    await page.getByRole('button', { name: /send message/i }).click()

    await expect(
      page.locator('#contact-form [aria-live="polite"]')
    ).toContainText(/(thanks for reaching out|message sent successfully)/i)
  })
})
