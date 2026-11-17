<script setup lang="ts">
// Loaded here, not in nuxt.config, so the other layouts never ship Tailwind.
import '~/assets/css/ui.css'
</script>

<template>
  <UApp class="ui-scope">
    <AppShell><slot /></AppShell>
  </UApp>
</template>
