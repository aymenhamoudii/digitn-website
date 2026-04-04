/**
 * Calculator Engine - Handles mathematical state and logic.
 * No export keywords - all classes and functions are global.
 */

class CalculatorEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.currentInput = '0';
    this.previousOperand = null;
    this.operator = null;
    this.shouldResetScreen = false;
    this.history = this.loadHistory();
  }

  appendNumber(number) {
    if (this.currentInput === '0' || this.shouldResetScreen) {
      this.currentInput = number;
      this.shouldResetScreen = false;
    } else {
      // Limit input length
      if (this.currentInput.length >= 12) return;
      this.currentInput += number;
    }
  }

  appendDecimal() {
    if (this.shouldResetScreen) {
      this.currentInput = '0.';
      this.shouldResetScreen = false;
      return;
    }
    if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
    }
  }

  chooseOperator(operator) {
    if (this.operator !== null) {
      this.compute();
    }
    this.previousOperand = this.currentInput;
    this.operator = operator;
    this.shouldResetScreen = true;
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentInput);

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operator) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '*':
        computation = prev * current;
        break;
      case '/':
        if (current === 0) {
          alert("Cannot divide by zero");
          this.reset();
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    const expression = `${this.previousOperand} ${this.operator} ${this.currentInput} =`;
    const resultStr = this.formatResult(computation);
    
    this.addToHistory(expression, resultStr);
    
    this.currentInput = resultStr;
    this.operator = null;
    this.previousOperand = null;
    this.shouldResetScreen = true;
  }

  formatResult(number) {
    // Avoid precision issues (e.g., 0.1 + 0.2)
    const fixed = parseFloat(number.toFixed(10));
    
    // Handle very large/small numbers with scientific notation
    if (Math.abs(fixed) > 999999999 || (Math.abs(fixed) < 0.0000001 && fixed !== 0)) {
      return fixed.toExponential(4);
    }
    
    return fixed.toString();
  }

  toggleSign() {
    if (this.currentInput === '0') return;
    this.currentInput = (parseFloat(this.currentInput) * -1).toString();
  }

  percent() {
    const current = parseFloat(this.currentInput);
    if (isNaN(current)) return;
    this.currentInput = (current / 100).toString();
  }

  addToHistory(expression, result) {
    const entry = { expression, result, id: Date.now() };
    this.history.unshift(entry);
    if (this.history.length > 50) this.history.pop();
    this.saveHistory();
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem('digitn_calc_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load history', e);
      return [];
    }
  }

  saveHistory() {
    try {
      localStorage.setItem('digitn_calc_history', JSON.stringify(this.history));
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
  }
}

// Global instance
window.calcEngine = new CalculatorEngine();
