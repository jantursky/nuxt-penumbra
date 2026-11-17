<template>
  <div>
    <a href="#main" class="btn btn-accent skip">Skip to content</a>
    <AppHeader />
    <main id="main" class="wrap main" tabindex="-1"><slot /></main>
    <footer class="wrap footer">
      <p class="label">Sample data is invented. Theme switching by nuxt-penumbra.</p>
    </footer>
  </div>
</template>

<style scoped>
.skip {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: 20;
  transform: translateY(-200%);
}

.skip:focus {
  transform: none;
}

.main {
  padding-block: var(--space-16) var(--space-20);
}

.main:focus {
  outline: none;
}

.footer {
  padding-bottom: var(--space-10);
}
</style>
