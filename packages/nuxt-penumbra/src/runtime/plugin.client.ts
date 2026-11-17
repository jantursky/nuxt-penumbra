import { noop } from '@penumbra/core'
import { nextTick, watch } from 'vue'

import { defineNuxtPlugin, useRouter, useRuntimeConfig } from '#imports'

import { createController } from './controller'
import { createStandaloneStore, type ThemeState } from './standalone'
import { useThemeState } from './state'

/** A click older than this is not where the visitor meant the reveal to start. */
const CLICK_WINDOW = 1000

export default defineNuxtPlugin((nuxtApp) => {
  const { penumbra } = useRuntimeConfig().public
  const router = useRouter()

  let navigating = false
  let pageTransition: ViewTransition | undefined
  router.beforeEach(() => {
    navigating = true
  })
  router.afterEach(() => {
    navigating = false
  })
  router.onError(() => {
    navigating = false
  })
  // Nuxt's experimental page transitions run past `afterEach`, until the animation has finished.
  nuxtApp.hook(
    'page:view-transition:start' as never,
    ((transition: ViewTransition) => {
      pageTransition = transition
      void transition.finished.catch(noop).then(() => {
        if (pageTransition === transition) pageTransition = undefined
      })
    }) as never,
  )

  let click: { event: MouseEvent; at: number } | undefined
  document.addEventListener(
    'click',
    (event) => {
      click = { event, at: Date.now() }
    },
    { capture: true, passive: true },
  )

  // Read lazily: color-mode's own plugin may run after this one.
  const state = (): ThemeState => nuxtApp.runWithContext(useThemeState)
  const controller = createController(state, penumbra, {
    nextTick,
    isBusy: () => navigating || pageTransition !== undefined,
    lastClick: () => (click !== undefined && Date.now() - click.at < CLICK_WINDOW ? click.event : undefined),
  })

  nuxtApp.hook('app:mounted', () => {
    if (penumbra.mode === 'standalone') {
      // After hydration, so the stored choice does not clash with the server-rendered markup.
      createStandaloneStore(penumbra, state()).start()
      return
    }
    // Color-mode mode: after its own hydration writes, so they are not animated.
    void nextTick().then(() => {
      watch(
        () => state().preference,
        (next, previous) => {
          controller.intercept(next, previous)
        },
        { flush: 'sync' },
      )
    })
  })

  return { provide: { penumbra: { ...controller, themes: penumbra.themes } } }
})
