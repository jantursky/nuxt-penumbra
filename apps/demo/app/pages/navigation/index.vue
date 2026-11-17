<script setup lang="ts">
definePageMeta({ viewTransition: true })
useHead({ title: 'Navigation' })
</script>

<template>
  <NavigationPanel
    aside="Pages and themes"
    title="Navigation"
    lede="This page and the next one move with Nuxt's view transitions. The theme switch keeps working here."
    to="/navigation/second"
    link-label="Go to the second page"
  />
</template>
