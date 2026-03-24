/**
 * Scientific Calculator
 * A fully functional scientific calculator with history and dark mode support
 */

class ScientificCalculator {
  constructor() {
    // DOM Elements
    this.expressionEl = document.getElementById('expression');
    this.resultEl = document.getElementById('result');
    this.historyList = document.getElementById('historyList');
    this.historyPanel = document.getElementById('historyPanel');
    this.themeToggle = document.getElementById('themeToggle');
    this.clearHistoryBtn = document.getElementById('clearHistory');

    // Calculator State
    this.currentValue = '0';
    this.expression = '';
    this.lastResult = null;
    this.memory = 0;
    this.history = [];
    this.isRadian = true; // Using radians for trig functions

    // Initialize
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadTheme();
    this.loadHistory();
    this.updateDisplay();
  }

  bindEvents() {
    // Button clicks
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleButtonClick(e.currentTarget));
    });

    // Theme toggle
    this.themeToggle.addEventListener('click', () => this.toggleTheme());

    // Clear history
    this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

    // History items click to reuse
    this.historyList.addEventListener('click', (e) => {
      const item = e.target.closest('li');
      if (item) {
        const result = item.dataset.result;
        this.currentValue = result;
        this.expression = result;
        this.updateDisplay();
        this.historyPanel.classList.remove('open');
      }
    });
  }

  handleButtonClick(btn) {
    // Visual feedback
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 150);

    // Get action or value
    const value = btn.dataset.value;
    const action = btn.dataset.action;

    if (value !== undefined) {
      this.handleNumberInput(value);
    } else if (action) {
      this.handleAction(action);
    }
  }

  handleNumberInput(value) {
    // Handle special case for 00
    if (value === '00') {
      if (this.currentValue === '0') return;
      this.currentValue += '00';
    } 
    // Handle decimal point
    else if (value === '.') {
      if (this.currentValue.includes('.')) {
        // Check if we're in a new number after operator
        const lastOperatorIndex = Math.max(
          this.currentValue.lastIndexOf('+'),
          this.currentValue.lastIndexOf('-'),
          this.currentValue.lastIndexOf('×'),
          this.currentValue.lastIndexOf('÷')
        );
        const lastNumber = this.currentValue.slice(lastOperatorIndex + 1);
        if (!lastNumber.includes('.')) {
          this.currentValue += '.';
        }
      } else {
        this.currentValue = this.currentValue === '0' ? '0.' : this.currentValue + '.';
      }
    } 
    // Handle regular numbers
    else {
      if (this.currentValue === '0') {
        this.currentValue = value;
      } else {
        // Check if last result is being replaced
        if (this.lastResult && this.expression === this.lastResult.toString()) {
          this.currentValue = value;
          this.expression = value;
          this.lastResult = null;
        } else {
          this.currentValue += value;
        }
      }
    }

    this.updateDisplay();
  }

  handleAction(action) {
    switch (action) {
      case 'clear':
        this.clearEntry();
        break;
      case 'allClear':
        this.allClear();
        break;
      case 'backspace':
        this.backspace();
        break;
      case 'calculate':
        this.calculate();
        break;
      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
        this.handleOperator(action);
        break;
      case 'openParen':
      case 'closeParen':
        this.handleParenthesis(action);
        break;
      case 'sqrt':
        this.handleFunction('sqrt');
        break;
      case 'pow':
        this.handleFunction('pow');
        break;
      case 'sin':
      case 'cos':
      case 'tan':
        this.handleTrigFunction(action);
        break;
      case 'log':
        this.handleFunction('log');
        break;
      case 'ln':
        this.handleFunction('ln');
        break;
      case 'pi':
        this.handleConstant('pi');
        break;
      case 'e':
        this.handleConstant('e');
        break;
      case 'factorial':
        this.handleFunction('factorial');
        break;
      case 'MC':
        this.memoryClear();
        break;
      case 'MR':
        this.memoryRecall();
        break;
      case 'M+':
        this.memoryAdd();
        break;
    }
  }

  clearEntry() {
    this.currentValue = '0';
    this.updateDisplay();
  }

  allClear() {
    this.currentValue = '0';
    this.expression = '';
    this.lastResult = null;
    this.updateDisplay();
  }

  backspace() {
    if (this.currentValue.length > 1) {
      this.currentValue = this.currentValue.slice(0, -1);
    } else {
      this.currentValue = '0';
    }
    this.updateDisplay();
  }

  handleOperator(operator) {
    const operators = {
      add: '+',
      subtract: '−',
      multiply: '×',
      divide: '÷'
    };

    const symbol = operators[operator];

    // If there's a previous result, use it
    if (this.lastResult !== null && this.expression === this.lastResult.toString()) {
      this.expression = this.lastResult.toString();
      this.currentValue = this.lastResult.toString();
      this.lastResult = null;
    }

    // Check if last char is an operator
    const lastChar = this.expression.slice(-1);
    if (['+', '−', '×', '÷'].includes(lastChar)) {
      // Replace the operator
      this.expression = this.expression.slice(0, -1) + symbol;
      this.currentValue = this.expression;
    } else {
      this.expression += this.currentValue + symbol;
      this.currentValue = this.expression;
    }

    this.updateDisplay();
  }

  handleParenthesis(type) {
    if (type === 'openParen') {
      if (this.currentValue === '0') {
        this.currentValue = '(';
      } else {
        this.currentValue += '(';
      }
    } else {
      this.currentValue += ')';
    }
    this.expression += this.currentValue;
    this.updateDisplay();
  }

  handleFunction(func) {
    const value = parseFloat(this.currentValue);
    let result;

    switch (func) {
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'pow':
        result = value * value;
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'factorial':
        result = this.factorial(value);
        break;
    }

    if (isNaN(result) || !isFinite(result)) {
      this.currentValue = 'Error';
    } else {
      this.addToHistory(`√(${value})`, result);
      this.currentValue = this.formatResult(result);
      this.lastResult = result;
    }
    this.updateDisplay();
  }

  handleTrigFunction(func) {
    const value = parseFloat(this.currentValue);
    let result;

    // Convert to radians if needed (using degrees for standard calculations)
    const radValue = value * (Math.PI / 180);

    switch (func) {
      case 'sin':
        result = Math.sin(radValue);
        break;
      case 'cos':
        result = Math.cos(radValue);
        break;
      case 'tan':
        result = Math.tan(radValue);
        break;
    }

    if (isNaN(result) || !isFinite(result)) {
      this.currentValue = 'Error';
    } else {
      this.addToHistory(`${func}(${value}°)`, result);
      this.currentValue = this.formatResult(result);
      this.lastResult = result;
    }
    this.updateDisplay();
  }

  handleConstant(constant) {
    let value;
    switch (constant) {
      case 'pi':
        value = Math.PI;
        break;
      case 'e':
        value = Math.E;
        break;
    }

    if (this.currentValue === '0') {
      this.currentValue = this.formatResult(value);
    } else {
      this.currentValue += this.formatResult(value);
    }
    this.updateDisplay();
  }

  factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity; // JavaScript max safe integer
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  calculate() {
    try {
      // Prepare expression for evaluation
      let evalExpression = this.expression;
      
      // If there's no expression but there's a current value
      if (!this.expression && this.currentValue !== '0') {
        evalExpression = this.currentValue;
      }

      // Replace display operators with JavaScript operators
      evalExpression = evalExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/π/g, Math.PI.toString())
        .replace(/e(?![xp])/g, Math.E.toString());

      // Handle implicit multiplication (e.g., 2(3) = 6)
      evalExpression = evalExpression.replace(/(\d)\(/g, '$1*(');
      evalExpression = evalExpression.replace(/\)(\d)/g, ')*$1');

      // Evaluate
      const result = Function('"use strict"; return (' + evalExpression + ')')();

      if (isNaN(result) || !isFinite(result)) {
        this.currentValue = 'Error';
      } else {
        this.addToHistory(this.currentValue, result);
        this.expression = result.toString();
        this.currentValue = this.formatResult(result);
        this.lastResult = result;
      }
    } catch (error) {
      this.currentValue = 'Error';
    }

    this.updateDisplay();
  }

  formatResult(num) {
    // Handle very large or very small numbers
    if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-10 && num !== 0)) {
      return num.toExponential(6);
    }

    // Round to avoid floating point errors
    const rounded = Math.round(num * 1e12) / 1e12;
    
    // Format with commas for readability
    if (Number.isInteger(rounded)) {
      return rounded.toLocaleString();
    }

    // Format decimal
    return rounded.toLocaleString(undefined, { 
      maximumFractionDigits: 10,
      minimumFractionDigits: 0
    });
  }

  addToHistory(expression, result) {
    const historyItem = {
      expression: expression,
      result: this.formatResult(result),
      timestamp: Date.now()
    };

    this.history.unshift(historyItem);
    
    // Keep only last 50 items
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50);
    }

    this.saveHistory();
    this.renderHistory();
  }

  renderHistory() {
    if (this.history.length === 0) {
      this.historyList.innerHTML = '<li class="empty">No calculations yet</li>';
      return;
    }

    this.historyList.innerHTML = this.history.map((item, index) => `
      <li data-result="${item.result}">
        <span class="history-expr">${this.escapeHtml(item.expression)}</span>
        <span class="history-result">= ${this.escapeHtml(item.result)}</span>
      </li>
    `).join('');
  }

  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.renderHistory();
  }

  saveHistory() {
    try {
      localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    } catch (e) {
      console.warn('Could not save history to localStorage');
    }
  }

  loadHistory() {
    try {
      const saved = localStorage.getItem('calculatorHistory');
      if (saved) {
        this.history = JSON.parse(saved);
        this.renderHistory();
      }
    } catch (e) {
      console.warn('Could not load history from localStorage');
    }
  }

  // Memory functions
  memoryClear() {
    this.memory = 0;
    this.updateMemoryDisplay();
  }

  memoryRecall() {
    if (this.memory !== 0) {
      this.currentValue = this.formatResult(this.memory);
      this.updateDisplay();
    }
  }

  memoryAdd() {
    const value = parseFloat(this.currentValue.replace(/,/g, ''));
    if (!isNaN(value)) {
      this.memory += value;
      this.updateMemoryDisplay();
    }
  }

  updateMemoryDisplay() {
    // Could add visual indicator for memory state
    console.log('Memory:', this.memory);
  }

  // Theme functions
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('calculatorTheme', newTheme);
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('calculatorTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  }

  // Display update
  updateDisplay() {
    // Show expression (everything before the current number being typed)
    let displayExpression = this.expression;
    
    // Add current value to expression if it's being typed
    if (this.currentValue !== '0' && this.currentValue !== this.expression) {
      // Only show current value if there's no operator at the end
      const lastChar = this.expression.slice(-1);
      if (!['+', '−', '×', '÷'].includes(lastChar)) {
        displayExpression += this.currentValue;
      }
    }
    
    this.expressionEl.textContent = displayExpression;
    this.resultEl.textContent = this.currentValue;
  }

  // Utility
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.calculator = new ScientificCalculator();
});