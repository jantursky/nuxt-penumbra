<script setup lang="ts">
import type { Order } from '../data/northwind'

defineProps<{ orders: Order[] }>()
</script>

<template>
  <table>
    <caption class="sr-only">
      Recent orders
    </caption>
    <thead>
      <tr>
        <th scope="col" class="id">Order</th>
        <th scope="col">Customer</th>
        <th scope="col">Status</th>
        <th scope="col" class="total">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="order in orders" :key="order.id">
        <td class="id">{{ order.id }}</td>
        <td>{{ order.customer }}</td>
        <td>
          <span class="status">{{ order.status }}</span>
        </td>
        <td class="total">{{ order.total }}</td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

th {
  color: var(--text-muted);
  font-weight: 500;
  text-align: left;
}

th,
td {
  padding: var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--border);
  vertical-align: top;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.total {
  text-align: right;
  white-space: nowrap;
}

.status {
  padding: 2px var(--space-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-button);
}

@media (max-width: 520px) {
  .id {
    display: none;
  }
}
</style>
