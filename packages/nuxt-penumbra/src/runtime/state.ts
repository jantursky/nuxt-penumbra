import { reactive } from 'vue'

import { useNuxtApp, useRuntimeConfig, useState } from '#imports'

import { initialState, type ThemeState } from './standalone'

/**
 * The reactive `{ preference, value, forced }` behind `usePenumbra()`. In color-mode mode it is color-mode's own
 * instance; in standalone mode it is a `useState` object, so the server-rendered value reaches the client.
 */
export function useThemeState(): ThemeState {
  const { penumbra } = useRuntimeConfig().public
  if (penumbra.mode === 'color-mode') return useNuxtApp().$colorMode as ThemeState
  return useState<ThemeState>('penumbra', () => reactive(initialState(penumbra))).value
}
