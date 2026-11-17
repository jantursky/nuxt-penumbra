<script setup lang="ts">
defineProps<{ label: string; code: string }>()
</script>

<template>
  <figure class="code">
    <figcaption class="label">{{ label }}</figcaption>
    <pre role="region" tabindex="0" :aria-label="label"><code>{{ code }}</code></pre>
  </figure>
</template>

<style scoped>
.code {
  margin: 0;
  /* Grid and flex parents would otherwise grow to the width of the longest line instead of scrolling it. */
  min-width: 0;
  max-width: 100%;
}

pre {
  margin: var(--space-2) 0 0;
  padding: var(--space-4);
  overflow-x: auto;
  background: var(--canvas);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  font: 14px/1.6 var(--font-mono);
}

pre:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
</style>
