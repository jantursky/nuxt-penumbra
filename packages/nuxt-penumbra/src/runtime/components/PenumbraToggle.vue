<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { usePenumbra } from '../composables/usePenumbra'
import type { Direction } from 'penumbra-core'

const props = defineProps<{
  /** Themes to cycle through. Default: the module's `themes`. */
  themes?: string[]
  /** Effect name. Default: the module's `transition`. */
  transition?: string
  duration?: number
  easing?: string
  /** Which way directional effects travel. Default `'right'`. */
  direction?: Direction
}>()

defineSlots<{
  /** The button content. `theme` is the theme on screen, `next` the one a click switches to. `ready` is false until the page is mounted, when the theme may still be unknown. */
  default?: (props: { theme: string; next: string; ready: boolean }) => unknown
}>()

const penumbra = usePenumbra()
// The server cannot know the theme when it is stored in the browser, so the live label waits for mount.
const ready = ref(false)
onMounted(() => {
  ready.value = true
})
const list = computed(() => props.themes ?? penumbra.themes)
const next = computed(() => {
  const index = list.value.indexOf(penumbra.theme.value)
  return list.value[(index + 1) % list.value.length] ?? penumbra.theme.value
})

function onClick(event: MouseEvent): void {
  penumbra.setTheme(next.value, {
    origin: event,
    transition: props.transition,
    duration: props.duration,
    easing: props.easing,
    direction: props.direction,
  })
}
</script>

<template>
  <button
    type="button"
    class="penumbra-toggle"
    :aria-label="ready ? `Theme: ${penumbra.theme.value}. Switch to ${next}.` : 'Switch theme'"
    @click="onClick"
  >
    <slot :theme="penumbra.theme.value" :next="next" :ready="ready">{{ ready ? penumbra.theme.value : '' }}</slot>
  </button>
</template>

<style>
@media (forced-colors: active) {
  .penumbra-toggle {
    border: 1px solid ButtonText;
  }
}
</style>
