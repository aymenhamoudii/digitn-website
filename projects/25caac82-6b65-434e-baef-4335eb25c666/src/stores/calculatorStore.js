import { defineStore } from 'pinia'

export const useCalculatorStore = defineStore('calculator', {
  state: () => ({
    currentValue: '0',
    previousValue: null,
    operator: null,
    waitingForNextValue: false,
    history: ''
  }),

  actions: {
    appendDigit(digit) {
      if (this.waitingForNextValue) {
        this.currentValue = String(digit)
        this.waitingForNextValue = false
      } else {
        this.currentValue = this.currentValue === '0' ? String(digit) : this.currentValue + digit
      }
    },

    appendDot() {
      if (this.waitingForNextValue) {
        this.currentValue = '0.'
        this.waitingForNextValue = false
        return
      }
      if (!this.currentValue.includes('.')) {
        this.currentValue += '.'
      }
    },

    clear() {
      this.currentValue = '0'
      this.previousValue = null
      this.operator = null
      this.waitingForNextValue = false
      this.history = ''
    },

    setOperator(nextOperator) {
      const inputValue = parseFloat(this.currentValue)

      if (this.operator && this.waitingForNextValue) {
        this.operator = nextOperator
        this.history = `${this.previousValue} ${this.operator}`
        return
      }

      if (this.previousValue === null) {
        this.previousValue = inputValue
      } else if (this.operator) {
        const result = this.calculate(this.previousValue, inputValue, this.operator)
        this.currentValue = String(result)
        this.previousValue = result
      }

      this.waitingForNextValue = true
      this.operator = nextOperator
      this.history = `${this.previousValue} ${this.operator}`
    },

    calculate(prev, curr, op) {
      switch (op) {
        case '+': return prev + curr
        case '-': return prev - curr
        case '*': return prev * curr
        case '/': return curr === 0 ? 'Error' : prev / curr
        default: return curr
      }
    },

    performCalculation() {
      const inputValue = parseFloat(this.currentValue)

      if (this.operator && this.previousValue !== null) {
        const result = this.calculate(this.previousValue, inputValue, this.operator)
        this.history = `${this.previousValue} ${this.operator} ${inputValue} =`
        this.currentValue = String(result)
        this.previousValue = null
        this.operator = null
        this.waitingForNextValue = true
      }
    },

    toggleSign() {
      this.currentValue = String(parseFloat(this.currentValue) * -1)
    },

    percentage() {
      this.currentValue = String(parseFloat(this.currentValue) / 100)
    }
  }
})
