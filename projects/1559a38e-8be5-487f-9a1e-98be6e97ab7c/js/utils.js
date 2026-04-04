/* ===================================
   Utility Functions
   =================================== */

const Utils = {
  /**
   * Debounce function to limit execution rate
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function for scroll/resize handlers
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Linear interpolation
   */
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },

  /**
   * Clamp a value between min and max
   */
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  /**
   * Format number with commas
   */
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Animate counting from 0 to target
   */
  animateCounter(element, target, duration = 1500, decimals = 0) {
    const startTime = performance.now();
    const startValue = 0;
    const isDecimal = decimals > 0;
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (target - startValue) * easeOut;
      
      if (isDecimal) {
        element.textContent = currentValue.toFixed(decimals);
      } else {
        element.textContent = this.formatNumber(Math.floor(currentValue));
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        if (isDecimal) {
          element.textContent = target.toFixed(decimals);
        } else {
          element.textContent = this.formatNumber(Math.floor(target));
        }
      }
    };
    
    requestAnimationFrame(updateCounter);
  },

  /**
   * Check if element is in viewport
   */
  isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) - threshold &&
      rect.bottom >= threshold
    );
  },

  /**
   * Add class with animation frame delay for stagger effect
   */
  addClassDelayed(elements, className, baseDelay = 0, delayIncrement = 100) {
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add(className);
      }, baseDelay + (index * delayIncrement));
    });
  },

  /**
   * Remove class from all elements
   */
  removeClassAll(elements, className) {
    elements.forEach(el => el.classList.remove(className));
  },

  /**
   * Get random number between min and max
   */
  random(min, max) {
    return Math.random() * (max - min) + min;
  },

  /**
   * Get random item from array
   */
  randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },

  /**
   * Check localStorage availability
   */
  isLocalStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Safe localStorage get
   */
  getStorageItem(key, defaultValue = null) {
    if (!this.isLocalStorageAvailable()) return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  /**
   * Safe localStorage set
   */
  setStorageItem(key, value) {
    if (!this.isLocalStorageAvailable()) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Make available globally
window.Utils = Utils;
