import type { Ref } from 'vue'

/** Whether the visitor's system asks for reduced motion. Always false until the page is mounted. */
export function useSystemReducedMotion(): Ref<boolean> {
  const reduces = ref(false)
  let query: MediaQueryList | undefined
  const update = (): void => {
    reduces.value = query?.matches ?? false
  }
  onMounted(() => {
    query = matchMedia('(prefers-reduced-motion: reduce)')
    update()
    query.addEventListener('change', update)
  })
  onBeforeUnmount(() => query?.removeEventListener('change', update))
  return reduces
}
