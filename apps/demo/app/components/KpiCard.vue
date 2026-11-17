<script setup lang="ts">
import type { Kpi } from '../data/northwind'

defineProps<Kpi>()
</script>

<template>
  <article class="card kpi">
    <h3 class="label">{{ label }}</h3>
    <p class="value">{{ value }}</p>
    <p class="label">{{ delta }} vs last month</p>
  </article>
</template>

<style scoped>
.kpi {
  height: 100%;
}

.value {
  margin: var(--space-2) 0;
  font: 900 36px/1 var(--font-display);
  letter-spacing: -0.01em;
}
</style>
