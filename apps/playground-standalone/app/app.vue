<script setup lang="ts">
const { theme, preference, toggleTheme, setTheme } = usePenumbra()
</script>

<template>
  <div class="page">
    <header>
      <nav aria-label="Main">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/about">About</NuxtLink>
      </nav>
      <p>
        theme: <b data-testid="theme">{{ theme }}</b> / preference: <b data-testid="preference">{{ preference }}</b>
      </p>
      <button data-testid="toggle" @click="(event) => toggleTheme({ origin: event })">Toggle</button>
      <button data-testid="set-dark" @click="setTheme('dark')">Dark</button>
      <button data-testid="set-sepia" @click="setTheme('sepia')">Sepia</button>
      <button data-testid="set-system" @click="setTheme('system')">System</button>
      <PenumbraToggle data-testid="penumbra-toggle" transition="wipe" />
    </header>
    <main><NuxtPage /></main>
  </div>
</template>

<style>
:root {
  --bg: #fff;
  --fg: #111;
}
:root[data-theme='dark'] {
  --bg: #111;
  --fg: #fff;
}
:root[data-theme='sepia'] {
  --bg: #f1e7d0;
  --fg: #3b2f1b;
}
body {
  background: var(--bg);
  color: var(--fg);
  margin: 0;
  font-family: system-ui, sans-serif;
}
.page {
  padding: 2rem;
  min-height: 100vh;
}
a {
  color: inherit;
}
button {
  margin: 0 0.5rem 0.5rem 0;
}
</style>
