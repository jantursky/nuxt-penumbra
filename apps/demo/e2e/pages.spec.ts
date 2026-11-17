import { expect, test } from '@playwright/test'

import { collectErrors } from './helpers'

test.use({ colorScheme: 'light' })

const pages = [
  { path: '/', heading: 'Dashboard' },
  { path: '/transitions', heading: 'Transitions' },
  { path: '/navigation', heading: 'Navigation' },
  { path: '/navigation/second', heading: 'Second page' },
  { path: '/nuxt-ui', heading: 'Nuxt UI' },
]

for (const { path, heading } of pages) {
  test(`${path} renders without errors or horizontal scroll`, async ({ page }) => {
    const errors = collectErrors(page)
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    expect(errors).toEqual([])
  })
}

test('the header toggle switches the theme and the choice survives navigation and a reload', async ({ page }) => {
  await page.goto('/')
  const toggle = page.getByTestId('theme-toggle')
  await expect(toggle).toHaveAttribute('aria-label', 'Theme: light. Switch to dark.')
  await toggle.click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByRole('link', { name: 'Navigation' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Navigation' })).toBeVisible()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
})

test('a theme switch started during a navigation still lands', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/navigation')
  await expect(page.getByTestId('page-toggle')).toHaveAttribute('aria-label', /Theme: light/)
  await page.getByTestId('both').click()
  await expect(page.getByRole('heading', { level: 1, name: 'Second page' })).toBeVisible()
  await expect(page.locator('html')).toHaveClass(/dark/)
  expect(errors).toEqual([])
})

test('Nuxt UI styles do not leak into the other pages', async ({ page }) => {
  await page.goto('/nuxt-ui')
  await page.getByRole('link', { name: 'Dashboard' }).click()
  const heading = page.getByRole('heading', { level: 1, name: 'Dashboard' })
  await expect(heading).toBeVisible()
  expect(await heading.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Reddit Sans Condensed')
  expect(
    await page
      .locator('.card')
      .first()
      .evaluate((el) => getComputedStyle(el).borderRadius),
  ).toBe('14px')
})

test('the Nuxt UI controls switch the theme', async ({ page }) => {
  await page.goto('/nuxt-ui')
  await page.getByTestId('ui-button').click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.getByTestId('ui-switch').click()
  await expect(page.locator('html')).toHaveClass(/light/)
  await page.getByTestId('ui-select').click()
  await page.getByRole('option', { name: /dark/i }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
})
