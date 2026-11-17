import { runTransition, type Direction, type Origin } from 'penumbra-core'

/** The part of `@nuxtjs/color-mode`'s instance this module touches. */
export interface ColorModeLike {
  preference: string
  readonly value: string
  readonly forced: boolean
}

export interface SetThemeOptions {
  /** Effect name. Defaults to the module's `transition`. */
  transition?: string
  duration?: number
  easing?: string
  /** Where a reveal starts. Pass the click event. Default: the click that just happened, else the middle of the screen. */
  origin?: Origin
  /** Which way directional effects travel. Default `'right'`. */
  direction?: Direction
}

export interface ControllerOptions {
  themes: readonly string[]
  transition: string
  duration: number
  easing: string
}

export interface ControllerEnv {
  /** Resolves once Vue has applied the state change to the page. */
  nextTick: () => Promise<void>
  /** True while the router or a page transition is running. */
  isBusy: () => boolean
  /** The latest click, for a reveal that starts where the visitor clicked. */
  lastClick: () => MouseEvent | undefined
}

const SYSTEM = 'system'

const systemTheme = (): string =>
  typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

/**
 * Animates changes to a `@nuxtjs/color-mode` instance. The theme is never stored here: `preference` is written
 * inside the view transition, so color-mode's own watchers, storage and cookie keep working.
 */
export function createController(getColorMode: () => ColorModeLike, options: ControllerOptions, env: ControllerEnv) {
  // True while this controller writes `preference`, so the interceptor can tell its own writes from foreign ones.
  let writing = false
  // The animated change that is waiting for the browser's next frame. Until it runs, `colorMode.value` is still the
  // old theme, so a second call has to compare against this instead.
  let pending: { preference: string; theme: string } | undefined

  function write(preference: string): void {
    writing = true
    try {
      getColorMode().preference = preference
    } finally {
      writing = false
    }
  }

  const resolve = (preference: string): string => (preference === SYSTEM ? systemTheme() : preference)

  function setTheme(preference: string, call: SetThemeOptions = {}): void {
    const colorMode = getColorMode()
    const theme = resolve(preference)
    if (theme === pending?.theme && typeof document !== 'undefined' && !colorMode.forced) {
      // Same target as the change in flight: it will write whichever preference was asked for last.
      pending.preference = preference
      return
    }
    if (typeof document === 'undefined' || colorMode.forced || (pending === undefined && theme === colorMode.value)) {
      pending = undefined
      write(preference)
      return
    }
    const request = { preference, theme }
    pending = request
    const click = env.lastClick()
    runTransition(
      async () => {
        // A later call has replaced this one: its own callback writes the state the page should end on.
        if (pending !== request) return
        pending = undefined
        write(request.preference)
        await env.nextTick()
      },
      {
        name: call.transition ?? options.transition,
        duration: call.duration ?? options.duration,
        easing: call.easing ?? options.easing,
        origin: call.origin ?? click,
        direction: call.direction ?? 'right',
        guardCss: true,
        isBusy: env.isBusy,
      },
    )
  }

  function toggleTheme(call?: SetThemeOptions): void {
    const index = options.themes.indexOf(pending?.theme ?? getColorMode().value)
    const next = options.themes[(index + 1) % options.themes.length]
    if (next !== undefined) setTheme(next, call)
  }

  /**
   * Called by a synchronous watcher on `preference`, before color-mode's own watcher has run. A write that did not
   * come from this controller (Nuxt UI's `ColorModeButton`, a `v-model`) is put back and replayed inside a view
   * transition, so the old page is still on screen when the browser takes its snapshot.
   */
  function intercept(next: string, previous: string): void {
    if (writing || getColorMode().forced || next === previous) return
    write(previous)
    setTheme(next)
  }

  return { setTheme, toggleTheme, intercept }
}

export type Controller = ReturnType<typeof createController>
