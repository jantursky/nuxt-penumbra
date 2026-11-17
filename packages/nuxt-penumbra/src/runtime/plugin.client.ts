import { nextTick, watch } from 'vue'

import { defineNuxtPlugin, useRouter, useRuntimeConfig } from '#imports'

import { createController, type ColorModeLike } from './controller'

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
      void transition.finished
        .catch(() => {})
        .then(() => {
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

  const colorMode = (): ColorModeLike => nuxtApp.$colorMode as ColorModeLike
  const controller = createController(colorMode, penumbra, {
    nextTick,
    isBusy: () => navigating || pageTransition !== undefined,
    lastClick: () => (click !== undefined && Date.now() - click.at < CLICK_WINDOW ? click.event : undefined),
  })

  // After mount, so color-mode's own hydration writes are not animated.
  nuxtApp.hook('app:mounted', () => {
    void nextTick().then(() => {
      watch(
        () => colorMode().preference,
        (next, previous) => {
          controller.intercept(next, previous)
        },
        { flush: 'sync' },
      )
    })
  })

  return { provide: { penumbra: { ...controller, themes: penumbra.themes } } }
})
