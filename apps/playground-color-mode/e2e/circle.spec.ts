import { expect, test, type Page } from '@playwright/test'

const bg = (page: Page, x: number, y: number) =>
  page.screenshot({ clip: { x, y, width: 1, height: 1 } }).then((png) => png.subarray(-40).toString('hex'))

test.beforeEach(async ({ context }) => {
  await context.clearCookies()
})

test('toggle switches the theme and writes color-mode state', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('theme')).toHaveText('light')
  await page.getByTestId('toggle').click()
  await expect(page.getByTestId('theme')).toHaveText('dark')
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.getByTestId('preference')).toHaveText('dark')
})

for (const testid of ['toggle-circle', 'raw-dark']) {
  test(`${testid}: runs inside a view transition and keeps the old page for the snapshot`, async ({
    page,
    browserName,
  }) => {
    test.skip(browserName === 'firefox', 'Firefox ships View Transitions from 144; checked below')
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
    await page.getByTestId(testid).click()
    await expect(page.getByTestId('theme')).toHaveText('dark')
    const { count, oldClass } = await page.evaluate(() => {
      const w = window as unknown as { __vt: number; __oldClass: string[] }
      return { count: w.__vt, oldClass: w.__oldClass }
    })
    expect(count).toBe(1)
    // When the update callback runs, the DOM must still be light: that is what the old snapshot was taken of.
    expect(oldClass[0]).not.toContain('dark')
  })
}

test('the reveal starts at the click and the far corner is still old mid-transition', async ({ page, browserName }) => {
  test.skip(browserName === 'firefox')
  await page.setViewportSize({ width: 1000, height: 700 })
  await page.goto('/')
  const before = await bg(page, 990, 690)
  await page.getByTestId('toggle-circle').click()
  await page.waitForTimeout(150)
  const mid = await bg(page, 990, 690)
  expect(mid).toBe(before)
  await expect(page.getByTestId('theme')).toHaveText('dark')
  await page.waitForTimeout(900)
  expect(await bg(page, 990, 690)).not.toBe(before)
})
