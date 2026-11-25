import { noop } from 'penumbra-core'
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

  // Targets of the navigations in flight. vue-router also runs `afterEach` for a navigation a newer one cancelled, so a
  // boolean would turn false while the newer navigation is still running.
  const navigating = new Set<string>()
  let pageTransition: ViewTransition | undefined
  router.beforeEach((to) => {
    navigating.add(to.fullPath)
  })
  router.afterEach((to) => {
    navigating.delete(to.fullPath)
  })
  router.onError(() => {
    navigating.clear()
  })
  // `beforeEach` runs a few ticks after `push()`, once the leave guards have settled. A theme change made in that gap
  // (`navigateTo()` followed by `toggleTheme()`) would start its own view transition just before Nuxt starts the page
  // one, and Chromium crashes when two overlap. So a navigation counts from the moment it is requested.
  let requested = 0
  for (const method of ['push', 'replace'] as const) {
    const original = router[method].bind(router)
    router[method] = (to) => {
      requested++
      return original(to).finally(() => {
        requested--
      })
    }
  }
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
  const state = (): ThemeState => nuxtApp.runWithContext(useThemeState) as ThemeState
  const controller = createController(state, penumbra, {
    nextTick,
    isBusy: () => requested > 0 || navigating.size > 0 || pageTransition !== undefined,
    lastClick: () => (click !== undefined && Date.now() - click.at < CLICK_WINDOW ? click.event : undefined),
  })

  // The store exists from the start, so a write before mount is stored and applied like any other.
  const store = penumbra.mode === 'standalone' ? createStandaloneStore(penumbra, state()) : undefined

  nuxtApp.hook('app:mounted', () => {
    if (store) {
      // After hydration, so the stored choice does not clash with the server-rendered markup.
      store.start()
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
