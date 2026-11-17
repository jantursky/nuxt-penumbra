import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const pages = [
  { path: '/', ready: 'Dashboard' },
  { path: '/transitions', ready: 'Transitions' },
  { path: '/navigation', ready: 'Navigation' },
  { path: '/navigation/second', ready: 'Second page' },
  { path: '/nuxt-ui', ready: 'Nuxt UI' },
]

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} mode`, () => {
    test.use({ colorScheme })

    for (const { path, ready } of pages) {
      test(`${path} has no accessibility violations`, async ({ page }) => {
        await page.goto(path)
        await expect(page.getByRole('heading', { level: 1, name: ready })).toBeVisible()
        await expect(page.locator('html')).toHaveClass(new RegExp(colorScheme))
        // Nuxt UI renders its colour mode controls on the client only.
        if (path === '/nuxt-ui') await expect(page.getByTestId('ui-switch')).toBeVisible()
        await page.waitForLoadState('networkidle')
        const { violations } = await new AxeBuilder({ page }).analyze()
        expect(violations).toEqual([])
      })
    }
  })
}
