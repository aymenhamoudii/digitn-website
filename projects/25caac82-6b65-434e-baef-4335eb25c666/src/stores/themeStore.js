import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: 'material-light',
    themes: ['material-light', 'material-dark', 'material-ocean']
  }),

  actions: {
    setTheme(theme) {
      if (this.themes.includes(theme)) {
        this.currentTheme = theme
        document.documentElement.setAttribute('data-theme', theme)
      }
    },
    toggleTheme() {
      const currentIndex = this.themes.indexOf(this.currentTheme)
      const nextIndex = (currentIndex + 1) % this.themes.length
      this.setTheme(this.themes[nextIndex])
    }
  }
})
