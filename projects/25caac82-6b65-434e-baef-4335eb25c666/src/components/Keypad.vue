<template>
  <div class="calculator-keypad" @keydown="handleKeyDown" tabindex="0">
    <!-- Row 1 -->
    <CalculatorButton type="function" @click="store.clear">AC</CalculatorButton>
    <CalculatorButton type="function" @click="store.toggleSign">±</CalculatorButton>
    <CalculatorButton type="function" @click="store.percentage">%</CalculatorButton>
    <CalculatorButton type="accent" @click="store.setOperator('/')">÷</CalculatorButton>

    <!-- Row 2 -->
    <CalculatorButton @click="store.appendDigit(7)">7</CalculatorButton>
    <CalculatorButton @click="store.appendDigit(8)">8</CalculatorButton>
    <CalculatorButton @click="store.appendDigit(9)">9</CalculatorButton>
    <CalculatorButton type="accent" @click="store.setOperator('*')">×</CalculatorButton>

    <!-- Row 3 -->
    <CalculatorButton @click="store.appendDigit(4)">4</CalculatorButton>
    <CalculatorButton @click="store.appendDigit(5)">5</CalculatorButton>
    <CalculatorButton @click="store.appendDigit(6)">6</CalculatorButton>
    <CalculatorButton type="accent" @click="store.setOperator('-')">−</CalculatorButton>

    <!-- Row 4 -->
    <CalculatorButton @click="store.appendDigit(1)">1</CalculatorButton>
    <CalculatorButton @click="store.appendDigit(2)">2</CalculatorButton>
    <CalculatorButton @click="store.appendDigit(3)">3</CalculatorButton>
    <CalculatorButton type="accent" @click="store.setOperator('+')">+</CalculatorButton>

    <!-- Row 5 -->
    <CalculatorButton double @click="store.appendDigit(0)">0</CalculatorButton>
    <CalculatorButton @click="store.appendDot">.</CalculatorButton>
    <CalculatorButton type="accent" @click="store.performCalculation">=</CalculatorButton>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useCalculatorStore } from '../stores/calculatorStore'
import CalculatorButton from './CalculatorButton.vue'

const store = useCalculatorStore()

const handleKeyDown = (event) => {
  const { key } = event
  
  if (/[0-9]/.test(key)) store.appendDigit(key)
  else if (key === '.') store.appendDot()
  else if (key === '+') store.setOperator('+')
  else if (key === '-') store.setOperator('-')
  else if (key === '*') store.setOperator('*')
  else if (key === '/') store.setOperator('/')
  else if (key === 'Enter' || key === '=') store.performCalculation()
  else if (key === 'Escape' || key === 'c') store.clear()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.calculator-keypad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--bg-keypad);
  border-radius: 0 0 12px 12px;
  outline: none;
}
</style>
