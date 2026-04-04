/**
 * Main Application Logic for DIGITN Calculator.
 * Orchestrates event listeners and UI updates.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Select DOM elements
  const currentInputEl = document.getElementById('current-input');
  const prevOperationEl = document.getElementById('prev-operation');
  const historyToggleBtn = document.getElementById('history-toggle');
  const historyPanelEl = document.getElementById('history-panel');
  const historyListEl = document.getElementById('history-list');
  const noHistoryEl = document.getElementById('no-history');
  const copyBtn = document.getElementById('copy-btn');
  const clearHistoryBtn = document.getElementById('clear-history');
  const keypadEl = document.querySelector('.keypad');

  /**
   * Update the calculator UI based on the current state of the engine.
   */
  function updateDisplay() {
    // Sync main input
    currentInputEl.textContent = Utils.formatDisplay(window.calcEngine.currentInput);
    
    // Sync previous operation text
    if (window.calcEngine.operator && window.calcEngine.previousOperand) {
      prevOperationEl.textContent = `${window.calcEngine.previousOperand} ${window.calcEngine.operator}`;
    } else {
      prevOperationEl.textContent = '';
    }
  }

  /**
   * Render the history list from the calculation history.
   */
  function renderHistory() {
    const history = window.calcEngine.history;
    
    if (history.length === 0) {
      historyListEl.innerHTML = '';
      noHistoryEl.style.display = 'block';
      return;
    }

    noHistoryEl.style.display = 'none';
    historyListEl.innerHTML = '';
    
    history.forEach(item => {
      const li = Utils.createElement('li', 'history-item');
      li.dataset.id = item.id;
      
      const expDiv = Utils.createElement('div', 'history-exp', item.expression);
      const resDiv = Utils.createElement('div', 'history-res', item.result);
      
      li.appendChild(expDiv);
      li.appendChild(resDiv);
      
      li.addEventListener('click', () => {
        window.calcEngine.currentInput = item.result;
        window.calcEngine.shouldResetScreen = true;
        updateDisplay();
        Utils.showToast('Result applied');
      });
      
      historyListEl.appendChild(li);
    });
  }

  /**
   * Handle physical keyboard input for the calculator.
   */
  function handleKeyboard(e) {
    const key = e.key;

    if (/[0-9]/.test(key)) {
      window.calcEngine.appendNumber(key);
    } else if (key === '.') {
      window.calcEngine.appendDecimal();
    } else if (['+', '-', '*', '/'].includes(key)) {
      window.calcEngine.chooseOperator(key === '*' ? '×' : (key === '/' ? '÷' : key));
    } else if (key === 'Enter' || key === '=') {
      window.calcEngine.compute();
      renderHistory();
    } else if (key === 'Escape' || key === 'Delete') {
      window.calcEngine.reset();
    } else if (key === 'Backspace') {
      if (window.calcEngine.currentInput.length > 1) {
        window.calcEngine.currentInput = window.calcEngine.currentInput.slice(0, -1);
      } else {
        window.calcEngine.currentInput = '0';
      }
    }
    
    updateDisplay();
  }

  /**
   * Process clicks on keypad buttons using event delegation.
   */
  keypadEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const val = btn.dataset.value;
    const op = btn.dataset.operator;
    const action = btn.dataset.action;

    if (val) {
      if (val === '.') {
        window.calcEngine.appendDecimal();
      } else {
        window.calcEngine.appendNumber(val);
      }
    } else if (op) {
      window.calcEngine.chooseOperator(op);
    } else if (action) {
      switch (action) {
        case 'clear':
          window.calcEngine.reset();
          break;
        case 'toggle-sign':
          window.calcEngine.toggleSign();
          break;
        case 'percent':
          window.calcEngine.percent();
          break;
        case 'calculate':
          window.calcEngine.compute();
          renderHistory();
          break;
      }
    }

    updateDisplay();
  });

  /**
   * Sidebar history toggle.
   */
  historyToggleBtn.addEventListener('click', () => {
    historyPanelEl.classList.toggle('hidden');
    if (!historyPanelEl.classList.contains('hidden')) {
      renderHistory();
    }
  });

  /**
   * Copy to clipboard button.
   */
  copyBtn.addEventListener('click', async () => {
    const successful = await Utils.copyToClipboard(window.calcEngine.currentInput);
    if (successful) {
      Utils.showToast('Result copied!');
    } else {
      Utils.showToast('Failed to copy');
    }
  });

  /**
   * Clear history data.
   */
  clearHistoryBtn.addEventListener('click', () => {
    window.calcEngine.clearHistory();
    renderHistory();
    Utils.showToast('History cleared');
  });

  // Global keyboard listener
  window.addEventListener('keydown', handleKeyboard);

  // Initial state display
  updateDisplay();
  renderHistory();
});
