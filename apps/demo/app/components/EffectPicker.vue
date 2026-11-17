<script setup lang="ts">
defineProps<{ effects: readonly string[] }>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <fieldset class="picker">
    <legend class="label">Effect</legend>
    <label v-for="effect in effects" :key="effect" class="chip">
      <input v-model="model" type="radio" name="effect" :value="effect" class="sr-only" />
      <span class="btn">{{ effect }}</span>
    </label>
  </fieldset>
</template>

<style scoped>
.picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.picker legend {
  width: 100%;
  margin-bottom: var(--space-1);
  padding: 0;
}

.chip {
  position: relative;
}

.chip input:checked + .btn {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--on-accent);
}

.chip input:focus-visible + .btn {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
}
</style>
