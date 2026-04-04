/**
 * UI Features & Utility Functions
 * Handles clipboard access and history persistence/updates
 */
class FeatureManager {
  constructor() {
    this.history = this.loadHistory();
    this.toastTimeout = null;
  }

  loadHistory() {
    try {
      const stored = localStorage.getItem('calc_history');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('History storage not available', e);
      return [];
    }
  }

  saveHistory(record) {
    // Add to top of list
    this.history.unshift(record);
    // Limit to 50 items
    if (this.history.length > 50) this.history.pop();
    
    try {
      localStorage.setItem('calc_history', JSON.stringify(this.history));
    } catch (e) {
      console.warn('Storage failed', e);
    }
    
    this.renderHistory();
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('calc_history');
    this.renderHistory();
  }

  renderHistory() {
    const list = document.getElementById('history-list');
    if (!list) return;

    if (this.history.length === 0) {
      list.innerHTML = '<li class="history-empty">No history yet</li>';
      return;
    }

    list.innerHTML = this.history.map((item, index) => `
      <li class="history-item" data-index="${index}" role="button" tabindex="0">
        <div class="history-exp">${item.prev} ${item.operation} ${item.current} =</div>
        <div class="history-res">${item.result}</div>
      </li>
    `).join('');
  }

  async copyToClipboard(text) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    try {
      // Clean display value (remove commas)
      const cleanText = text.replace(/,/g, '');
      
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(cleanText);
      } else {
        // Fallback for older/non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = cleanText;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }

      this.showToast('Copied to clipboard');
    } catch (err) {
      console.error('Copy failed', err);
      this.showToast('Failed to copy', true);
    }
  }

  showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    clearTimeout(this.toastTimeout);
    
    toast.textContent = message;
    toast.className = 'toast'; // Reset
    if (isError) toast.style.borderColor = 'var(--error)';
    else toast.style.borderColor = 'var(--primary)';
    
    toast.classList.add('show');
    
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  formatOperator(op) {
    const map = {
      '+': '+',
      '-': '−',
      '*': '×',
      '/': '÷'
    };
    return map[op] || op;
  }
}

// Global scope
window.FeatureManager = FeatureManager;
