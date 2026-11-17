<script setup lang="ts">
const props = defineProps<{ aside: string; title: string; lede: string; to: string; linkLabel: string }>()

const { toggleTheme } = usePenumbra()

async function navigateAndToggle(event: MouseEvent): Promise<void> {
  const navigation = navigateTo(props.to)
  await nextTick()
  toggleTheme({ origin: event })
  await navigation
}

const config = `export default defineNuxtConfig({
  experimental: { viewTransition: true },
})`
const meta = `definePageMeta({ viewTransition: true })`
</script>

<template>
  <div>
    <p class="aside">{{ aside }}</p>
    <h1 class="display">{{ title }}</h1>
    <p class="lede">{{ lede }}</p>

    <div class="section panels">
      <section class="card stack" aria-labelledby="try">
        <h2 id="try" class="heading">Try it</h2>
        <p class="label">
          Move between the two pages, then switch the theme. Or start both at once and see which one gives way.
        </p>
        <div class="actions">
          <NuxtLink :to="to" class="btn" data-testid="next-page">{{ linkLabel }}</NuxtLink>
          <PenumbraToggle class="btn" data-testid="page-toggle">
            <template #default="{ next, ready }">{{ ready ? `Switch to ${next}` : 'Switch theme' }}</template>
          </PenumbraToggle>
          <button type="button" class="btn" data-testid="both" @click="navigateAndToggle">
            Navigate and switch at once
          </button>
        </div>
        <h2 class="heading">One at a time</h2>
        <p class="label">
          Page transitions and theme transitions never run together. Starting a second view transition would cancel the
          first and leave a navigation half done, so nuxt-penumbra applies a theme change that arrives during a
          navigation at once, without its effect.
        </p>
      </section>

      <section class="card stack" aria-labelledby="setup">
        <h2 id="setup" class="heading">Setup</h2>
        <p class="label">
          The flag in the config turns on Nuxt's page transitions for the whole app. The page meta opts a page in
          explicitly, and <code>false</code> opts one out.
        </p>
        <CodeBlock label="nuxt.config.ts" :code="config" />
        <CodeBlock label="The page" :code="meta" />
      </section>
    </div>
  </div>
</template>

<style scoped>
.panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  align-items: start;
}

@media (min-width: 960px) {
  .panels {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.stack {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-4);
  min-width: 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

code {
  font-family: var(--font-mono);
  font-size: 14px;
}
</style>
