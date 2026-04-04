<template>
  <button
    class="calculator-button"
    :class="[type, { 'is-double': double }]"
    @click="$emit('click')"
    @mousedown="createRipple"
    ref="buttonRef"
  >
    <span class="label"><slot></slot></span>
    <div class="ripple-container" ref="rippleContainer"></div>
  </button>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'number',
    validator: (v) => ['number', 'operator', 'function', 'accent'].includes(v)
  },
  double: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

const buttonRef = ref(null)
const rippleContainer = ref(null)

const createRipple = (event) => {
  const button = buttonRef.value
  const ripple = document.createElement('span')
  const rect = button.getBoundingClientRect()
  
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2
  
  ripple.style.width = ripple.style.height = `${size}px`
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  ripple.classList.add('ripple-effect')
  
  rippleContainer.value.appendChild(ripple)
  
  setTimeout(() => ripple.remove(), 600)
}
</script>

<style scoped>
.calculator-button {
  position: relative;
  overflow: hidden;
  height: 70px;
  font-size: var(--text-xl);
  font-weight: 500;
  border-radius: 8px;
  transition: background-color var(--transition-fast), transform 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-operator);
  color: var(--text-primary);
}

.calculator-button:active {
  transform: scale(0.95);
}

.calculator-button.number {
  background-color: var(--bg-calculator);
}

.calculator-button.function {
  background-color: var(--color-function);
}

.calculator-button.accent {
  background-color: var(--color-accent);
  color: var(--text-on-accent);
}

.calculator-button.is-double {
  grid-column: span 2;
}

.label {
  position: relative;
  z-index: 1;
}

.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

:deep(.ripple-effect) {
  position: absolute;
  border-radius: 50%;
  background-color: var(--ripple-color);
  transform: scale(0);
  animation: ripple 0.6s linear;
  pointer-events: none;
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
</style>
