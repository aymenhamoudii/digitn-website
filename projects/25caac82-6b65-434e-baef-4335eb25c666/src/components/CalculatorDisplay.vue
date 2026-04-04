<template>
  <div class="calculator-display" aria-live="polite">
    <div class="history" aria-hidden="true">{{ history }}</div>
    <div class="current-value">{{ formattedValue }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String,
    required: true
  },
  history: {
    type: String,
    default: ''
  }
})

const formattedValue = computed(() => {
  if (props.value === 'Error') return 'Error'
  const parts = props.value.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
})
</script>

<style scoped>
.calculator-display {
  background-color: var(--bg-display);
  padding: var(--space-6);
  text-align: right;
  border-radius: 12px 12px 0 0;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--space-2);
}

.history {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  height: 20px;
  overflow: hidden;
  white-space: nowrap;
}

.current-value {
  font-size: var(--text-4xl);
  font-weight: 300;
  color: var(--text-primary);
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.current-value::-webkit-scrollbar {
  display: none;
}
</style>
