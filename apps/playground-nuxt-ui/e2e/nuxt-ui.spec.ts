import { expect, test, type Page } from '@playwright/test'

test.beforeEach(async ({ page, browserName }) => {
  test.skip(browserName === 'firefox', 'No View Transitions API in this Firefox build')
  await page.goto('/')
  await page.evaluate(() => {
    const w = window as unknown as { __vt: number; __oldClass: string[] }
    w.__vt = 0
    w.__oldClass = []
    const original = document.startViewTransition.bind(document)
    document.startViewTransition = ((cb?: () => Promise<void> | void) => {
      w.__vt++
      return original(() => {
        w.__oldClass.push(document.documentElement.className)
        return cb?.()
      })
    }) as typeof document.startViewTransition
  })
})

const state = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __vt: number; __oldClass: string[] }
    return { count: w.__vt, oldClass: w.__oldClass }
  })

test('UColorModeButton is animated with no wrapper', async ({ page }) => {
  await page.getByTestId('ui-button').click()
  await expect(page.getByTestId('theme')).toHaveText('dark')
  const { count, oldClass } = await state(page)
  expect(count).toBe(1)
  expect(oldClass[0]).not.toContain('dark')
})

test('UColorModeSwitch is animated with no wrapper', async ({ page }) => {
  await page.getByTestId('ui-switch').click()
  await expect(page.getByTestId('theme')).toHaveText('dark')
  expect((await state(page)).count).toBe(1)
})

test('UColorModeSelect is animated with no wrapper', async ({ page }) => {
  await page.getByTestId('ui-select').click()
  await page.getByRole('option', { name: /dark/i }).click()
  await expect(page.getByTestId('theme')).toHaveText('dark')
  expect((await state(page)).count).toBe(1)
})

test('the choice survives a client navigation and a reload', async ({ page }) => {
  await page.getByTestId('ui-button').click()
  await expect(page.getByTestId('theme')).toHaveText('dark')
  await page.getByRole('link', { name: 'About' }).click()
  await expect(page.getByRole('heading', { name: 'About' })).toBeVisible()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)
})
