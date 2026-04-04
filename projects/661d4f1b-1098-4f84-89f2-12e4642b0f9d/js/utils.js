/* Global utilities - must be loaded before other scripts */

/* Debounce helper */
function debounce(fn, wait) {
  var timeout;
  return function() {
    var args = arguments;
    var ctx = this;
    clearTimeout(timeout);
    timeout = setTimeout(function() { fn.apply(ctx, args); }, wait);
  };
}

/* Accessible focus utility: focus and apply visible focus style */
function accessibleFocus(el) {
  if (!el) return;
  el.setAttribute('tabindex', '-1');
  el.focus();
  el.addEventListener('blur', function handler() {
    el.removeAttribute('tabindex');
    el.removeEventListener('blur', handler);
  });
}

/* Simple email validation */
function validateEmail(email) {
  if (typeof email !== 'string') return false;
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/* Safe text insertion to avoid innerHTML risks */
function setText(el, text) {
  if (!el) return;
  el.textContent = text;
}

/* Local storage helpers with try/catch for file:// and browser privacy modes */
function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('storageSet failed', e);
  }
}
function storageGet(key, fallback) {
  try {
    var raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

/* Utility to check if an element is near viewport (for lazy map loading) */
function isNearViewport(el, offset) {
  offset = offset || 300;
  if (!el || !el.getBoundingClientRect) return false;
  var rect = el.getBoundingClientRect();
  return rect.top < (window.innerHeight + offset) && rect.bottom > -offset;
}

/* Simple DOM ready fallback for older browsers */
function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}
