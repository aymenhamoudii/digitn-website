/**
 * Utilities for the DIGITN Calculator.
 * All functions are global scope - no exports.
 */

const Utils = {
  /**
   * Copy text to clipboard using the modern Clipboard API.
   * Fallback for older browsers included.
   */
  async copyToClipboard(text) {
    if (!text) return false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        textArea.remove();
        return successful;
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  },

  /**
   * Format display values to ensure they fit.
   */
  formatDisplay(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    
    // Convert to string and handle formatting
    let str = value.toString();
    
    // Check if it's exponential
    if (str.includes('e')) {
      const parts = str.split('e');
      return `${parseFloat(parts[0]).toFixed(4)}e${parts[1]}`;
    }

    // Truncate if too long (but not for integers)
    if (str.length > 11) {
      if (str.includes('.')) {
        return parseFloat(num.toFixed(8)).toString();
      } else {
        return num.toExponential(4);
      }
    }
    
    return str;
  },

  /**
   * Toast notification system.
   */
  showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  },

  /**
   * Create a DOM element with classes and content.
   */
  createElement(tag, classes = [], content = '') {
    const el = document.createElement(tag);
    if (Array.isArray(classes)) {
      classes.forEach(cls => el.classList.add(cls));
    } else if (typeof classes === 'string') {
      el.classList.add(classes);
    }
    
    if (content) {
      el.innerHTML = content;
    }
    return el;
  }
};

/**
 * Basic tests for calculator utilities.
 * Usually in a separate .test.js file but keeping logic for internal reference.
 */
function runUtilsTests() {
  console.group('Utils Tests');
  
  // Test formatDisplay
  const test1 = Utils.formatDisplay('123.45678912345');
  console.assert(test1.length <= 12, 'formatDisplay should truncate long decimals');
  
  const test2 = Utils.formatDisplay('1000000000000');
  console.assert(test2.includes('e'), 'formatDisplay should use exponential for very large integers');
  
  console.groupEnd();
}
// runUtilsTests(); // Uncomment for manual verification
