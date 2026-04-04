// Calculator logic with accessibility and input validation

const display = document.getElementById('display');
const calcButtons = document.getElementById('calcButtons');

let current = '0';
let memory = null;
let operator = null;
let lastPressedEquals = false;

// Utility to format numbers
function formatNum(num) {
  if (num === '' || isNaN(Number(num))) return '0';
  const n = Number(num);
  // Don't format exponential
  if (!isFinite(n) || Math.abs(n) > 999999999) return n.toString();
  return n.toLocaleString('en', { maximumFractionDigits: 6 });
}

// Safely update the display
function updateDisplay(text) {
  display.textContent = text;
}

// Clear all
function clearAll() {
  current = '0';
  memory = null;
  operator = null;
  lastPressedEquals = false;
  updateDisplay(current);
}

// Delete last digit
function deleteDigit() {
  if (lastPressedEquals) return;
  if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
    current = '0';
  } else {
    current = current.slice(0, -1);
  }
  updateDisplay(current);
}

// Append number or decimal
function appendInput(val) {
  if (lastPressedEquals) {
    current = val === '.' ? '0.' : val;
    lastPressedEquals = false;
    updateDisplay(current);
    return;
  }

  if (val === '.') {
    if (current.includes('.')) return;
    current += '.';
  } else {
    if (current === '0') {
      current = val;
    } else {
      current += val;
    }
  }
  updateDisplay(current);
}

// Set operator
function setOperator(op) {
  if (operator && !lastPressedEquals) {
    calcEquals();
  }
  memory = current;
  operator = op;
  lastPressedEquals = false;
  current = '0';
}

// Calculate result
function calcEquals() {
  if (!operator || memory == null) return;
  let result;
  const a = Number(memory);
  const b = Number(current);
  switch (operator) {
    case '+':
      result = a + b;
      break;
    case '-':
      result = a - b;
      break;
    case '*':
      result = a * b;
      break;
    case '/':
      if (b === 0) {
        updateDisplay('Error');
        current = '0';
        memory = null;
        operator = null;
        lastPressedEquals = true;
        return;
      }
      result = a / b;
      break;
    default:
      return;
  }
  current = String(Number(result.toPrecision(12)).toString().replace(/\.0+$/, ''));
  updateDisplay(formatNum(current));
  memory = null;
  operator = null;
  lastPressedEquals = true;
}

// Keyboard support
function handleKey(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key;
  if (key === 'Escape') {
    clearAll();
    e.preventDefault();
  } else if ((key >= '0' && key <= '9')) {
    appendInput(key);
    e.preventDefault();
  } else if (key === '.') {
    appendInput('.');
    e.preventDefault();
  } else if (['/', '*', '-', '+'].includes(key)) {
    setOperator(key);
    e.preventDefault();
  } else if (key === 'Enter' || key === '=') {
    calcEquals();
    e.preventDefault();
  } else if (key === 'Backspace') {
    deleteDigit();
    e.preventDefault();
  }
}

// Button click handler
calcButtons.addEventListener('click', (event) => {
  if (!event.target.matches('button')) return;
  event.target.blur(); // Remove sticky focus
  const value = event.target.getAttribute('data-value');
  const action = event.target.getAttribute('data-action');

  if (action === 'clear') {
    clearAll();
    return;
  }
  if (action === 'delete') {
    deleteDigit();
    return;
  }
  if (action === 'equals') {
    calcEquals();
    return;
  }
  if (value) {
    if (['+', '-', '*', '/'].includes(value)) {
      setOperator(value);
    } else {
      appendInput(value);
    }
    return;
  }
});

// Accessibility: Keyboard support
window.addEventListener('keydown', handleKey);

display.addEventListener('focus', () => {
  display.setAttribute('aria-live', 'off'); // Prevent extra announcements on selection
});
display.addEventListener('blur', () => {
  display.setAttribute('aria-live', 'polite');
});

// Set initial focus for easy keyboard access if on desktop
window.addEventListener('DOMContentLoaded', () => {
  updateDisplay(current);
  if (window.innerWidth > 600) {
    display.focus();
  }
});
