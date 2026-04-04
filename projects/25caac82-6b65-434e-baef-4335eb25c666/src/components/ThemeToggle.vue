<template>
  <div class="theme-toggle">
    <button 
      v-for="theme in themeStore.themes" 
      :key="theme"
      class="theme-btn"
      :class="{ active: themeStore.currentTheme === theme }"
      @click="themeStore.setTheme(theme)"
      :aria-label="'Switch to ' + theme + ' theme'"
    >
      <div class="dot" :class="theme"></div>
    </button>
  </div>
</template>

<script setup>
import { useThemeStore } from '../stores/themeStore'

const themeStore = useThemeStore()
</script>

<style scoped>
.theme-toggle {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  background: var(--bg-calculator);
  padding: var(--space-2);
  border-radius: 20px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.theme-btn {
  background: none;
  border: 2px solid transparent;
  padding: 4px;
  border-radius: 50%;
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.theme-btn.active {
  border-color: var(--color-primary);
}

.dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
}

.material-light { background: #6200ee; }
.material-dark { background: #bb86fc; }
.material-ocean { background: #0074d9; }
</style>
