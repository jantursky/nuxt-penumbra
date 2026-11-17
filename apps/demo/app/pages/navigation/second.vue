<script setup lang="ts">
definePageMeta({ viewTransition: true })
useHead({ title: 'Second page' })
</script>

<template>
  <NavigationPanel
    aside="Still on the same theme"
    title="Second page"
    lede="The theme you picked travelled with you. Switch it here, or go back and switch it there."
    to="/navigation"
    link-label="Back to navigation"
  />
</template>
