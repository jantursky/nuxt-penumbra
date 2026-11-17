import { computed, type ComputedRef } from 'vue'

import { useNuxtApp } from '#imports'

import type { Controller, SetThemeOptions } from '../controller'
import { useThemeState } from '../state'

export { defineTransition as definePenumbraTransition } from '@penumbra/core'
export type { Direction, Origin, TransitionContext, TransitionDefinition } from '@penumbra/core'
export type { SetThemeOptions } from '../controller'

export interface Penumbra {
  /** The theme that is applied now. Never `'system'`. */
  theme: ComputedRef<string>
  /** What the visitor chose: a theme name, or `'system'`. */
  preference: ComputedRef<string>
  /** The configured theme names, in order. */
  themes: readonly string[]
  setTheme: (preference: string, options?: SetThemeOptions) => void
  toggleTheme: (options?: SetThemeOptions) => void
}

export function usePenumbra(): Penumbra {
  const nuxtApp = useNuxtApp()
  const state = useThemeState()
  const injected = nuxtApp.$penumbra as (Controller & { themes: readonly string[] }) | undefined
  return {
    theme: computed(() => state.value),
    preference: computed(() => state.preference),
    themes: injected?.themes ?? [],
    // On the server there is no page to animate: writing the preference is all a theme change means there.
    setTheme: (preference, options) => {
      if (injected) injected.setTheme(preference, options)
      else state.preference = preference
    },
    toggleTheme: (options) => {
      injected?.toggleTheme(options)
    },
  }
}
