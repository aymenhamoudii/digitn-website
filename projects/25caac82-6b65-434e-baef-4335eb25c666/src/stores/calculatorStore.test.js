import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCalculatorStore } from './calculatorStore'

describe('Calculator Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default values', () => {
    const store = useCalculatorStore()
    expect(store.currentValue).toBe('0')
    expect(store.previousValue).toBe(null)
  })

  it('appends digits correctly', () => {
    const store = useCalculatorStore()
    store.appendDigit(5)
    expect(store.currentValue).toBe('5')
    store.appendDigit(3)
    expect(store.currentValue).toBe('53')
  })

  it('performs addition correctly', () => {
    const store = useCalculatorStore()
    store.appendDigit(1)
    store.appendDigit(0)
    store.setOperator('+')
    store.appendDigit(5)
    store.performCalculation()
    expect(store.currentValue).toBe('15')
  })

  it('handles division by zero', () => {
    const store = useCalculatorStore()
    store.appendDigit(1)
    store.setOperator('/')
    store.appendDigit(0)
    store.performCalculation()
    expect(store.currentValue).toBe('Error')
  })

  it('clears state correctly', () => {
    const store = useCalculatorStore()
    store.appendDigit(9)
    store.clear()
    expect(store.currentValue).toBe('0')
    expect(store.previousValue).toBe(null)
  })
})
