/* Global utilities for First Time Pizza - no modules, global scope only */

/* Format number as currency */
function formatCurrency(value){
  var v = Number(value);
  if(Number.isNaN(v)) return '$0.00';
  return v.toLocaleString(undefined, {style:'currency', currency:'USD'});
}

/* Create element helper */
function createEl(tag, attrs, children){
  var el = document.createElement(tag);
  if(attrs){
    Object.keys(attrs).forEach(function(k){
      if(k === 'class') el.className = attrs[k];
      else if(k === 'text') el.textContent = attrs[k];
      else if(k.indexOf('data-')===0) el.setAttribute(k, attrs[k]);
      else el.setAttribute(k, attrs[k]);
    });
  }
  if(children){
    children.forEach(function(c){
      if(typeof c === 'string') el.appendChild(document.createTextNode(c));
      else el.appendChild(c);
    });
  }
  return el;
}

/* Debounce */
function debounce(fn, wait){
  var t;
  return function(){
    var args = arguments;
    clearTimeout(t);
    t = setTimeout(function(){ fn.apply(null, args); }, wait);
  }
}

/* Local storage wrapper with schema namespace */
var STORAGE_NS = 'ftp_v1_';
function storageSet(key, val){
  try{
    localStorage.setItem(STORAGE_NS + key, JSON.stringify(val));
    return true;
  }catch(e){ console.error('storage set failed', e); return false; }
}
function storageGet(key, fallback){
  try{
    var v = localStorage.getItem(STORAGE_NS + key);
    return v ? JSON.parse(v) : fallback;
  }catch(e){ console.error('storage get failed', e); return fallback; }
}
function storageRemove(key){
  try{ localStorage.removeItem(STORAGE_NS + key); }catch(e){console.error(e)}
}

/* Simple date helpers */
function todayISO(){
  var d = new Date();
  var yyyy = d.getFullYear();
  var mm = String(d.getMonth()+1).padStart(2,'0');
  var dd = String(d.getDate()).padStart(2,'0');
  return yyyy + '-' + mm + '-' + dd;
}
function formatDateReadable(iso){
  try{
    var d = new Date(iso);
    return d.toLocaleString(undefined, {weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'});
  }catch(e){return iso}
}

/* Simple email validation */
function validateEmail(email){
  if(!email) return false;
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/* Sanitize text for safe insertion (textContent recommended) */
function sanitizeText(str){
  if(str === undefined || str === null) return '';
  return String(str);
}

/* Keyboard utilities */
function trapFocus(container){
  var focusable = container.querySelectorAll('a[href],button,textarea,input,select,[tabindex]:not([tabindex="-1"])');
  if(!focusable.length) return function(){};
  var first = focusable[0];
  var last = focusable[focusable.length-1];
  function keyListener(e){
    if(e.key === 'Tab'){
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault(); last.focus();
      }else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault(); first.focus();
      }
    }
    if(e.key === 'Escape'){ container.dispatchEvent(new CustomEvent('close')); }
  }
  container.addEventListener('keydown', keyListener);
  return function(){ container.removeEventListener('keydown', keyListener); };
}

/* Expose simple logger with levels */
function log(){
  if(window.console && console.log) console.log.apply(console, arguments);
}

/* DOM ready helper */
function ready(fn){
  if(document.readyState !== 'loading') fn();
  else document.addEventListener('DOMContentLoaded', fn);
}

/* Export some helpers to window for tests and other scripts */
window.FTP = window.FTP || {};
window.FTP.utils = {
  formatCurrency: formatCurrency,
  createEl: createEl,
  debounce: debounce,
  storageSet: storageSet,
  storageGet: storageGet,
  storageRemove: storageRemove,
  todayISO: todayISO,
  formatDateReadable: formatDateReadable,
  validateEmail: validateEmail,
  sanitizeText: sanitizeText,
  trapFocus: trapFocus,
  log: log,
  ready: ready
};
