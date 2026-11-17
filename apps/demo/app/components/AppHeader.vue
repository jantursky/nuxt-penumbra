<script setup lang="ts">
const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/transitions', label: 'Transitions' },
  { to: '/navigation', label: 'Navigation' },
  { to: '/nuxt-ui', label: 'Nuxt UI' },
]
</script>

<template>
  <header class="header">
    <div class="capsule">
      <NuxtLink to="/" class="brand">
        <img src="/logo.svg" alt="" width="32" height="32" />
        Northwind
      </NuxtLink>
      <nav aria-label="Main" class="links">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to">{{ link.label }}</NuxtLink>
      </nav>
      <PenumbraToggle class="btn btn-accent toggle" data-testid="theme-toggle">
        <template #default="{ next, ready }">{{ ready ? `Switch to ${next}` : 'Switch theme' }}</template>
      </PenumbraToggle>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: var(--space-4);
  z-index: 10;
  width: min(var(--page-width), 100% - var(--space-8));
  margin: var(--space-4) auto 0;
}

.capsule {
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: 'brand links toggle';
  align-items: center;
  gap: var(--space-2) var(--space-4);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-5);
  background: var(--nav);
  color: var(--on-nav);
  border-radius: var(--radius-nav);
}

.brand {
  grid-area: brand;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: inherit;
  font-size: 14px;
  text-decoration: none;
}

.links {
  grid-area: links;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-1);
}

.links a {
  padding: var(--space-1) var(--space-3);
  color: inherit;
  font-size: 14px;
  text-decoration: none;
  border-bottom: 2px solid transparent;
}

.links a[aria-current='page'],
.links a.router-link-active:not([href='/']) {
  border-bottom-color: var(--accent);
}

.brand:focus-visible,
.links a:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.toggle {
  grid-area: toggle;
}

@media (max-width: 760px) {
  .capsule {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'brand toggle'
      'links links';
    padding: var(--space-2) var(--space-2) var(--space-3) var(--space-4);
    border-radius: 36px;
  }

  .links {
    justify-content: flex-start;
  }
}
</style>
