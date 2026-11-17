<script setup lang="ts">
import { kpis, orders, revenue } from '../data/northwind'

useHead({ title: 'Dashboard' })
</script>

<template>
  <div>
    <p class="aside">Week 46 at Northwind</p>
    <h1 class="display">Dashboard</h1>
    <p class="lede">
      A small shop dashboard with invented numbers. Press the yellow button in the navigation to switch the theme and
      watch the circle open from where you clicked.
    </p>

    <section class="section" aria-labelledby="kpis">
      <h2 id="kpis" class="sr-only">Key figures</h2>
      <ul class="kpis">
        <li v-for="kpi in kpis" :key="kpi.label"><KpiCard v-bind="kpi" /></li>
      </ul>
    </section>

    <div class="section panels">
      <section class="card" aria-labelledby="revenue">
        <h2 id="revenue" class="heading">Revenue</h2>
        <p class="label">Last 12 months</p>
        <RevenueChart :points="revenue" />
      </section>
      <section class="card" aria-labelledby="orders">
        <h2 id="orders" class="heading">Recent orders</h2>
        <OrdersTable :orders="orders" />
      </section>
    </div>

    <p class="section">
      <NuxtLink to="/transitions" class="btn">Try every transition</NuxtLink>
    </p>
  </div>
</template>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
}

@media (min-width: 960px) {
  .panels {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  }
}
</style>
