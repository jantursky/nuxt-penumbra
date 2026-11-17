<script setup lang="ts">
const colorMode = useColorMode()
</script>

<template>
  <UApp>
    <header class="flex items-center gap-4 p-4">
      <nav aria-label="Main" class="flex gap-4">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </nav>
      <!-- Nuxt UI's own components: no wrapper, no origin passed, plain writes to `colorMode.preference`. -->
      <UColorModeButton data-testid="ui-button" />
      <UColorModeSwitch data-testid="ui-switch" />
      <UColorModeSelect data-testid="ui-select" />
      <p>
        theme: <b data-testid="theme">{{ colorMode.value }}</b>
      </p>
    </header>
    <main class="p-4"><NuxtPage /></main>
  </UApp>
</template>
