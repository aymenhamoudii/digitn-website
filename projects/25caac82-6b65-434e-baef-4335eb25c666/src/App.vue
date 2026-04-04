<template>
  <main class="app-container">
    <header class="app-header">
      <h1 class="title">DIGITN</h1>
      <ThemeToggle />
    </header>

    <div class="calculator-card">
      <CalculatorDisplay 
        :value="calculator.currentValue" 
        :history="calculator.history"
      />
      <Keypad />
    </div>

    <footer class="app-footer">
      <p>Material Design Calculator</p>
    </footer>
  </main>
</template>

<script setup>
import { useCalculatorStore } from './stores/calculatorStore'
import CalculatorDisplay from './components/CalculatorDisplay.vue'
import Keypad from './components/Keypad.vue'
import ThemeToggle from './components/ThemeToggle.vue'

const calculator = useCalculatorStore()
</script>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: center;
  padding: var(--space-4);
}

.app-header {
  margin-bottom: var(--space-6);
  text-align: center;
}

.title {
  font-size: var(--text-base);
  letter-spacing: 0.3em;
  color: var(--text-secondary);
  font-weight: 700;
  margin-bottom: var(--space-4);
  text-transform: uppercase;
}

.calculator-card {
  background-color: var(--bg-calculator);
  border-radius: 12px;
  box-shadow: var(--shadow-3);
  transition: box-shadow var(--transition-normal);
}

.app-footer {
  margin-top: var(--space-8);
  text-align: center;
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

@media (max-width: 480px) {
  .app-container {
    padding: 0;
  }
  .calculator-card {
    border-radius: 0;
    box-shadow: none;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .app-header, .app-footer {
    display: none;
  }
  :deep(.calculator-keypad) {
    flex-grow: 1;
    border-radius: 0;
  }
  :deep(.calculator-display) {
    border-radius: 0;
    flex-shrink: 0;
  }
}
</style>
