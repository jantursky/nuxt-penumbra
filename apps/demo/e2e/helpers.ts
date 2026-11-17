import type { Page } from '@playwright/test'

/** Counts calls to `document.startViewTransition`, so a test can tell an animated switch from an instant one. */
export async function countViewTransitions(page: Page): Promise<void> {
  await page.evaluate(() => {
    const w = window as unknown as { __vt: number }
    w.__vt = 0
    const original = document.startViewTransition.bind(document)
    document.startViewTransition = ((callback?: () => Promise<void> | void) => {
      w.__vt++
      return original(callback)
    }) as typeof document.startViewTransition
  })
}

export const viewTransitions = (page: Page): Promise<number> =>
  page.evaluate(() => (window as unknown as { __vt: number }).__vt)

/** Collects console errors and uncaught exceptions. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

/** The radios are visually hidden; clicking their label is what a visitor does and works in every engine. */
export async function pickEffect(page: Page, effect: string): Promise<void> {
  await page.locator('label', { has: page.getByRole('radio', { name: effect, exact: true }) }).click()
}
